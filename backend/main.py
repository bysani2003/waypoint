import os
from datetime import date, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from pydantic import BaseModel

from models import User, Subject, Module, Lesson, Exercise, Attempt, ModuleMastery, Interest, DigestItem, AppStreak
from seed_data import SEED_SUBJECT, SEED_MODULES
import spaced_repetition as sr
import llm
import digest_sources
import auth

engine = create_engine("sqlite:///dsa_tutor.db", echo=False)

app = FastAPI(title="Learn Anything Tutor")

# Comma-separated list of allowed origins in production, e.g. "https://waypoint.vercel.app".
# Defaults to "*" for local dev.
_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allowed_origins == "*" else [o.strip() for o in _allowed_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


def _seed_starter_subject(session: Session, user_id: int):
    subject = Subject(user_id=user_id, **SEED_SUBJECT)
    session.add(subject)
    session.flush()
    for i, m in enumerate(SEED_MODULES):
        module = Module(subject_id=subject.id, order_index=i, **m)
        session.add(module)
        session.flush()
        session.add(ModuleMastery(module_id=module.id))


def _bump_streak(session: Session, user_id: int) -> AppStreak:
    streak = session.exec(select(AppStreak).where(AppStreak.user_id == user_id)).first()
    if not streak:
        streak = AppStreak(user_id=user_id)
    today = date.today()
    if streak.last_active_date == today:
        pass  # already practiced today, no change
    elif streak.last_active_date == today - timedelta(days=1):
        streak.current_streak += 1
        streak.last_active_date = today
    else:
        streak.current_streak = 1
        streak.last_active_date = today
    session.add(streak)
    return streak


def _module_statuses(session: Session, modules: list[Module]) -> dict[int, tuple[str, Optional[ModuleMastery]]]:
    """Compute locked/available/in_progress/mastered per module, in roadmap order."""
    out = {}
    previous_started = False
    for i, m in enumerate(modules):
        mastery = session.exec(select(ModuleMastery).where(ModuleMastery.module_id == m.id)).first()
        status = sr.module_status(mastery, is_first=(i == 0), previous_started=previous_started)
        out[m.id] = (status, mastery)
        previous_started = status in ("in_progress", "mastered")
    return out


def _owned_subject(session: Session, subject_id: int, user_id: int) -> Subject:
    subject = session.get(Subject, subject_id)
    if not subject or subject.user_id != user_id:
        raise HTTPException(404, "Subject not found")
    return subject


def _owned_module(session: Session, module_id: int, user_id: int) -> tuple[Module, Subject]:
    module = session.get(Module, module_id)
    if not module:
        raise HTTPException(404, "Module not found")
    subject = _owned_subject(session, module.subject_id, user_id)
    return module, subject


def _owned_exercise(session: Session, exercise_id: int, user_id: int) -> tuple[Exercise, Module, Subject]:
    exercise = session.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(404, "Exercise not found")
    module, subject = _owned_module(session, exercise.module_id, user_id)
    return exercise, module, subject


# ---------- Auth ----------

class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/signup")
def signup(req: SignupRequest):
    email = req.email.strip().lower()
    if len(req.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == email)).first()
        if existing:
            raise HTTPException(409, "An account with that email already exists")
        user = User(email=email, password_hash=auth.hash_password(req.password))
        session.add(user)
        session.flush()
        _seed_starter_subject(session, user.id)
        session.commit()
        session.refresh(user)
        return {"token": auth.create_token(user.id), "user": {"id": user.id, "email": user.email}}


@app.post("/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user or not auth.verify_password(req.password, user.password_hash):
            raise HTTPException(401, "Incorrect email or password")
        return {"token": auth.create_token(user.id), "user": {"id": user.id, "email": user.email}}


@app.get("/auth/me")
def me(user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        user = auth.get_user_or_404(session, user_id)
        return {"id": user.id, "email": user.email}


# ---------- Subjects & roadmaps ----------

class SubjectRequest(BaseModel):
    name: str


@app.post("/subjects")
def create_subject(req: SubjectRequest, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        existing = session.exec(
            select(Subject).where(Subject.user_id == user_id, Subject.name == req.name)
        ).first()
        if existing:
            raise HTTPException(409, "Subject already exists")

        roadmap = llm.generate_roadmap(req.name)
        subject = Subject(user_id=user_id, name=req.name, description=roadmap.get("description", ""))
        session.add(subject)
        session.flush()
        for i, m in enumerate(roadmap["modules"]):
            module = Module(
                subject_id=subject.id,
                order_index=i,
                name=m["name"],
                summary=m.get("summary", ""),
                tag=m.get("tag", ""),
                difficulty=m.get("difficulty", 1),
            )
            session.add(module)
            session.flush()
            session.add(ModuleMastery(module_id=module.id))
        session.commit()
        session.refresh(subject)
        return subject


@app.get("/subjects")
def list_subjects(user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        subjects = session.exec(select(Subject).where(Subject.user_id == user_id)).all()
        out = []
        for s in subjects:
            modules = session.exec(
                select(Module).where(Module.subject_id == s.id).order_by(Module.order_index)
            ).all()
            statuses = _module_statuses(session, modules)
            mastered = sum(1 for st, _ in statuses.values() if st == "mastered")
            due = sum(
                1 for st, m in statuses.values()
                if st in ("in_progress", "mastered") and m is not None and m.next_review_date <= date.today()
            )
            out.append({
                "subject": s,
                "module_count": len(modules),
                "mastered_count": mastered,
                "due_count": due,
            })
        return out


@app.get("/subjects/{subject_id}/roadmap")
def get_roadmap(subject_id: int, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        subject = _owned_subject(session, subject_id, user_id)
        modules = session.exec(
            select(Module).where(Module.subject_id == subject_id).order_by(Module.order_index)
        ).all()
        statuses = _module_statuses(session, modules)
        out = []
        for m in modules:
            status, mastery = statuses[m.id]
            out.append({"module": m, "status": status, "mastery": mastery})
        return {"subject": subject, "modules": out}


@app.get("/summary")
def get_summary(user_id: int = Depends(auth.get_current_user_id)):
    """Home-hero stats: day streak, due count, and overall mastery across every subject."""
    with Session(engine) as session:
        streak = session.exec(select(AppStreak).where(AppStreak.user_id == user_id)).first()
        subjects = session.exec(select(Subject).where(Subject.user_id == user_id)).all()
        total_modules = 0
        mastered = 0
        due = 0
        for s in subjects:
            modules = session.exec(
                select(Module).where(Module.subject_id == s.id).order_by(Module.order_index)
            ).all()
            statuses = _module_statuses(session, modules)
            total_modules += len(modules)
            for status, mastery in statuses.values():
                if status == "mastered":
                    mastered += 1
                if status in ("in_progress", "mastered") and mastery and mastery.next_review_date <= date.today():
                    due += 1
        return {
            "day_streak": streak.current_streak if streak else 0,
            "due_count": due,
            "total_modules": total_modules,
            "mastered_count": mastered,
            "mastery_pct": round((mastered / total_modules) * 100) if total_modules else 0,
        }


@app.get("/due")
def get_due(user_id: int = Depends(auth.get_current_user_id)):
    """Modules due for review today across every subject, per spaced repetition schedule."""
    with Session(engine) as session:
        subjects = session.exec(select(Subject).where(Subject.user_id == user_id)).all()
        out = []
        for s in subjects:
            modules = session.exec(
                select(Module).where(Module.subject_id == s.id).order_by(Module.order_index)
            ).all()
            statuses = _module_statuses(session, modules)
            for m in modules:
                status, mastery = statuses[m.id]
                if status in ("in_progress", "mastered") and mastery is not None and mastery.next_review_date <= date.today():
                    out.append({"subject": s, "module": m, "status": status, "mastery": mastery})
        return out


# ---------- Lessons ----------

@app.post("/modules/{module_id}/lesson")
def get_lesson(module_id: int, user_id: int = Depends(auth.get_current_user_id)):
    """Fetch the cached lesson, generating it on first request."""
    with Session(engine) as session:
        module, subject = _owned_module(session, module_id, user_id)

        lesson = session.exec(select(Lesson).where(Lesson.module_id == module_id)).first()
        if lesson:
            return lesson

        data = llm.generate_lesson(subject.name, module.name, module.summary)
        content = data["content"]
        if data.get("key_points"):
            content += "\n\n### Key points\n" + "\n".join(f"- {p}" for p in data["key_points"])
        lesson = Lesson(module_id=module_id, content=content)
        session.add(lesson)
        session.commit()
        session.refresh(lesson)
        return lesson


@app.post("/modules/{module_id}/lesson/deepen")
def deepen_lesson(module_id: int, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        module, subject = _owned_module(session, module_id, user_id)
        lesson = session.exec(select(Lesson).where(Lesson.module_id == module_id)).first()
        if not lesson:
            raise HTTPException(404, "Generate the base lesson first")

        data = llm.deepen_lesson(subject.name, module.name, lesson.content)
        lesson.content += "\n\n### Going deeper\n" + data["addition"]
        lesson.depth_level += 1
        session.add(lesson)
        session.commit()
        session.refresh(lesson)
        return lesson


# ---------- Exercises ----------

class ExerciseRequest(BaseModel):
    module_id: int
    difficulty: Optional[int] = None
    language: Optional[str] = None


@app.post("/exercises/generate")
def generate_exercise(req: ExerciseRequest, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        module, subject = _owned_module(session, req.module_id, user_id)
        difficulty = req.difficulty or module.difficulty
        previous_titles = session.exec(
            select(Exercise.title).where(Exercise.module_id == module.id)
        ).all()
        data = llm.generate_exercise(
            subject.name, module.name, module.summary, difficulty,
            language=req.language, previous_titles=previous_titles or None,
        )
        kind = data.get("kind", "text")
        exercise = Exercise(
            module_id=module.id,
            title=data["title"],
            prompt=data["prompt"],
            kind=kind,
            language=req.language if kind == "code" else None,
            difficulty=data.get("difficulty", difficulty),
        )
        session.add(exercise)
        session.commit()
        session.refresh(exercise)
        return exercise


class HintRequest(BaseModel):
    hint_level: int
    previous_hints: list[str] = []


@app.post("/exercises/{exercise_id}/hint")
def get_hint(exercise_id: int, req: HintRequest, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        exercise, module, subject = _owned_exercise(session, exercise_id, user_id)
        data = llm.generate_hint(module.name, exercise.prompt, req.hint_level, req.previous_hints)
        return data


class SubmitRequest(BaseModel):
    exercise_id: int
    answer: str
    explanation: Optional[str] = None
    hints_used: int = 0


@app.post("/exercises/submit")
def submit_answer(req: SubmitRequest, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        exercise, module, subject = _owned_exercise(session, req.exercise_id, user_id)

        review = llm.review_answer(module.name, exercise.prompt, exercise.kind, req.answer)
        walkthrough = llm.generate_walkthrough(module.name, exercise.prompt, exercise.kind, exercise.language)

        understanding_score = None
        exp_feedback = None
        if req.explanation:
            exp_result = llm.evaluate_explanation(module.name, module.summary, req.explanation)
            understanding_score = exp_result["understanding_score"]
            exp_feedback = exp_result["feedback"] + "\nFollow-up: " + exp_result.get("follow_up_question", "")

        correctness = review["correctness_score"]
        combined = correctness if understanding_score is None else (correctness + understanding_score) / 2
        # Using a hint costs a little mastery credit -- you got there, but with help.
        combined = max(0.0, combined - 0.05 * req.hints_used)

        attempt = Attempt(
            exercise_id=exercise.id,
            module_id=module.id,
            submitted_answer=req.answer,
            explanation_text=req.explanation,
            review_feedback=review["feedback"],
            walkthrough=walkthrough["walkthrough"],
            correctness_score=correctness,
            understanding_score=understanding_score,
            hints_used=req.hints_used,
        )
        session.add(attempt)

        mastery = session.exec(
            select(ModuleMastery).where(ModuleMastery.module_id == module.id)
        ).first()
        mastery = sr.update_mastery(mastery, combined)
        session.add(mastery)
        app_streak = _bump_streak(session, user_id)

        session.commit()
        return {
            "review": review,
            "walkthrough": walkthrough["walkthrough"],
            "explanation_feedback": exp_feedback,
            "combined_score": combined,
            "next_review_date": mastery.next_review_date,
            "streak": mastery.streak,
            "day_streak": app_streak.current_streak,
            "subject_name": subject.name,
            "module_name": module.name,
        }


# ---------- Progress ----------

@app.get("/progress")
def get_progress(user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        subjects = session.exec(select(Subject).where(Subject.user_id == user_id)).all()
        out = []
        for s in subjects:
            modules = session.exec(
                select(Module).where(Module.subject_id == s.id).order_by(Module.order_index)
            ).all()
            statuses = _module_statuses(session, modules)
            rows = []
            for m in modules:
                status, mastery = statuses[m.id]
                rows.append({
                    "module": m.name,
                    "tag": m.tag,
                    "status": status,
                    "streak": mastery.streak if mastery else 0,
                    "last_score": mastery.last_score if mastery else None,
                    "next_review_date": mastery.next_review_date if mastery else None,
                    "repetitions": mastery.repetitions if mastery else 0,
                })
            out.append({"subject": s.name, "subject_id": s.id, "modules": rows})
        return out


# ---------- Interests & daily digest ----------

class InterestRequest(BaseModel):
    keyword: str


@app.post("/interests")
def add_interest(req: InterestRequest, user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        session.add(Interest(user_id=user_id, keyword=req.keyword))
        session.commit()
        return {"ok": True}


@app.get("/interests")
def list_interests(user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        return session.exec(
            select(Interest).where(Interest.user_id == user_id, Interest.active == True)
        ).all()


@app.get("/digest/today")
def get_todays_digest(user_id: int = Depends(auth.get_current_user_id)):
    with Session(engine) as session:
        items = session.exec(
            select(DigestItem).where(DigestItem.user_id == user_id, DigestItem.date_created == date.today())
        ).all()
        return items


class DigestBuildRequest(BaseModel):
    articles: list[dict]  # [{"title":..,"url":..,"snippet":..}] gathered by the caller (e.g. via web search)


def _curate_and_store(session: Session, user_id: int, articles: list[dict]) -> list[DigestItem]:
    interests = [i.keyword for i in session.exec(
        select(Interest).where(Interest.user_id == user_id, Interest.active == True)
    ).all()] or ["AI", "software engineering", "learning science"]

    curated = llm.summarize_digest(articles, interests)
    items = []
    for c in curated:
        item = DigestItem(
            user_id=user_id,
            headline=c["headline"],
            summary=c["summary"],
            source_url=c.get("source_url"),
            category=c.get("category", "general"),
        )
        session.add(item)
        items.append(item)
    session.commit()
    for i in items:
        session.refresh(i)
    return items


@app.post("/digest/build")
def build_digest(req: DigestBuildRequest, user_id: int = Depends(auth.get_current_user_id)):
    """
    Takes raw article candidates (fetch these upstream via web search / RSS -- kept out of the
    backend so it stays free of hardcoded news-source scraping) and has the LLM filter +
    summarize them against the user's interests.
    """
    with Session(engine) as session:
        return _curate_and_store(session, user_id, req.articles)


@app.post("/digest/refresh")
def refresh_digest(user_id: int = Depends(auth.get_current_user_id)):
    """
    Pulls fresh articles from free, no-API-key sources (Hacker News + Dev.to) and curates
    them against the user's interests. No external API key or paid service required.
    """
    articles = digest_sources.fetch_free_articles()
    if not articles:
        raise HTTPException(502, "Could not reach any article sources right now")
    with Session(engine) as session:
        return _curate_and_store(session, user_id, articles)

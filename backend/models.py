"""
Database schema for the adaptive tutor.

Core idea:
- User          -> an account; everything below is scoped to one
- Subject       -> anything the user wants to learn (e.g. "Linear Algebra", "Spanish", "DSA Patterns")
- Module        -> one waypoint on a Subject's roadmap (a concept/unit), ordered
- Lesson        -> in-depth teaching content for a Module, generated once and cached, extendable via "go deeper"
- Exercise      -> a practice question tied to a Module (code or free-text, decided by the LLM per subject)
- Attempt       -> one time the user tried an Exercise (answer + review + walkthrough + score)
- ModuleMastery -> spaced-repetition state per Module (SM-2 style)
- Interest      -> free-text interests used to personalize the news digest
- DigestItem    -> a generated daily news/summary entry
- AppStreak     -> daily practice streak, one row per user
"""
from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Subject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str                                                # e.g. "Linear Algebra"
    description: str = ""                                   # one-line description, LLM-written on creation
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Module(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    subject_id: int = Field(foreign_key="subject.id")
    order_index: int = Field(default=0)                     # position on the roadmap, fundamentals -> advanced
    name: str                                                 # e.g. "Eigenvalues & Eigenvectors"
    summary: str = ""                                         # short teaser
    tag: str = ""                                             # loose grouping label, e.g. "Foundations"
    difficulty: int = Field(default=1)                        # 1-5


class Lesson(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="module.id", unique=True)
    content: str                                              # markdown, LLM-generated
    depth_level: int = Field(default=1)                       # incremented each time "go deeper" is used
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="module.id")
    title: str
    prompt: str
    kind: str = Field(default="text")                         # "code" | "text" -- drives UI + review prompt
    language: Optional[str] = None                             # e.g. "python", "cpp", "java" -- only for kind="code"
    difficulty: int = Field(default=1)


class Attempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exercise_id: int = Field(foreign_key="exercise.id")
    module_id: int = Field(foreign_key="module.id")
    submitted_answer: str
    explanation_text: Optional[str] = None                    # user's Socratic explain-back
    review_feedback: Optional[str] = None
    walkthrough: Optional[str] = None                          # full reference solution/reasoning, shown after
    correctness_score: Optional[float] = None                  # 0-1
    understanding_score: Optional[float] = None                 # 0-1, from explain-back
    hints_used: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ModuleMastery(SQLModel, table=True):
    """SM-2 style spaced repetition state, one row per module."""
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="module.id", unique=True)
    ease_factor: float = Field(default=2.5)
    interval_days: int = Field(default=1)
    repetitions: int = Field(default=0)
    next_review_date: date = Field(default_factory=date.today)
    last_score: Optional[float] = None                          # last quality 0-1
    streak: int = Field(default=0)


class Interest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    keyword: str = Field(index=True)                            # e.g. "LLM agents", "Rust"
    active: bool = Field(default=True)


class DigestItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    date_created: date = Field(default_factory=date.today)
    headline: str
    summary: str
    source_url: Optional[str] = None
    category: str = "general"


class AppStreak(SQLModel, table=True):
    """Daily practice streak, one row per user."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    last_active_date: Optional[date] = None
    current_streak: int = Field(default=0)

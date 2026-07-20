"""
All LLM calls live here. Uses the Google Gemini API (free tier).
Set GEMINI_API_KEY in your environment or a .env file.
Get a free key at https://aistudio.google.com/apikey
"""
import os
import json
from typing import Optional
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-flash-lite-latest"  # free-tier quota confirmed working


def _call(system: str, user: str, max_tokens: int = 2500) -> str:
    resp = client.models.generate_content(
        model=MODEL,
        contents=user,
        config={
            "system_instruction": system,
            "max_output_tokens": max_tokens,
        },
    )
    return resp.text


def _json(system: str, user: str, max_tokens: int = 2500) -> dict:
    raw = _call(system, user, max_tokens)
    return json.loads(raw.strip().strip("`").removeprefix("json").strip())


# ---------- Roadmap ----------

def generate_roadmap(subject_name: str) -> dict:
    """
    Build a full learning roadmap for ANY subject the user names -- not just DSA.
    Ordered fundamentals -> advanced, sized to the subject's real breadth.
    """
    system = (
        "You are a master teacher designing a curriculum. Given a subject someone wants to "
        "learn deeply, break it into an ordered sequence of modules, from true fundamentals to "
        "advanced/expert material -- enough modules to actually cover the subject in depth "
        "(typically 6-14, use your judgment). Each module should be a single teachable concept, "
        "not a vague chapter. Order strictly matters: each module should build on the previous. "
        "Respond ONLY with JSON: "
        '{"description": str (one sentence on what this subject covers), '
        '"modules": [{"name": str, "summary": str (1-2 sentences), "tag": str (short grouping '
        'label like a chapter/category name), "difficulty": int 1-5}]}. No markdown fences.'
    )
    user = f"Subject: {subject_name}"
    return _json(system, user, max_tokens=3000)


# ---------- Lessons (teach before you test) ----------

def generate_lesson(subject_name: str, module_name: str, module_summary: str) -> dict:
    """
    A real lesson, not a summary: explain the concept from first principles, work through
    at least one concrete example, and -- where the subject is technical/mathematical --
    show the derivation or proof, not just the result. Depth is the whole point.
    """
    system = (
        "You are an expert tutor writing a lesson a motivated student will actually read before "
        "practicing. Do not just define the concept -- build intuition for WHY it works, walk "
        "through at least one fully worked concrete example step by step, and if the subject is "
        "mathematical, scientific, or has an underlying mechanism, INCLUDE THE DERIVATION or "
        "proof, not just the stated result. Assume the reader wants to actually understand this "
        "at a deep level, not skim it. Use markdown: headings, bold for key terms, code blocks "
        "for code, math written out in plain notation (no LaTeX). Respond ONLY with JSON: "
        '{"content": str (the full lesson in markdown, 400-700 words), '
        '"key_points": [str, str, ...] (3-5 crisp takeaways)}. No markdown fences around the JSON itself.'
    )
    user = f"Subject: {subject_name}\nModule: {module_name}\nModule summary: {module_summary}"
    return _json(system, user, max_tokens=3000)


def deepen_lesson(subject_name: str, module_name: str, existing_content: str) -> dict:
    """Called when the user hits 'go deeper' -- adds real additional depth, not a rehash."""
    system = (
        "The student has already read the lesson below and wants to go deeper: more rigor, "
        "the underlying derivation/proof if one wasn't fully shown, edge cases, why alternative "
        "approaches fail, or how this connects to more advanced material. Do not repeat what's "
        "already covered. Respond ONLY with JSON: "
        '{"addition": str (markdown, 250-450 words of genuinely new depth)}. No markdown fences.'
    )
    user = f"Subject: {subject_name}\nModule: {module_name}\n\nExisting lesson:\n{existing_content}"
    return _json(system, user, max_tokens=2000)


# ---------- Practice ----------

def generate_exercise(
    subject_name: str,
    module_name: str,
    module_summary: str,
    difficulty: int,
    language: Optional[str] = None,
    previous_titles: Optional[list[str]] = None,
) -> dict:
    """
    Generate a practice exercise appropriate to the SUBJECT, not assumed to be code.
    The LLM decides whether "code" or free-text "text" answer format fits (e.g. code for a
    programming pattern, text for a derivation, translation, or conceptual question).
    A module usually covers several distinct sub-patterns/variations -- previous_titles is used
    to steer toward a genuinely different variation each time, not the same problem reworded.
    """
    system = (
        "You are a tutor generating ONE original practice exercise for a module the student just "
        "studied. Choose whichever answer format actually fits the subject: 'code' if it's a "
        "programming topic, 'text' for math derivations, language exercises, conceptual "
        "questions, etc. A module usually covers multiple distinct sub-patterns or variations -- "
        "if previous exercises are listed, pick a genuinely different sub-pattern or angle this "
        "time, not a reskin of the same one. Make it require applying the concept, not reciting "
        "it. Respond ONLY with JSON: "
        '{"title": str, "prompt": str, "kind": "code" or "text", "difficulty": int}. No markdown fences.'
    )
    user = (
        f"Subject: {subject_name}\nModule: {module_name}\nModule summary: {module_summary}\n"
        f"Target difficulty (1-5): {difficulty}"
    )
    if language:
        user += f"\nIf this is a coding exercise, it MUST be written to be solved in {language}."
    if previous_titles:
        user += f"\nExercises already given for this module (pick a different sub-pattern than these): {json.dumps(previous_titles)}"
    return _json(system, user)


def generate_hint(module_name: str, exercise_prompt: str, hint_level: int, previous_hints: list[str]) -> dict:
    """Progressive hints: level 1 = nudge, level 2 = concrete direction, level 3 = near-solution."""
    system = (
        "You give progressive hints for a practice exercise, without giving away the full "
        "solution unless this is hint level 3 or higher (then you may get very concrete). Never "
        "repeat a previous hint's content. Respond ONLY with JSON: {\"hint\": str}. No markdown fences."
    )
    user = (
        f"Module: {module_name}\nExercise:\n{exercise_prompt}\n\n"
        f"This is hint level {hint_level}. Previous hints already given: {json.dumps(previous_hints)}"
    )
    return _json(system, user, max_tokens=500)


def review_answer(module_name: str, exercise_prompt: str, kind: str, answer: str) -> dict:
    """Review a submitted answer -- works for code or free-text, judged appropriately to kind."""
    if kind == "code":
        system = (
            "You are reviewing a candidate's code solution like a senior interviewer. Check "
            "correctness against edge cases, time/space complexity, and code quality. Be direct "
            "about bugs. Respond ONLY with JSON: "
            '{"feedback": str, "correctness_score": float between 0 and 1, '
            '"time_complexity": str, "space_complexity": str}. No markdown fences.'
        )
    else:
        system = (
            "You are grading a student's written answer to a practice exercise. Check it for "
            "correctness and depth of understanding, not just a right final answer -- did they "
            "show real reasoning? Be direct about gaps. Respond ONLY with JSON: "
            '{"feedback": str, "correctness_score": float between 0 and 1}. No markdown fences.'
        )
    user = f"Module: {module_name}\nExercise:\n{exercise_prompt}\n\nStudent's answer:\n{answer}"
    result = _json(system, user)
    result.setdefault("time_complexity", None)
    result.setdefault("space_complexity", None)
    return result


def generate_walkthrough(module_name: str, exercise_prompt: str, kind: str, language: Optional[str] = None) -> dict:
    """Full reference solution shown AFTER submission, regardless of how the student did."""
    system = (
        "Write the full reference solution to this exercise as a step-by-step walkthrough a "
        "student reviews after submitting their own attempt. Explain the reasoning at each step, "
        "not just the final answer -- if it's mathematical, show the derivation. Use markdown, "
        "code blocks if it's a coding exercise. Respond ONLY with JSON: "
        '{"walkthrough": str (markdown, 200-450 words)}. No markdown fences.'
    )
    user = f"Module: {module_name}\nExercise ({kind}):\n{exercise_prompt}"
    if kind == "code" and language:
        user += f"\nWrite the solution code in {language}."
    return _json(system, user, max_tokens=2000)


def evaluate_explanation(module_name: str, module_summary: str, user_explanation: str) -> dict:
    """Socratic check: does the user actually understand the concept, not just the mechanics."""
    system = (
        "You are testing whether a student truly understands a concept, not just whether they "
        "got an answer. Ask yourself: could they apply this to a NEW situation they haven't "
        "seen? Respond ONLY with JSON: "
        '{"understanding_score": float between 0 and 1, "feedback": str, '
        '"follow_up_question": str}. No markdown fences.'
    )
    user = (
        f"Module: {module_name}\nCorrect summary: {module_summary}\n\n"
        f"Student's explanation in their own words:\n{user_explanation}"
    )
    return _json(system, user)


# ---------- Digest ----------

def summarize_digest(raw_articles: list[dict], interests: list[str]) -> list[dict]:
    """
    raw_articles: [{"title":.., "url":.., "snippet":..}, ...] pulled from web search upstream.
    Returns a filtered + summarized list personalized to interests.
    """
    system = (
        "You curate a short daily digest for someone with the given learning interests. From "
        "the given articles, pick the most relevant/important ones (max 6), and write a "
        "2-sentence summary each in your own words. Respond ONLY with JSON list: "
        '[{"headline": str, "summary": str, "source_url": str, "category": str}]. '
        "No markdown fences."
    )
    user = f"Interests: {', '.join(interests)}\n\nArticles:\n{json.dumps(raw_articles)}"
    raw = _call(system, user, max_tokens=2000)
    return json.loads(raw.strip().strip("`").removeprefix("json").strip())

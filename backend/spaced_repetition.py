"""
SM-2 spaced repetition, adapted for module mastery instead of flashcards.

Quality input is a 0-1 float derived from (correctness_score + understanding_score) / 2:
  >= 0.85 -> quality 5 (easy, push interval way out)
  >= 0.65 -> quality 4 (good)
  >= 0.45 -> quality 3 (borderline pass)
  >= 0.25 -> quality 2 (struggled, short interval)
  <  0.25 -> quality 0 (failed, reset repetitions, review tomorrow)
"""
from datetime import date, timedelta
from typing import Optional
from models import ModuleMastery


def score_to_quality(score: float) -> int:
    if score >= 0.85:
        return 5
    if score >= 0.65:
        return 4
    if score >= 0.45:
        return 3
    if score >= 0.25:
        return 2
    return 0


def update_mastery(mastery: ModuleMastery, combined_score: float) -> ModuleMastery:
    quality = score_to_quality(combined_score)
    mastery.last_score = combined_score

    if quality < 3:
        # Failed / weak: reset repetition count, review again very soon.
        mastery.repetitions = 0
        mastery.interval_days = 1
        mastery.streak = 0
    else:
        mastery.streak += 1
        if mastery.repetitions == 0:
            mastery.interval_days = 1
        elif mastery.repetitions == 1:
            mastery.interval_days = 6
        else:
            mastery.interval_days = round(mastery.interval_days * mastery.ease_factor)
        mastery.repetitions += 1

    # Ease factor update (standard SM-2 formula), floor at 1.3
    ef = mastery.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    mastery.ease_factor = max(1.3, ef)

    mastery.next_review_date = date.today() + timedelta(days=mastery.interval_days)
    return mastery


def due_masteries(all_mastery: list[ModuleMastery]) -> list[ModuleMastery]:
    today = date.today()
    return [m for m in all_mastery if m.next_review_date <= today]


def module_status(mastery: Optional[ModuleMastery], is_first: bool, previous_started: bool) -> str:
    """locked | available | in_progress | mastered -- computed on read, not stored.

    A module unlocks once the PREVIOUS module has actually been started (>=1 attempt),
    not merely made available -- otherwise the whole roadmap unlocks in one pass.
    """
    if mastery is not None and mastery.repetitions >= 2 and (mastery.last_score or 0) >= 0.85:
        return "mastered"
    if mastery is not None and mastery.repetitions >= 1:
        return "in_progress"
    return "available" if (is_first or previous_started) else "locked"

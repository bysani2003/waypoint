"""
Free, no-API-key sources for the daily digest. Kept separate from main.py so the
fetch strategy can be swapped out without touching the curation/build logic.
"""
import httpx

HN_TOP = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM = "https://hacker-news.firebaseio.com/v0/item/{id}.json"
DEVTO_ARTICLES = "https://dev.to/api/articles"


def fetch_hn_articles(limit: int = 10) -> list[dict]:
    with httpx.Client(timeout=10) as client:
        ids = client.get(HN_TOP).json()[:limit]
        articles = []
        for item_id in ids:
            item = client.get(HN_ITEM.format(id=item_id)).json() or {}
            if item.get("title"):
                articles.append({
                    "title": item["title"],
                    "url": item.get("url", f"https://news.ycombinator.com/item?id={item_id}"),
                    "snippet": f"{item.get('score', 0)} points, {item.get('descendants', 0)} comments on Hacker News",
                })
        return articles


def fetch_devto_articles(tag: str = "", limit: int = 10) -> list[dict]:
    params = {"per_page": limit, "top": 3}
    if tag:
        params["tag"] = tag
    with httpx.Client(timeout=10) as client:
        items = client.get(DEVTO_ARTICLES, params=params).json()
        return [
            {
                "title": i["title"],
                "url": i["url"],
                "snippet": i.get("description") or "",
            }
            for i in items
        ]


def fetch_free_articles() -> list[dict]:
    articles = []
    try:
        articles += fetch_hn_articles(10)
    except Exception:
        pass
    try:
        articles += fetch_devto_articles("ai", 6)
        articles += fetch_devto_articles("programming", 6)
    except Exception:
        pass
    return articles

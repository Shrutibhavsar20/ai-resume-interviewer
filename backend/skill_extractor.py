import re

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None


def _simple_tokenize(text: str):
    class Token:
        def __init__(self, t):
            self.text = t
    return [Token(t) for t in text.split()]


def extract_skills(text: str, skills_list: list):
    """Extract skills from resume text using exact phrase matching.

    Supports multi-word skills (e.g. "react native", "machine learning").
    Falls back to spaCy/simple tokenization for token-level checks if needed.
    Also extracts terms from an explicit "Skills" section, even if not in skills_list.
    """
    txt = text.lower()
    normalized_skills = [s.strip().lower() for s in skills_list if s and s.strip()]

    found_skills = set()
    # Prefer phrase-based matching so multi-word skills are detected.
    for skill in sorted(set(normalized_skills), key=lambda s: -len(s)):
        if not skill:
            continue
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, txt):
            found_skills.add(skill)

    # Add explicit lines from a common resume skills section even if they are not in skills_list.
    section_search = re.search(r"(technical skills|skills|tools)[:\n]+(.+?)(?:\n\n|$)", text, re.IGNORECASE | re.DOTALL)
    if section_search:
        section_text = section_search.group(2)
        for item in re.split(r"[\n,;•·]+", section_text):
            cleaned = item.strip().lower()
            if cleaned and len(cleaned) > 1:
                # keep short and meaningful tokens
                if cleaned not in {"and", "or", "with", "experience", "knowledge"}:
                    found_skills.add(cleaned)

    # If no known skills found, fallback to token-level an approximate extraction from resume text.
    if not found_skills:
        doc = nlp(txt) if nlp is not None else _simple_tokenize(txt)
        stopwords = {"and", "or", "the", "a", "an", "in", "on", "for", "with", "to", "of", "by", "using", "from", "skills", "experience"}
        for token in doc:
            t = token.text.lower()
            if len(t) >= 3 and t not in stopwords and re.match(r"^[a-z][a-z0-9.+#-]*$", t):
                found_skills.add(t)
            if len(found_skills) >= 25:
                break

    return sorted(found_skills)



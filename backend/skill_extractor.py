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
    """Extract skills — uses spaCy if available, otherwise simple tokenization."""
    txt = text.lower()
    doc = nlp(txt) if nlp is not None else _simple_tokenize(txt)
    found_skills = set()

    for token in doc:
        if token.text in skills_list:
            found_skills.add(token.text)

    return list(found_skills)

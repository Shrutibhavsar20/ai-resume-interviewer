import spacy

nlp = spacy.load("en_core_web_sm")

def extract_skills(text: str, skills_list: list):
    doc = nlp(text.lower())
    found_skills = set()

    for token in doc:
        if token.text in skills_list:
            found_skills.add(token.text)

    return list(found_skills)

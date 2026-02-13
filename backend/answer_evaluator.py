import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-2.5-flash:generateContent"
)

def evaluate_answer(question: str, answer: str):
    prompt = f"""
You are an interview evaluator.

Respond ONLY in valid JSON.
Do NOT use markdown.
Do NOT add extra text.

Return exactly this JSON structure:
{{
  "score": number between 0 and 10,
  "summary": "1–2 line evaluation summary",
  "mistakes": ["list of mistakes"],
  "improvements": ["list of improvements"],
  "sample_answer": "short ideal answer"
}}

Question:
{question}

Candidate Answer:
{answer}
"""

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    response = requests.post(
        f"{GEMINI_URL}?key={API_KEY}",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    response.raise_for_status()

    raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    import json
    return json.loads(raw_text)

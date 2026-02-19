import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

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

    response = requests.post(
        f"{OLLAMA_API_URL}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        headers={"Content-Type": "application/json"}
    )

    response.raise_for_status()
    response_data = response.json()
    raw_text = response_data.get("response", "")
    return json.loads(raw_text)

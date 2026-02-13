import os
import requests
from dotenv import load_dotenv
from backend.session import SESSION

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-2.5-flash:generateContent"
)

def chat_with_interviewer(user_message: str):
    import json
    import requests

    # 1️⃣ FIRST QUESTION (when interview starts)
    if SESSION["current_question"] is None:
        prompt = f"""
You are a technical interviewer.

Respond ONLY in valid JSON.
Do NOT add markdown, backticks, or extra text.

Return exactly:
{{
  "next_question": "one clear interview question"
}}

Candidate skills:
{', '.join(SESSION['skills'])}
"""
    else:
        # 2️⃣ USER ANSWERING A QUESTION
        prompt = f"""
You are a technical interviewer.

Respond ONLY in valid JSON.
Do NOT add markdown, backticks, or extra text.

Return exactly:
{{
  "score": number between 0 and 10,
  "feedback": "short feedback (1–2 lines)",
  "next_question": "next interview question"
}}

Previous Question:
{SESSION['current_question']}

Candidate Answer:
{user_message}
"""

    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(
        f"{GEMINI_URL}?key={API_KEY}",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    response.raise_for_status()

    # 🔹 Extract text
    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    # 🔹 CLEAN MARKDOWN IF GEMINI ADDS ```json
    text = text.strip()
    if text.startswith("```"):
        text = (
            text.replace("```json", "")
            .replace("```", "")
            .strip()
        )

    # 🔹 SAFE JSON PARSING
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {
            "error": "LLM returned invalid JSON",
            "raw_response": text
        }

    # 3️⃣ HANDLE FIRST QUESTION RESPONSE
    if SESSION["current_question"] is None:
        SESSION["current_question"] = data["next_question"]
        return {"question": data["next_question"]}

    # 4️⃣ SAVE HISTORY
    SESSION["history"].append({
        "question": SESSION["current_question"],
        "answer": user_message,
        "score": data["score"]
    })

    SESSION["current_question"] = data["next_question"]

    return data


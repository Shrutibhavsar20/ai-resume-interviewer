import os
import json
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
    # 1️⃣ BUILD PROMPT
    if SESSION["current_question"] is None:
        # First question
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
        # Answer evaluation
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

    # 2️⃣ CALL GEMINI SAFELY
    try:
        response = requests.post(
            f"{GEMINI_URL}?key={API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=20
        )

        # 🚨 HANDLE RATE LIMIT
        if response.status_code == 429:
            return {
                "error": "AI service is busy. Please wait 1–2 minutes and try again."
            }

        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        return {
            "error": "Failed to contact AI service",
            "details": str(e)
        }

    # 3️⃣ EXTRACT RESPONSE TEXT
    try:
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        return {
            "error": "Unexpected AI response format"
        }

    # 4️⃣ CLEAN MARKDOWN IF PRESENT
    text = text.strip()
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    # 5️⃣ PARSE JSON SAFELY
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {
            "error": "AI returned invalid JSON",
            "raw_response": text
        }

    # 6️⃣ HANDLE FIRST QUESTION
    if SESSION["current_question"] is None:
        SESSION["current_question"] = data["next_question"]
        return {
            "question": data["next_question"]
        }

    # 7️⃣ SAVE INTERVIEW HISTORY
    SESSION["history"].append({
        "question": SESSION["current_question"],
        "answer": user_message,
        "score": data.get("score", 0)
    })

    # 8️⃣ UPDATE CURRENT QUESTION
    SESSION["current_question"] = data["next_question"]

    return data

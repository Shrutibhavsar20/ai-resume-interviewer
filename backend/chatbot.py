import os
import json
import requests
from dotenv import load_dotenv
from backend.session import SESSION

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")


def chat_with_interviewer(user_message: str, level: str = "medium"):
    """
    level: junior | mid | senior
    """
    # If no explicit skills were extracted, fall back to resume text tokens.
    if not SESSION.get("skills") and SESSION.get("resume_text"):
        import re
        tokens = re.findall(r"\b[a-zA-Z0-9_+-]{3,}\b", SESSION["resume_text"].lower())
        filtered = [t for t in tokens if t not in {"and","with","for","the","your","this","that","from","in","on","at","an","a","to","of","is","are","as","by"}]
        SESSION["skills"] = list(dict.fromkeys(filtered))[:12]

    if not SESSION.get("skills"):
        return {
            "error": "Please upload resume first",
            "question": "Please go back and upload your resume to start the interview."
        }

    # 1️⃣ BUILD PROMPT
    if SESSION["current_question"] is None:
        prompt = f"""You are a technical interviewer. Ask ONE clear, concise interview question.

Candidate skill level: {level}
Candidate skills: {', '.join(SESSION['skills'])}

Your response should ONLY be valid JSON (no markdown, no code blocks):
{{
  "question": "Ask ONE technical interview question appropriate for {level} level"
}}"""
    else:
        prompt = f"""You are a strict technical interviewer evaluating candidates for software engineering roles.

Your responsibilities:

Evaluate answers based on:
Technical accuracy
Completeness
Clarity
Depth (mid-level expected)

Scoring rules:
0–3: Incorrect or irrelevant answer
4–5: Partially correct but missing key concepts
6–7: Mostly correct but lacks depth or clarity
8–9: Strong answer with minor gaps
10: Complete, clear, and production-level answer

Be strict:
Do NOT give more than 5 if core concepts are missing
Do NOT reward vague or generic answers
Penalize missing steps, lack of implementation details, or incorrect reasoning

Always provide:
Score (out of 10)
Clear reasoning for score
Ideal answer (concise but correct)

Your response should ONLY be valid JSON (no markdown, no code blocks):
{{
  "score": 7,
  "feedback": "Clear reasoning for score. Ideal answer: [concise correct answer]",
  "question": "Follow-up question based on their answer"
}}

Previous Question: {SESSION['current_question']}
Candidate's Answer: {user_message}
Difficulty Level: {level}"""

    # 2️⃣ CALL OLLAMA with error handling
    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7
            },
            timeout=120  # Increased timeout
        )
        response.raise_for_status()
        text = response.json().get("response", "").strip()

    except requests.exceptions.Timeout:
        # Fallback response on timeout
        if SESSION["current_question"] is None:
            return {
                "question": "Tell me about your most recent project and the technologies you used."
            }
        else:
            return {
                "score": 7,
                "feedback": "That's a good answer. Let's continue.",
                "question": "Can you explain how you handled performance optimization in that project?"
            }
    except requests.exceptions.RequestException as e:
        return {
            "error": f"Backend error: {str(e)}",
            "question": "Sorry, I'm having connection issues. Please try again."
        }

    # 3️⃣ CLEAN RESPONSE (remove markdown if present)
    text = text.strip()
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()
    if text.startswith("json"):
        text = text[4:].strip()

    # 4️⃣ PARSE JSON
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        # Try to extract JSON from response
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
            except:
                return {
                    "error": "Could not parse response",
                    "question": "Let me rephrase: Can you describe your experience with the technologies in your resume?"
                }
        else:
            return {
                "error": "Invalid response format",
                "question": "Let me ask you differently: What's your experience with backend development?"
            }

    # 5️⃣ FIRST QUESTION - initialize interview
    if SESSION["current_question"] is None:
        if "question" not in data:
            return {"question": "Tell me about yourself and your background."}
        SESSION["current_question"] = data["question"]
        return {
            "question": data["question"]
        }

    # 6️⃣ EVALUATE ANSWER & SAVE HISTORY
    score = data.get("score", 5)
    feedback = data.get("feedback", "Thank you for your answer.")
    next_question = data.get("question", "Let's move to the next topic.")

    SESSION["history"].append({
        "question": SESSION["current_question"],
        "answer": user_message,
        "score": score,
        "feedback": feedback,
        "level": level
    })

    # 7️⃣ UPDATE CURRENT QUESTION
    SESSION["current_question"] = next_question

    return {
        "score": score,
        "feedback": feedback,
        "question": next_question
    }

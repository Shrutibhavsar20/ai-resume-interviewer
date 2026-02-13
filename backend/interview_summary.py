from backend.session import SESSION

def generate_interview_summary():
    history = SESSION["history"]

    if not history:
        return {"error": "No interview data available"}

    total_score = sum(item["score"] for item in history)
    avg_score = round(total_score / len(history), 2)

    strengths = []
    weaknesses = []

    for item in history:
        if item["score"] >= 7:
            strengths.append(item["summary"])

        if item.get("mistakes"):
            weaknesses.extend(item["mistakes"])

        if item.get("improvements"):
            weaknesses.extend(item["improvements"])

    strengths = list(dict.fromkeys(strengths))[:3]
    weaknesses = list(dict.fromkeys(weaknesses))[:3]

    if avg_score >= 8:
        recommendation = "Strong candidate – ready for mid-level roles"
    elif avg_score >= 6:
        recommendation = "Good foundation – suitable for junior roles"
    else:
        recommendation = "Needs more practice before interviews"

    return {
        "questions_attempted": len(history),
        "average_score": avg_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendation": recommendation
    }

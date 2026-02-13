import google.generativeai as genai
import os

# Configure the API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_questions(skills: list, level: str = "intermediate"):
    """
    Generate interview questions based on skills and difficulty level.
    
    Args:
        skills: List of skills extracted from resume
        level: Difficulty level (beginner, intermediate, advanced)
    
    Returns:
        List of generated questions
    """
    
    # Use the NEW model name
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    skills_text = ", ".join(skills)
    
    prompt = f"""
    You are an expert technical interviewer. Generate 5 {level}-level interview questions 
    based on the following skills: {skills_text}
    
    Requirements:
    - Questions should be practical and test real understanding
    - Mix of conceptual and scenario-based questions
    - Appropriate for {level} level candidates
    - Return ONLY the questions, numbered 1-5
    - Each question on a new line
    
    Format:
    1. [Question 1]
    2. [Question 2]
    ...
    """
    
    try:
        response = model.generate_content(prompt)
        
        # Extract the text from response
        questions_text = response.text
        
        # Split into individual questions
        questions = [q.strip() for q in questions_text.strip().split('\n') if q.strip()]
        
        return questions
        
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        # Return fallback questions
        return [
            f"1. Explain your experience with {skills[0] if skills else 'the required technologies'}.",
            "2. Describe a challenging project you worked on and how you solved it.",
            "3. How do you stay updated with the latest technology trends?",
            "4. Explain your approach to debugging complex issues.",
            "5. How do you handle tight deadlines and multiple priorities?"
        ]

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

def ask_gpt(prompt):
    try:
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"Gemini Error: {str(e)}"
def generate_interview_questions(
    resume,
    jd
):
    prompt = f"""
Resume:
{resume}

Job Description:
{jd}

Generate top 5 interview questions.
"""

    return ask_gpt(prompt)
def generate_final_report(
    questions,
    answers
):
    prompt = f"""
Questions:
{questions}

Answers:
{answers}

Generate detailed interview report.
"""

    return ask_gpt(prompt)
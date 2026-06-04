import ast

from flask import Blueprint
from flask import request
from flask import jsonify

import os
import json
from services import interview_state
from services.resume_parser import extract_resume_text
from services.gpt_service import ask_gpt
stored_resume = ""

resume_bp = Blueprint("resume_bp", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


@resume_bp.route("/upload-resume", methods=["POST"])
def upload_resume():

    global stored_resume

    if "resume" not in request.files:
        return jsonify({
            "error": "Resume missing"
        })

    file = request.files["resume"]

    path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    file.save(path)

    resume_text = extract_resume_text(path)

    stored_resume = resume_text
    from services.interview_state import interview_state
    interview_state["resume_text"] = resume_text

    prompt = f"""
    Resume:
    Analyze this resume.

    {resume_text}

    Generate top 5 technical interview questions
that are most likely to be asked.

Return only JSON:

[
 "question1",
 "question2",
 "question3",
 "question4",
 "question5"
]
    """

    analysis = ask_gpt(prompt)

    questions = ask_gpt(prompt)
    if questions.startswith("Gemini Error"):
        return jsonify({
            "error": questions
        }), 500
    
    questions = questions.replace(
    "```json",
    ""
    ).replace(
    "```",
    ""
    ).strip()
    try:
        interview_state["questions"] = json.loads(questions)
    except:
        interview_state["questions"]=ast.literal_eval(questions)
    interview_state["answers"] = []
    interview_state["current_question"] = 0
    return jsonify({
        "analysis": analysis,
        "questions": interview_state["questions"]
    })

import base64
from flask import Blueprint
from flask import request
from flask import jsonify
import ast
from services.gpt_service import ask_gpt
from routes.resume_routes import stored_resume
from services.stt_service import speech_to_text
from services.tts_service import text_to_speech
from services.interview_state import interview_state


interview_bp = Blueprint(
    "interview_bp",
    __name__
)



@interview_bp.route(
    "/compare-jd",
    methods=["POST"]
)
def compare_jd():

    data = request.json

    jd = data.get("job_description")

    prompt = f"""
You are a Senior Technical Recruiter.

Resume:

{stored_resume}

Job Description:

{jd}

Provide:

1. ATS Match Score (0-100)

2. Matching Skills

3. Missing Skills

4. Important Keywords Missing

5. Resume Improvements

6. Learning Roadmap

7. Interview Questions likely to be asked

Format neatly using markdown.
"""
    result = ask_gpt(prompt)

    return jsonify({
        "comparison": result
    })
@interview_bp.route(
    "/generate-questions",
    methods=["POST"]
)
def generate_questions():

    data = request.json

    resume = data.get("resume")
    jd = data.get("job_description")

    prompt = f"""
Resume:
{resume}

Job Description:
{jd}

Generate exactly 5 interview questions.

Return ONLY a Python list.

Example:

[
 "Question 1",
 "Question 2",
 "Question 3",
 "Question 4",
 "Question 5"
]
"""

    result = ask_gpt(prompt)

    try:
        questions = ast.literal_eval(result)
    except:
        questions = result.split("\n")

    interview_state["questions"] = questions
    interview_state["answers"] = []
    interview_state["current_question"] = 0

    return jsonify({
        "questions": questions
    })

@interview_bp.route(
    "/start-interview",
    methods=["GET"]
)
def start_interview():

    if len(interview_state["questions"]) == 0:
        return jsonify({
            "error": "No questions generated"
        }), 400

    return jsonify({
        "question":
        interview_state["questions"][0]
    })


@interview_bp.route(
    "/submit-answer",
    methods=["POST"]
)
def submit_answer():

    data = request.json

    answer = data.get("answer")

    idx = interview_state["current_question"]

    interview_state["answers"].append({
        "question":
        interview_state["questions"][idx],

        "answer":
        answer
    })

    interview_state["current_question"] += 1

    if interview_state["current_question"] >= len(
        interview_state["questions"]
    ):
        return jsonify({
            "completed": True
        })

    return jsonify({
        "completed": False,

        "question":
        interview_state["questions"][
            interview_state["current_question"]
        ]
    })


@interview_bp.route(
    "/voice-interview",
    methods=["POST"]
)
def voice_interview():

    audio = request.files["audio"]

    path = "uploads/interview.wav"

    audio.save(path)

    transcript = speech_to_text(path)

    idx = interview_state["current_question"]

    interview_state["answers"].append({
        "question":
        interview_state["questions"][idx],
        "answer":
        transcript
    })

    interview_state["current_question"] += 1

    if interview_state["current_question"] >= len(
        interview_state["questions"]
    ):

        return jsonify({
            "completed": True,
            "transcript": transcript
        })

    next_question = interview_state["questions"][
        interview_state["current_question"]
    ]

    audio_file = text_to_speech(next_question)

    audio_base64 = ""

    if audio_file:

        with open(audio_file, "rb") as f:

            audio_base64 = base64.b64encode(
                f.read()
            ).decode()

    return jsonify({
        "completed": False,
        "transcript": transcript,
        "question": next_question,
        "audio": audio_base64
    })

@interview_bp.route(
    "/final-feedback",
    methods=["GET"]
)
def final_feedback():

    qa_text = ""

    for item in interview_state["answers"]:

        qa_text += f"""
Question:
{item['question']}

Answer:
{item['answer']}
"""

    prompt = f"""
You are a Senior Technical Interviewer.

Evaluate the entire interview.

{qa_text}

Provide:

1. Overall Score /100

2. Technical Knowledge Score /10

3. Communication Score /10

4. Strengths

5. Weaknesses

6. Questions answered poorly

7. Improvement Areas

8. Learning Roadmap

9. Final Hiring Recommendation
"""

    report = ask_gpt(prompt)

    return jsonify({
        "report": report
    })
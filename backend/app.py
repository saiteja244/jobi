from flask import Flask
from flask_cors import CORS

from routes.resume_routes import resume_bp
from routes.interview_routes import interview_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(
    resume_bp,
    url_prefix="/api"
)

app.register_blueprint(
    interview_bp,
    url_prefix="/api"
)


@app.route("/")
def home():
    return {
        "message": "AI Interview Coach Backend Running"
    }


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )

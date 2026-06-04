import os

from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)

def speech_to_text(audio_path):
    try:

        response = client.speech_to_text.transcribe(
            file=open(audio_path, "rb"),
            model="saaras:v3",
            mode="transcribe"
        )

        return response.transcript

    except Exception as e:
        print("STT ERROR:", e)
        return ""
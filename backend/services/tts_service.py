import os
import base64

from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)

def text_to_speech(text):

    try:

        response = client.text_to_speech.convert(
            text=text[:2000],
            target_language_code="en-IN",
            speaker="shubh",
            model="bulbul:v3"
        )

        audio_base64 = "".join(
            response.audios
        )

        audio_bytes = base64.b64decode(
            audio_base64
        )

        output_file = "uploads/ai_response.wav"

        with open(output_file, "wb") as f:
            f.write(audio_bytes)

        return output_file

    except Exception as e:

        print("TTS ERROR:", e)

        return None
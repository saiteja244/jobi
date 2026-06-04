import { useState, useRef } from "react";
import API from "../services/api";

function VoiceInterview({ question, onAnswerSubmitted }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null); // Keeps track of the microphone stream to turn it off later
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setLoading(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("audio", blob, "recording.wav");

          // Send the audio recording to the backend
          const result = await API.post("/voice-interview", formData);

          setTranscript(result.data.transcript || "");

          if (onAnswerSubmitted) {
            onAnswerSubmitted(result.data);
          }

          // Handle interview end phase
          if (result.data.completed) {
            setCompleted(true);
            const reportRes = await API.get("/final-feedback");
            setReport(reportRes.data.report);
            setLoading(false);
            return;
          }

          // Handle playing the next question audio if returned by backend
          if (result.data.audio) {
            const audioBlob = new Blob(
              [
                Uint8Array.from(
                  atob(result.data.audio),
                  (c) => c.charCodeAt(0)
                ),
              ],
              { type: "audio/wav" }
            );

            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);

            const audio = new Audio(url);
            audio.play().catch((e) => console.error("Audio playback failed:", e));
          }
        } catch (error) {
          console.error("Error processing audio response:", error);
          alert("Failed to submit answer. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Could not access microphone:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Stop mic hardware tracks so the browser recording indicator turns off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return (
    <div className="card" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Voice Interview</h2>

      {loading && <p style={{ color: "blue" }}>Processing your response... please wait.</p>}

      {/* Main active loop */}
      {!completed && !loading && (
        <div className="interview-body">
          <div className="question-section" style={{ marginBottom: "20px" }}>
            <h3>Current Question:</h3>
            <p style={{ fontSize: "1.2rem", fontWeight: "500" }}>{question || "Click start to begin your interview."}</p>
          </div>

          <div className="controls" style={{ marginBottom: "20px" }}>
            {!recording ? (
              <button onClick={startRecording} style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Stop & Submit Answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show historical tracking of the last processed transcript */}
      {transcript && (
        <div className="transcript-section" style={{ marginTop: "15px" }}>
          <h4>Your Last Answer (Transcript):</h4>
          <p style={{ fontStyle: "italic", background: "#f9f9f9", padding: "10px", borderRadius: "4px" }}>{transcript}</p>
        </div>
      )}

      {/* Playback of incoming AI response voice audio */}
      {audioUrl && (
        <div className="audio-section" style={{ marginTop: "15px" }}>
          <h4>AI Question Audio:</h4>
          <audio controls src={audioUrl} />
        </div>
      )}

      {/* Final Assessment Phase */}
      {completed && (
        <div className="report-section" style={{ marginTop: "30px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
          <h3>Final Interview Report</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "15px", borderRadius: "5px", textAlign: "left" }}>
            {report || "Generating final report summary..."}
          </pre>
        </div>
      )}
    </div>
  );
}

export default VoiceInterview;
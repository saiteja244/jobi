import { useState } from "react";
import API from "../services/api";

function MockInterview() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(""); // Track user's active input
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false); // UI feedback during API calls

  const generateQuestions = async () => {
    if (!resume.trim() || !jd.trim()) {
      alert("Please provide both a resume and a job description.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await API.post("/generate-questions", {
        resume,
        job_description: jd,
      });

      let generated = response.data.questions;

      if (typeof generated === "string") {
        generated = generated.split("\n").filter((q) => q.trim());
      }

      setQuestions(generated);
      setCurrentQuestion(0);
      setAnswers([]);
      setReport("");
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      alert("Please provide an answer before moving to the next question.");
      return;
    }

    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer(""); // Reset input for the next question

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Incrementing past the index lets the JSX know we are finished with questions
      setCurrentQuestion(questions.length); 
      generateReport(updatedAnswers);
    }
  };

  const generateReport = async (allAnswers) => {
    setLoading(true);
    try {
      const response = await API.post("/final-feedback", {
        questions,
        answers: allAnswers,
      });
      setReport(response.data.report);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate the evaluation report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>AI Mock Interview</h2>

      {/* Loading indicator */}
      {loading && <p className="loading">Processing... Please wait.</p>}

      {/* STEP 1: Setup Phase */}
      {!loading && questions.length === 0 && (
        <div className="setup-container" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            placeholder="Paste Resume Text"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={6}
          />
          <textarea
            placeholder="Paste Job Description (JD)"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={6}
          />
          <button onClick={generateQuestions}>Generate Interview</button>
        </div>
      )}

      {/* STEP 2: Active Interview Phase */}
      {!loading && questions.length > 0 && currentQuestion < questions.length && (
        <div className="question-container">
          <h3>
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <p className="question-text"><strong>{questions[currentQuestion]}</strong></p>
          
          <textarea
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: "10px" }}
          />
          
          <button onClick={handleNext} style={{ marginTop: "10px" }}>
            {currentQuestion === questions.length - 1 ? "Submit & Finish" : "Next Question"}
          </button>
        </div>
      )}

      {/* STEP 3: Report Phase */}
      {!loading && report && (
        <div className="report-container" style={{ marginTop: "20px" }}>
          <h3>Interview Feedback Report</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "15px", borderRadius: "5px" }}>
            {report}
          </pre>
          <button onClick={() => setQuestions([])} style={{ marginTop: "10px" }}>
            Start New Interview
          </button>
        </div>
      )}
    </div>
  );
}

export default MockInterview;
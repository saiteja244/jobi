import { useState } from "react";
import API from "../services/api";

function InterviewQuestions() {

  const [jd, setJd] = useState("");
  const [questions, setQuestions] = useState("");

  const generateQuestions = async () => {

    const response = await API.post(
      "/generate-interview",
      {
        job_description: jd
      }
    );

    setQuestions(
      response.data.questions
    );
  };

  return (
    <div className="card">

      <h2>
        Interview Question Generator
      </h2>

      <textarea
        placeholder="Paste Job Description"
        value={jd}
        onChange={(e) =>
          setJd(e.target.value)
        }
      />

      <button
        onClick={generateQuestions}
      >
        Generate Questions
      </button>

      <pre>
        {questions}
      </pre>

    </div>
  );
}

export default InterviewQuestions;
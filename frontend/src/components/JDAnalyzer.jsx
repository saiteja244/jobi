import { useState } from "react";
import API from "../services/api";

function JDAnalyzer() {

  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");

  const analyze = async () => {

    const response = await API.post(
      "/compare-jd",
      {
        job_description: jd
      }
    );

    setResult(
      response.data.comparison
    );
  };

  return (
    <div className="card">

      <h2>
        Job Description Analyzer
      </h2>

      <textarea
        placeholder="Paste Job Description"
        value={jd}
        onChange={(e) =>
          setJd(e.target.value)
        }
      />

      <button
        onClick={analyze}
      >
        Analyze Match
      </button>

      <pre>{result}</pre>

    </div>
  );
}

export default JDAnalyzer;
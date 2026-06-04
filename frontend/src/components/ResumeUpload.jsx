import { useState } from "react";
import API from "../services/api";

function ResumeUpload() {

  const [file, setFile] = useState(null);

  const [analysis, setAnalysis] = useState("");

  const uploadResume = async () => {

    const formData = new FormData();

    formData.append(
      "resume",
      file
    );

    const response = await API.post(
      "/upload-resume",
      formData
    );

    setAnalysis(
      response.data.analysis
    );
  };

  return (
    <div className="card">

      <h2>
        Upload Resume
      </h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button onClick={uploadResume}>
        Analyze Resume
      </button>

      <pre>{analysis}</pre>

    </div>
  );
}

export default ResumeUpload;
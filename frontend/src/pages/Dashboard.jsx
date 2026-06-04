import  { useState } from "react";  
import ResumeUpload from "../components/ResumeUpload";
import JDAnalyzer from "../components/JDAnalyzer";
import VoiceInterview from "../components/VoiceInterview";
import InterviewQuestions from "../components/InterviewQuestions";
import MockInterview from "../components/MockInterview";

function Dashboard() {
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about yourself and your background.");

  const handleAnswerSubmitted = (data) => {
    // If the interview is still ongoing, update the parent state with the next question
    if (!data.completed && data.question) {
      setCurrentQuestion(data.question);
    }
  };
  return (
    <div className="container">

      <h1>
        AI Interview Coach
      </h1>

      <ResumeUpload />

      <JDAnalyzer />

      <InterviewQuestions />

      <MockInterview />

      <VoiceInterview 
      question={currentQuestion} 
      onAnswerSubmitted={handleAnswerSubmitted} 
    />

    </div>
  );
}

export default Dashboard;
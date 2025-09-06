import React, { useState, useEffect } from "react";
import StudentNav from "./StudentNav";
import { BadgeQuestionMark, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MockExam() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  // fetch questions once level is chosen
  useEffect(() => {
    if (level) {
      fetch(`http://localhost:3001/student/getMockQuestions?level=${level}`)
        .then((res) => res.json())
        .then((data) => setQuestions(data))
        .catch((err) => console.error(err));
    }
  }, [level]);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      if (
        questions[currentQuestion].options[selectedAnswer] ===
        questions[currentQuestion].correctAnswer
      ) {
        setScore((prev) => prev + 1);
      }
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div>
      <StudentNav page="mockexam" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Mock Driving Exam</h1>
          <h6 className="fs-6 lead opacity-90">
            Test your knowledge with our interactive practice exam to ace your
            driving test.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light mb-5">
        <div className="container">
          {!level && !isFinished && (
            <div className="text-center my-5">
              <div className="d-flex justify-content-center mb-4">
                <div className="bg-warning rounded-circle p-4 border border-4 border-dark">
                  <BadgeQuestionMark size={64} className="text-black" />
                </div>
              </div>
              <h3 className="fw-bold mb-4 text-primary">Choose Exam Level</h3>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                {["Beginner", "Intermediate", "Expert"].map((lvl) => (
                  <button
                    key={lvl}
                    className="btn btn-outline-primary px-4 py-2 fw-semibold"
                    style={{
                      borderRadius: "10px",
                      minWidth: "140px",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setLevel(lvl)}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {level && questions.length === 0 && !isFinished && (
            <div className="text-center">
              <h3>Loading questions...</h3>
            </div>
          )}

          {level && questions.length > 0 && !isFinished && (
            <div className="row g-4">
              <div className="col-12">
                <div
                  className="card border-0 shadow-lg p-4"
                  style={{ borderRadius: "12px", background: "#ffffff" }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div>
                        <h3 className="mb-1 fw-bold text-primary">
                          Question {currentQuestion + 1} of {questions.length}
                        </h3>
                        <small className="text-muted">
                          Select the correct answer below
                        </small>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4
                        className="fw-bold text-dark"
                        style={{ fontSize: "1.5rem" }}
                      >
                        {questions[currentQuestion].question}
                      </h4>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          className={`btn text-start p-3 d-flex align-items-center ${
                            selectedAnswer === index
                              ? "btn-primary text-white"
                              : "btn btn-outline-primary text-black"
                          }`}
                          style={{
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            boxShadow:
                              selectedAnswer === index
                                ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                                : "none",
                            background:
                              selectedAnswer === index
                                ? "linear-gradient(135deg, #0d51fdff, #0a84caff)"
                                : "#f8f9fa",
                          }}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <span
                            className={`me-3 fw-bold ${
                              selectedAnswer === index
                                ? "text-white"
                                : "text-primary"
                            }`}
                            style={{
                              opacity: selectedAnswer === index ? 1 : 0.5,
                              minWidth: "24px",
                            }}
                          >
                            {index + 1}
                          </span>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between mt-5">
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center px-4 py-2"
                        style={{ borderRadius: "8px", fontWeight: "500" }}
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                      >
                        <ChevronLeft size={24} className="me-2" />
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center px-4 py-2"
                        style={{ borderRadius: "8px", fontWeight: "500" }}
                        onClick={handleNext}
                        disabled={selectedAnswer === null}
                      >
                        {currentQuestion === questions.length - 1
                          ? "Finish"
                          : "Next"}
                        <ChevronRight size={24} className="ms-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isFinished && (
            <div className="text-center">
              <h1 className="fw-bold">Quiz Finished!</h1>
              <h3 className="mt-3">
                Your Score: {score} / {questions.length}
              </h3>
              <button
                className="btn btn-primary mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MockExam;
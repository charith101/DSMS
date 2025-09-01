import React, { useState } from 'react';
import StudentNav from "./StudentNav";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

function MockExam() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Sample questions data
  const questions = [
    {
      question: "What does a red traffic light indicate?",
      options: [
        "Proceed with caution",
        "Stop",
        "Yield to oncoming traffic",
        "Turn left only"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the speed limit in a residential area unless otherwise posted?",
      options: [
        "20 mph",
        "30 mph",
        "40 mph",
        "50 mph"
      ],
      correctAnswer: 1
    },
    {
      question: "When should you use your turn signals?",
      options: [
        "Only at night",
        "When changing lanes or turning",
        "Only in heavy traffic",
        "When driving on highways"
      ],
      correctAnswer: 1
    }
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null); // Reset selected answer for new question
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null); // Reset selected answer for previous question
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  return (
    <div>
      <StudentNav />
      <section
        className="text-white pb-5"
        style={{
          background: "linear-gradient(135deg, #0d51fdff 0%, #0a84caff 100%)",
          marginTop: "76px",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Mock Driving Exam</h1>
          <h6 className="fs-6 lead opacity-90">
            Test your knowledge with our interactive practice exam to ace your driving test.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-lg p-4" style={{ borderRadius: "12px", background: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div>
                      <h3 className="mb-1 fw-bold text-primary">Question {currentQuestion + 1} of {questions.length}</h3>
                      <small className="text-muted">Select the correct answer below</small>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
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
                            : "btn-outline-primary"
                        }`}
                        style={{
                          borderRadius: "10px",
                          transition: "all 0.3s ease",
                          boxShadow: selectedAnswer === index ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
                          background: selectedAnswer === index ? "linear-gradient(135deg, #0d51fdff, #0a84caff)" : "#f8f9fa",
                        }}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <CheckCircle
                          size={20}
                          className={`me-3 ${selectedAnswer === index ? "text-white" : "text-primary"}`}
                          style={{ opacity: selectedAnswer === index ? 1 : 0.5 }}
                        />
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
                      disabled={currentQuestion === questions.length - 1}
                    >
                      Next
                      <ChevronRight size={24} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockExam;
import React from 'react';
import StudentNav from "./StudentNav";
import { Clock, Calendar, Car } from "lucide-react";

function TimeSlot() {
  return (
    <div>
      <StudentNav page="timeslot"/>
      <section
        className="text-white pb-5"
        style={{
          background: "linear-gradient(135deg, #0d51fdff 0%, #0a84caff 100%)",
          marginTop: "76px",
        }}
      >
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Select Your Time Slots</h1>
          <h6 className="fs-6 lead opacity-90">
            Choose your preferred practice slots with instructors from the available options below.
          </h6>
        </div>
      </section>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Available Time Slots */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <Clock size={64} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Available Time Slots</h3>
                      <small className="text-muted">Select your preferred practice slots</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="bg-light border-2 border rounded-3 p-3">
                      <div className="d-flex flex-column gap-2">
                        <div><strong>Date:</strong> 2025.09.02</div>
                        <div><strong>Time:</strong> 9:00 AM – 10:00 AM</div>
                        <div><strong>Instructor:</strong> John Doe</div>
                        <div><strong>Vehicle:</strong> Toyota Yaris</div>
                        <div><strong>Location:</strong> Downtown Driving Track</div>
                        <button className="btn btn-primary mt-2">Select Slot</button>
                      </div>
                    </div>
                    <div className="bg-light border-2 border rounded-3 p-3">
                      <div className="d-flex flex-column gap-2">
                        <div><strong>Date:</strong> 2025.09.02</div>
                        <div><strong>Time:</strong> 11:00 AM – 12:00 PM</div>
                        <div><strong>Instructor:</strong> Jane Smith</div>
                        <div><strong>Vehicle:</strong> Honda Civic</div>
                        <div><strong>Location:</strong> Downtown Driving Track</div>
                        <button className="btn btn-primary mt-2">Select Slot</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Time Slots */}
            <div className="col-12">
              <div className="card border-2 shadow-sm p-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <Calendar size={64} className="text-success" />
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Your Selected Time Slots</h3>
                      <small className="text-muted">Your confirmed practice slots</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="bg-success bg-opacity-10 border-2 border rounded-3 p-3">
                      <div className="d-flex flex-column gap-2">
                        <div><strong>Date:</strong> 2025.09.01</div>
                        <div><strong>Time:</strong> 10:00 AM – 11:00 AM</div>
                        <div><strong>Instructor:</strong> John Doe</div>
                        <div><strong>Vehicle:</strong> Toyota Yaris</div>
                        <div><strong>Location:</strong> Downtown Driving Track</div>
                        <button className="btn btn-outline-danger mt-2">Cancel Slot</button>
                      </div>
                    </div>
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

export default TimeSlot;
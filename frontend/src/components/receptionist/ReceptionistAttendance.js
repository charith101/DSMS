import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistAttendance() {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    } else {
      fetchTimeSlots();
    }
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch("http://localhost:3001/receptionist/getTimeSlots");
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      setTimeSlots(data);
      // Select the first slot with booked students
      const firstWithStudents = data.find(slot => slot.bookedStudents && slot.bookedStudents.length > 0);
      if (firstWithStudents) {
        setSelectedSlotId(firstWithStudents._id);
      } else {
        setError("No time slots with booked students available for attendance marking.");
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError("Failed to load time slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSlotId) {
      fetchStudentsForSlot();
    }
  }, [selectedSlotId]);

  const fetchStudentsForSlot = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3001/receptionist/getPendingAttendance/${selectedSlotId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch attendance data");
      }
      const data = await response.json();

      const attendancesMap = new Map(
        data.attendances.map((a) => [a.studentId.toString(), a.status])
      );

      // Use all booked students, filter out nulls if any
      const allBookedStudents = (data.timeSlot.bookedStudents || []).filter(student => student !== null);

      const studentsWithStatus = allBookedStudents.map((student) => ({
        _id: student._id,
        name: student.name,
        status: attendancesMap.get(student._id.toString()) || null, // null for unmarked
      }));

      setStudents(studentsWithStatus);
    } catch (err) {
      console.error("Error fetching students for slot:", err);
      setError(err.message || "Failed to load students. Please try again.");
    }
  };

  const markStudent = async (studentId, newStatus) => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/receptionist/markAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSlotId: selectedSlotId,
          studentId,
          status: newStatus,
          markedBy: currentUserId,
        }),
      });

      if (response.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id.toString() === studentId.toString() ? { ...s, status: newStatus } : s
          )
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error marking attendance");
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Failed to mark attendance. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <ReceptionistNav page="attendance" />
        <div className="container" style={{ marginTop: "100px" }}>
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const slotsWithStudents = timeSlots.filter(slot => slot.bookedStudents && slot.bookedStudents.length > 0);

  return (
    <div>
      <ReceptionistNav page="attendance" />
      <div className="container" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold mb-4">Mark Attendance</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-bold">Select Time Slot</label>
          <select
            className="form-select"
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
          >
            <option value="">Select a time slot...</option>
            {slotsWithStudents.map((slot) => (
              <option key={slot._id} value={slot._id}>
                {new Date(slot.date).toLocaleDateString()} {slot.startTime} - {slot.endTime} - {slot.instructorId?.name} ({slot.bookedStudents.length} students)
              </option>
            ))}
          </select>
        </div>

        {selectedSlotId && students.length === 0 && !error && (
          <div className="alert alert-info">
            No students to mark attendance for this time slot.
          </div>
        )}

        {selectedSlotId && students.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`status-${s._id}`}
                          id={`present-${s._id}`}
                          checked={s.status === "Present"}
                          onChange={() => markStudent(s._id, "Present")}
                        />
                        <label className="form-check-label" htmlFor={`present-${s._id}`}>
                          <CheckCircle size={16} className="text-success me-1" />
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`status-${s._id}`}
                          id={`absent-${s._id}`}
                          checked={s.status === "Absent"}
                          onChange={() => markStudent(s._id, "Absent")}
                        />
                        <label className="form-check-label" htmlFor={`absent-${s._id}`}>
                          <XCircle size={16} className="text-danger me-1" />
                        </label>
                      </div>
                    </td>
                    <td>
                      {s.status ? (
                        <span className={`badge ${s.status === "Present" ? "bg-success" : "bg-danger"}`}>
                          {s.status}
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Unmarked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceptionistAttendance;
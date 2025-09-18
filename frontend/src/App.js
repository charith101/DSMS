import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';

// Student components
import StudentDashboard from './components/student/studentDashboard';
import AddUser from './components/student/AddUser';
import UpdateUser from './components/student/UpdateUser';
import Login from './components/login';
import UserRegister from './components/student/UserRegister';
import StudentFeedback from './components/student/StudentFeedback';
import TimeSlot from './components/student/TimeSlot';
import MockExam from './components/student/MockExam';
import StudentProfile from './components/student/StudentProfile';

// Other dashboards
import LandingPage from './components/landingPage';
import ReceptionistDashboard from './components/receptionist/ReceptionistDashboard';
import InstructorDashboard from './components/instructor/instructorDashboard';

// Admin components 
import AdminDashboard from './components/admin/adminDashboard';
import EmployeeManagement from './components/admin/employeeManagement';
import Feedback from './components/admin/feedback';
import FinanceManagement from './components/admin/financeManagement';
import StudentManagement from './components/admin/studentManagement';
import VehicleManagement from './components/admin/vehicleManagement';

//Receptionist components
import ReceptionistAppointments from './components/receptionist/ReceptionistAppointments';
import ReceptionistClasses from './components/receptionist/ReceptionistClasses';
import ReceptionistStudents from './components/receptionist/ReceptionistStudents';
import ReceptionistLateStudents from './components/receptionist/ReceptionistLateStudents';
import ReceptionistFeedback from './components/receptionist/ReceptionistFeedback';


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* General routes */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<UserRegister />} />

          {/* Dashboards */}
          <Route path='/student-dashboard' element={<StudentDashboard />} />
          <Route path='/receptionist-dashboard' element={<ReceptionistDashboard />} />
          <Route path='/instructor-dashboard' element={<InstructorDashboard />} />
          <Route path='/admin-dashboard' element={<AdminDashboard />} />

          {/* Admin management routes */}
          <Route path='/students' element={<StudentManagement />} />
          <Route path='/employees' element={<EmployeeManagement />} />
          <Route path='/finance' element={<FinanceManagement />} />
          <Route path='/vehicles' element={<VehicleManagement />} />
          <Route path='/feedback' element={<Feedback />} />

          {/* User management */}
          <Route path='/create' element={<AddUser />} />
          <Route path='/update/:id' element={<UpdateUser />} />
          <Route path='/student-feedback' element={<StudentFeedback />} />
          <Route path='/Time-Slot' element={<TimeSlot />} />
          <Route path='/Mock-Exam' element={<MockExam />} />
          <Route path='/Student-Profile' element={<StudentProfile />} />

          {/*Receptionist management*/}
          <Route path='/receptionist-appointments' element={<ReceptionistAppointments />} />
          <Route path='/receptionist-classes' element={<ReceptionistClasses />} />
          <Route path='/receptionist-students' element={<ReceptionistStudents />} />
          <Route path='/receptionist-late-students' element={<ReceptionistLateStudents />} />
          <Route path='/receptionist-feedback' element={<ReceptionistFeedback />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

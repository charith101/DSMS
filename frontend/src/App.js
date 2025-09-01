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

// Other dashboards
import LandingPage from './components/landingPage';
import ReceptionistDashboard from './components/receptionist/receptionistDashboard';
import InstructorDashboard from './components/instructor/instructorDashboard';

// Admin components 
import AdminDashboard from './components/admin/adminDashboard';
import EmployeeManagement from './components/admin/employeeManagement';
import Feedback from './components/admin/feedback';
import FinanceManagement from './components/admin/financeManagement';
import StudentManagement from './components/admin/studentManagement';
import VehicleManagement from './components/admin/vehicleManagement';

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

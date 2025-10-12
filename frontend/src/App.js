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
import StudentPayments from './components/student/StudentPayments';
import StudentCardPayment from './components/student/StudentCardPayment';

// Other dashboards
import LandingPage from './components/landingPage';
import ReceptionistDashboard from './components/receptionist/ReceptionistDashboard';
import InstructorDashboard from './components/instructor/instructorDashboard';

// Instructor components
import InstructorSchedule from './components/instructor/instructorSchedule';
import InstructorProfile from './components/instructor/instructorProfile';
import InstructorLeave from './components/instructor/instructorLeave';
import InstructorPayments from './components/instructor/instructorPayments';

// Admin components 
import AdminDashboard from './components/admin/adminDashboard';
import EmployeeManagement from './components/admin/employeeManagement';
import AdminProfile from './components/admin/adminProfile';
import FinanceManagement from './components/admin/financeManagement';
import StudentManagement from './components/admin/studentManagement';
import VehicleManagement from './components/admin/vehicleManagement';

// Financial Manager components
import FinancialManagerDashboard from './components/financialManager/FinancialManagerDashboard';
import PaymentManagement from './components/financialManager/PaymentManagement';
import FinancialReports from './components/financialManager/FinancialReports';
import FinancialManagerLogin from './components/financialManager/FinancialManagerLogin';
import FinancialManagerRegister from './components/financialManager/FinancialManagerRegister';
import SalaryManagement from './components/financialManager/SalaryManagement';
//Receptionist components
import ReceptionistAttendance from './components/receptionist/ReceptionistAttendance';
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
          <Route path='/Student/Dashboard' element={<StudentDashboard />} />
          <Route path='/receptionist-dashboard' element={<ReceptionistDashboard />} />
          <Route path='/instructor-dashboard' element={<InstructorDashboard />} />
          <Route path='/admin-dashboard' element={<AdminDashboard />} />

          {/* Admin management routes */}
          <Route path='/students' element={<StudentManagement />} />
          <Route path='/employees' element={<EmployeeManagement />} />
          <Route path='/finance' element={<FinanceManagement />} />
          <Route path='/vehicles' element={<VehicleManagement />} />
          <Route path='/admin-profile' element={<AdminProfile />} />

          {/* Financial Manager routes */}
          <Route path='/financial-manager-login' element={<FinancialManagerLogin />} />
          <Route path='/financial-manager-register' element={<FinancialManagerRegister />} />
          <Route path='/financial-manager' element={<FinancialManagerDashboard />} />
          <Route path='/financial-manager/payments' element={<PaymentManagement />} />
          <Route path='/financial-manager/salary' element={<SalaryManagement />} />
          <Route path='/financial-manager/reports' element={<FinancialReports />} />

          {/* User management */}
          <Route path='/create' element={<AddUser />} />
          <Route path='/update/:id' element={<UpdateUser />} />
          <Route path='/Student/Feedback' element={<StudentFeedback />} />
          <Route path='/Student/Time-Slot' element={<TimeSlot />} />
          <Route path='/Student/Mock-Exam' element={<MockExam />} />
          <Route path='/Student/Profile' element={<StudentProfile />} />
          <Route path='/Student/Payments' element={<StudentPayments />} />
          <Route path='/Student/Payments/Card' element={<StudentCardPayment />} />

          {/* Instructor management routes */}
          <Route path='/instructor-schedule' element={<InstructorSchedule />} />
          <Route path='/instructor-profile' element={<InstructorProfile />} />
          <Route path='/instructor-leave' element={<InstructorLeave />} />
          <Route path='/instructor-payments' element={<InstructorPayments />} />

          {/* Receptionist management routes */}
          <Route path='/receptionist-attendance' element={<ReceptionistAttendance />} />
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
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';
import Studentdashboard from './components/student/studentDashboard';
import AddUser from './components/student/AddUser';
import UpdateUser from './components/student/UpdateUser';
import Login from './components/login';
import UserRegister from './components/student/UserRegister';
import LandingPage from './components/landingPage';
import ReceptionistDashboard from './components/receptionist/receptionistDashboard';
import InstructorDashboard from './components/instructor/instructorDashboard';
import AdminDashboard from './components/admin/adminDashboard';
import VehicleDashboard from './components/admin/vehicle Management/vehicleDashboard';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/register' element={<UserRegister/>}></Route>
        <Route path='/student-dashboard' element={<Studentdashboard/>}></Route>
        <Route path='/receptionist-dashboard' element={<ReceptionistDashboard/>}></Route>
        <Route path='/instructor-dashboard' element={<InstructorDashboard/>}></Route>
        <Route path='/admin-Dashboard' element={<AdminDashboard/>}></Route>
        <Route path='/vehicle-dashboard' element={<VehicleDashboard/>}></Route>
        <Route path='/create' element={<AddUser/>}></Route>
        <Route path='/update/:id' element={<UpdateUser/>}></Route>
        
        
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

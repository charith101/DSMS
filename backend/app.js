const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const studentRouter = require('./controllers/student/studentAPI');
const authRouter = require('./controllers/auth/authAPI');
const employeeRouter = require('./controllers/Employee/employeeAPI');
const receptionistRouter = require('./controllers/receptionist/receptionistAPI');

const appointmentRoutes = require('./controllers/receptionist/appointments');
const classRoutes = require('./controllers/receptionist/classes');
const attendanceRoutes = require('./controllers/receptionist/attendances');
const feedbackRoutes = require('./controllers/receptionist/feedbacks');
const notificationRoutes = require('./controllers/receptionist/notifications');

const app = express();
app.use(cors());
app.use(express.json());

app.listen(3001, () => {
  console.log("Server is running");
});

mongoose
  .connect(
    "mongodb+srv://admin:xXZWFcwvTQjrqdJv@cluster0.sjyibwg.mongodb.net/ITP"
  )
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    app.listen(5001);
  })
  .catch((err) => console.log(err));

app.use('/student', studentRouter);
app.use('/auth', authRouter);
app.use('/employee', employeeRouter);
// app.use('/receptionist', receptionistRouter);
app.use('/finance', require('./controllers/payment/financeAPI'));
app.use('/api/finance/transactions', require('./controllers/payment/transactionRoutes'));

app.use('/appointments', appointmentRoutes);
app.use('/classes', classRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/notifications', notificationRoutes);

app.listen(3005, () => {
  console.log('Server started on port 3005');
});
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name can't exceed 50 characters"],
    match: [/^[A-Za-z\s]+$/, "Name cannot contain special characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [10, "Minimum age is 10"],
    max: [120, "Maximum age is 120"],
  },
  nic: {
    type: String,
    required: [true, "NIC is required"],
    unique: true,
    match: [/^(\d{12}|\d{9}[Vv])$/, "Invalid NIC format"],
  },
  role: {
    type: String,
    enum: ["student", "admin", "receptionist", "instructor"],
    required: true,
  },
  licenseType: {
  type: [String],
  enum: ["Car", "Bike", "Three-Wheel"],
  validate: [
    {
      validator: function (v) {
        if (this.role === "student") {
          return Array.isArray(v) && v.length > 0;
        }
        return true;
      },
      message: "Select at least one license type",
    },
  ],
},
  level: {
    type: Number,
    required: function () {
      return this.role === "student";
    },
    default: 2,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [5, "Password must be at least 5 characters"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);

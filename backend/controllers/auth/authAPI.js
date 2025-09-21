const express = require('express');
const router = express.Router();
const UserModel = require('../../models/Users');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email })
    .then(user => {
      if (!user) return res.status(404).json("ne:No user found with this email");
      if (user.password === password){
        res.json({
          status: "Success",
          id: user._id,
          role: user.role,
        });
      } 
      else res.status(401).json("pi:The password is incorrect");
    })
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;
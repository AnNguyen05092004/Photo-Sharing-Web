const express = require("express")
const router = express.Router();

const User = require("../db/userModel")

// Login
router.post("/login", async (req, res) => {
    const { login_name, password } = req.body;
    if (!login_name || !password) {
        return res.status(400).json({ message: "login_name and password are required" });
    }
    try {
        const user = await User.findOne({ login_name });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // save user to session
        req.session.user = {
            _id: user._id,
            first_name: user.first_name,
            login_name: user.login_name,
        };

        res.status(200).json({ _id: user._id, first_name: user.first_name });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Logout
router.post("/logout", (req, res) => {
    if (!req.session.user) {
        return res.status(400).send("Not logged in");
    }
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.status(200).json({ message: "Logout successful" })
    })
})

module.exports = router;
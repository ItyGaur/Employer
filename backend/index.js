const dns = require("dns").promises;
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());


// ===========================
// MongoDB Connection
// ===========================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(() => console.log("MongoDB Connection Failed"));


// ===========================
// Models
// ===========================

const User = require("./models/User");
const Employee = require("./models/Employee");


// ===========================
// Auth Middleware
// ===========================

const authMiddleware = (req, res, next) => {

    try {

        const token = req.headers.authorization;

        if (!token) {

            return res.status(401).json({
                message: "Please login first"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};


// ===========================
// AUTH APIs
// ===========================


// Register

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existing = await User.findOne({ email });

        if (existing) {

            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: "Registered successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: "Unable to register user"
        });
    }
});


// Login

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {

            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {

        res.status(500).json({
            message: "Unable to login"
        });
    }
});


// ===========================
// EMPLOYEE APIs
// ===========================


// Add Employee

app.post(
    "/api/employees",
    authMiddleware,

    async (req, res) => {

        try {

            const {
                name,
                email,
                department,
                skills,
                performanceScore,
                experience
            } = req.body;

            if (
                !name ||
                !email ||
                !department ||
                !skills ||
                !performanceScore ||
                !experience
            ) {

                return res.status(400).json({
                    message: "Please fill all employee details"
                });
            }

            const existingEmployee =
                await Employee.findOne({
                    email
                });

            if (existingEmployee) {

                return res.status(400).json({
                    message:
                        "Employee with this email already exists"
                });
            }

            const employee =
                new Employee(req.body);

            await employee.save();

            res.json({
                message: "Employee Added Successfully",
                employee
            });

        } catch (err) {

            res.status(500).json({
                message: "Unable to add employee"
            });
        }
    }
);


// Get All Employees

app.get(
    "/api/employees",
    authMiddleware,

    async (req, res) => {

        try {

            const employees =
                await Employee.find();

            res.json(employees);

        } catch (err) {

            res.status(500).json({
                message:
                    "Unable to fetch employees"
            });
        }
    }
);


// Search Employee

app.get(
    "/api/employees/search",
    authMiddleware,

    async (req, res) => {

        try {

            const { department } = req.query;

            if (!department) {

                return res.status(400).json({
                    message:
                        "Please enter department name"
                });
            }

            const employees =
                await Employee.find({

                    department:
                        new RegExp(
                            department,
                            "i"
                        )
                });

            if (employees.length === 0) {

                return res.status(404).json({
                    message:
                        "No employees found"
                });
            }

            res.json(employees);

        } catch (err) {

            res.status(500).json({
                message:
                    "Unable to search employees"
            });
        }
    }
);


// Delete Employee

app.delete(
    "/api/employees/:id",
    authMiddleware,

    async (req, res) => {

        try {

            const employee =
                await Employee.findById(
                    req.params.id
                );

            if (!employee) {

                return res.status(404).json({
                    message:
                        "Employee not found"
                });
            }

            await Employee.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message:
                    "Employee Deleted Successfully"
            });

        } catch (err) {

            res.status(500).json({
                message:
                    "Unable to delete employee"
            });
        }
    }
);


// ===========================
// AI Recommendation API
// ===========================

app.post(
    "/api/ai/recommend",
    authMiddleware,

    async (req, res) => {

        try {

            const {
                name,
                skills,
                performanceScore,
                experience
            } = req.body;

            if (
                !name ||
                !skills ||
                !performanceScore ||
                !experience
            ) {

                return res.status(400).json({
                    message:
                        "Incomplete employee data"
                });
            }

            // Mock response if no key

            if (!process.env.OPENROUTER_API_KEY) {

                return res.json({
                    recommendation:
                        performanceScore > 80
                            ? `${name} is eligible for promotion`
                            : `${name} needs skill improvement training`
                });
            }

            // OpenRouter API Call

            const response = await axios.post(

                "https://openrouter.ai/api/v1/chat/completions",

                {
                    model:
                        "openai/gpt-3.5-turbo",

                    messages: [
                        {
                            role: "user",

                            content: `
                            Employee Name: ${name}
                            Skills: ${skills}
                            Performance Score: ${performanceScore}
                            Experience: ${experience}

                            Give:
                            1. Promotion recommendation
                            2. Training suggestion
                            3. Performance feedback
                            `
                        }
                    ]
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.OPENROUTER_API_KEY}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );

            res.json({
                recommendation:
                    response.data.choices[0]
                        .message.content
            });

        } catch (err) {

            console.log(
                err.response?.data ||
                err.message
            );

            res.status(500).json({
                message:
                    "Unable to generate AI recommendation"
            });
        }
    }
);


// ===========================
// Root API
// ===========================

app.get("/", (req, res) => {

    res.send("API Running");
});


// ===========================
// Server Start
// ===========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});
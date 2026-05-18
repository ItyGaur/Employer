import { useEffect, useState } from "react";

import API from "../api";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const [employees, setEmployees]
        = useState([]);

    const [filteredEmployees,
        setFilteredEmployees]
        = useState([]);

    const [search, setSearch]
        = useState("");

    const [recommendation,
        setRecommendation]
        = useState("");

    const [selectedEmployee,
        setSelectedEmployee]
        = useState("");

    const [activeSection,
        setActiveSection]
        = useState("home");

    const [form, setForm]
        = useState({

            name: "",
            email: "",
            department: "",
            skills: "",
            performanceScore: "",
            experience: ""
        });

    const [userName,
        setUserName]
        = useState("");

    const navigate = useNavigate();


    // ==========================
    // Fetch Employees
    // ==========================

    const fetchEmployees = async () => {

        try {

            const res = await API.get(
                "/employees"
            );

            setEmployees(res.data);

            setFilteredEmployees(
                res.data
            );

        } catch (err) {

            alert("Unauthorized");

            navigate("/");
        }
    };


    // ==========================
    // Initial Load
    // ==========================

    useEffect(() => {

        fetchEmployees();

        const token =
            localStorage.getItem("token");

        if (token) {

            const payload =
                JSON.parse(
                    atob(
                        token.split(".")[1]
                    )
                );

            setUserName(payload.name);
        }

    }, []);


    // ==========================
    // Add Employee
    // ==========================

    const handleSubmit = async () => {

        try {

            const employeeData = {

                ...form,

                skills:
                    form.skills
                        .split(",")
                        .map(skill =>
                            skill.trim()
                        )
            };

            await API.post(
                "/employees",
                employeeData
            );

            alert("Employee Added");

            setForm({
                name: "",
                email: "",
                department: "",
                skills: "",
                performanceScore: "",
                experience: ""
            });

            fetchEmployees();

            setActiveSection(
                "employees"
            );

        } catch (err) {

            alert(

                err.response?.data?.message

                ||

                "Something went wrong"
            );
        }
    };


    // ==========================
    // Delete Employee
    // ==========================

    const deleteEmployee = async (id) => {

        try {

            await API.delete(
                `/employees/${id}`
            );

            fetchEmployees();

        } catch (err) {

            alert(
                "Unable to delete employee"
            );
        }
    };


    // ==========================
    // Search Employee
    // ==========================

    const searchEmployee = () => {

        if (!search.trim()) {

            setFilteredEmployees(
                employees
            );

            return;
        }

        const filtered =
            employees.filter((emp) =>

                emp.department
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
            );

        setFilteredEmployees(
            filtered
        );
    };


    // ==========================
    // AI Recommendation
    // ==========================

    const getAIRecommendation = async (
        employee
    ) => {

        try {

            setSelectedEmployee(
                employee.name
            );

            const res = await API.post(

                "/ai/recommend",

                employee
            );

            setRecommendation(
                res.data.recommendation
            );

        } catch (err) {

            alert("AI Error");
        }
    };


    // ==========================
    // Logout
    // ==========================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        navigate("/");
    };


    // ==========================
    // UI
    // ==========================

    return (

        <div className="dashboard-layout">


            {/* SIDEBAR */}

            <div className="sidebar">

                <div className="sidebar-top">

                    <h2>
                        EMS Dashboard
                    </h2>

                    <div className="sidebar-menu">

                        <button

                            className={
                                activeSection === "home"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveSection("home")
                            }
                        >
                            Dashboard Home
                        </button>


                        <button

                            className={
                                activeSection === "add"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveSection("add")
                            }
                        >
                            Add Employee
                        </button>


                        <button

                            className={
                                activeSection === "employees"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveSection("employees")
                            }
                        >
                            Employee List
                        </button>


                        <button

                            className={
                                activeSection === "search"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveSection("search")
                            }
                        >
                            Search Employee
                        </button>


                        <button

                            className={
                                activeSection === "ai"
                                    ? "active"
                                    : ""
                            }

                            onClick={() =>
                                setActiveSection("ai")
                            }
                        >
                            AI Recommendations
                        </button>

                    </div>

                </div>


                <button
                    className="danger"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>


            {/* MAIN CONTENT */}

            <div className="main-content">


                {/* HEADER */}

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Employee Analytics
                            System
                        </h1>

                        <p>
                            Welcome back,
                            {" "}
                            {userName}
                        </p>

                    </div>

                </div>


                {/* HOME */}

                {
                    activeSection === "home"

                    &&

                    (

                        <div className="home-grid">

                            <div className="home-card">

                                <h3>
                                    Total Employees
                                </h3>

                                <h2>
                                    {
                                        employees.length
                                    }
                                </h2>

                            </div>


                            <div className="home-card">

                                <h3>
                                    Quick Actions
                                </h3>

                                <div className="quick-actions">

                                    <button

                                        onClick={() =>
                                            setActiveSection(
                                                "add"
                                            )
                                        }
                                    >
                                        Add Employee
                                    </button>


                                    <button

                                        onClick={() =>
                                            setActiveSection(
                                                "employees"
                                            )
                                        }
                                    >
                                        View Employees
                                    </button>

                                </div>

                            </div>

                        </div>
                    )
                }


                {/* ADD EMPLOYEE */}

                {
                    activeSection === "add"

                    &&

                    (

                        <div className="section-panel">

                            <h2 className="section-title">
                                Add Employee
                            </h2>


                            <div className="form-grid">

                                <input
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name:
                                                e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email:
                                                e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Department"
                                    value={form.department}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            department:
                                                e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Skills"
                                    value={form.skills}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            skills:
                                                e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Performance Score"
                                    value={
                                        form.performanceScore
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            performanceScore:
                                                e.target.value
                                        })
                                    }
                                />

                                <input
                                    placeholder="Experience"
                                    value={
                                        form.experience
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            experience:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>


                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                            >
                                Add Employee
                            </button>

                        </div>
                    )
                }


                {/* EMPLOYEE LIST */}

                {
                    activeSection === "employees"

                    &&

                    (

                        <div className="section-panel">

                            <h2 className="section-title">
                                Employee List
                            </h2>


                            <div className="employee-list">

                                {
                                    employees.length > 0

                                    ?

                                    employees.map((emp) => (

                                        <div
                                            className="employee-card"
                                            key={emp._id}
                                        >

                                            <h3>
                                                {emp.name}
                                            </h3>

                                            <p>
                                                {emp.email}
                                            </p>

                                            <p>
                                                {emp.department}
                                            </p>

                                            <p>
                                                Skills:
                                                {" "}
                                                {emp.skills.join(", ")}
                                            </p>

                                            <p>
                                                Score:
                                                {" "}
                                                {emp.performanceScore}
                                            </p>

                                            <p>
                                                Experience:
                                                {" "}
                                                {emp.experience}
                                                {" "}
                                                years
                                            </p>

                                            <button
                                                onClick={() =>
                                                    getAIRecommendation(emp)
                                                }
                                            >
                                                AI Recommendation
                                            </button>

                                            <button
                                                className="danger"
                                                onClick={() =>
                                                    deleteEmployee(emp._id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    ))

                                    :

                                    (

                                        <p>
                                            No employees found.
                                        </p>
                                    )
                                }

                            </div>

                        </div>
                    )
                }


                {/* SEARCH */}

                {
                    activeSection === "search"

                    &&

                    (

                        <div className="section-panel">

                            <h2 className="section-title">
                                Search Employee
                            </h2>


                            <div className="search-wrapper">

                                <input

                                    placeholder="Search by Department"

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    onClick={searchEmployee}
                                >
                                    Search
                                </button>

                                <button

                                    className="secondary"

                                    onClick={() => {

                                        setSearch("");

                                        setFilteredEmployees(
                                            employees
                                        );
                                    }}
                                >
                                    Reset
                                </button>

                            </div>


                            <div className="employee-list">

                                {
                                    filteredEmployees.length > 0

                                    ?

                                    filteredEmployees.map((emp) => (

                                        <div
                                            className="employee-card"
                                            key={emp._id}
                                        >

                                            <h3>
                                                {emp.name}
                                            </h3>

                                            <p>
                                                {emp.email}
                                            </p>

                                            <p>
                                                {emp.department}
                                            </p>

                                            <p>
                                                Skills:
                                                {" "}
                                                {emp.skills.join(", ")}
                                            </p>

                                        </div>
                                    ))

                                    :

                                    (

                                        <p>
                                            No employees found
                                            for this department.
                                        </p>
                                    )
                                }

                            </div>

                        </div>
                    )
                }


                {/* AI RECOMMENDATION */}

                {
                    activeSection === "ai"

                    &&

                    (

                        <div className="section-panel">

                            <h2 className="section-title">
                                AI Recommendations
                            </h2>


                            {/* EMPLOYEE CARDS */}

                            <div className="employee-list">

                                {
                                    employees.length > 0

                                    ?

                                    employees.map((emp) => (

                                        <div
                                            className="employee-card"
                                            key={emp._id}
                                        >

                                            <h3>
                                                {emp.name}
                                            </h3>

                                            <p>
                                                {emp.department}
                                            </p>

                                            <p>
                                                Score:
                                                {" "}
                                                {emp.performanceScore}
                                            </p>

                                            <button

                                                onClick={() =>
                                                    getAIRecommendation(emp)
                                                }
                                            >
                                                Generate AI Recommendation
                                            </button>

                                        </div>
                                    ))

                                    :

                                    (

                                        <p>
                                            No employees available.
                                        </p>
                                    )
                                }

                            </div>


                            {/* AI RESULT */}

                            <div
                                className="ai-content"
                                style={{
                                    marginTop: "24px"
                                }}
                            >

                                <h3>
                                    {
                                        selectedEmployee
                                            ? `AI Feedback for ${selectedEmployee}`
                                            : "AI Feedback"
                                    }
                                </h3>

                                <br />

                                {
                                    recommendation

                                        ?

                                        recommendation
                                            .split("\n")
                                            .map(

                                                (
                                                    line,
                                                    index
                                                ) => (

                                                    <p
                                                        key={index}
                                                    >
                                                        {line}
                                                    </p>
                                                )
                                            )

                                        :

                                        (

                                            <p>

                                                Click on an employee
                                                to generate AI feedback.

                                            </p>
                                        )
                                }

                            </div>

                        </div>
                    )
                }

            </div>

        </div>
    );
}
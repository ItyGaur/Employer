import { useState } from "react";

import API from "../api";

import {
    useNavigate,
    Link
} from "react-router-dom";

export default function Login() {

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await API.post(
                "/login",
                form
            );

            localStorage.setItem(
                "token",
                res.data.token
            );

            navigate("/dashboard");

        } catch (err) {

            alert(
                err.response?.data?.message
                || "Invalid Login"
            );
        }
    };

    return (

        <div className="container">

            <form
                className="form"
                onSubmit={handleSubmit}
            >

                <h2>Login</h2>

                <input
                    type="email"
                    placeholder="Email"

                    onChange={(e) =>
                        setForm({
                            ...form,
                            email: e.target.value
                        })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"

                    onChange={(e) =>
                        setForm({
                            ...form,
                            password: e.target.value
                        })
                    }
                />

                <button>
                    Login
                </button>

                <p>
                    No account?

                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </form>

        </div>
    );
}
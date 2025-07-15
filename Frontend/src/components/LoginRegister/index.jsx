import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginRegister({setIsLoggedIn}) {
    // Đăng nhập
    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [signup, setSignup] = useState(false);

    // Đăng ký
    const [reg, setReg] = useState({
        login_name: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
    });
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");

    // Xử lý đăng nhập
    const handleLogin = async () => {
        setError("");
        try {
            const res = await fetch("http://localhost:8081/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ login_name: loginName, password: password }),
            });
            if (res.status === 200) {
                const data = await res.json();
                setIsLoggedIn(true);
                navigate(`/users/${data._id}`);
            } else {
                const err = await res.json();
                setError(err.message || "Login failed");
            }
        } catch {
            setError("Login failed");
        }
    };

    // Xử lý đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError("");
        setRegSuccess("");
        if (reg.password !== reg.password2) {
            setRegError("Passwords do not match.");
            return;
        }
        if (!reg.login_name || !reg.password || !reg.first_name || !reg.last_name) {
            setRegError("Please fill all required fields.");
            return;
        }
        const res = await fetch("http://localhost:8081/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                login_name: reg.login_name,
                password: reg.password,
                first_name: reg.first_name,
                last_name: reg.last_name,
                location: reg.location,
                description: reg.description,
                occupation: reg.occupation,
            }),
        });
        if (res.ok) {
            setRegSuccess("Registration successful! You can now log in.");
            setReg({
                login_name: "",
                password: "",
                password2: "",
                first_name: "",
                last_name: "",
                location: "",
                description: "",
                occupation: "",
            });
        } else {
            const msg = await res.text();
            setRegError(msg);
        }
    };

    if(signup) {
        return (
            <div style={{ maxWidth: 350, margin: "40px auto" }}>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input
                        placeholder="Login name*"
                        value={reg.login_name}
                        onChange={e => setReg(r => ({ ...r, login_name: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password*"
                        value={reg.password}
                        onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Repeat Password*"
                        value={reg.password2}
                        onChange={e => setReg(r => ({ ...r, password2: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                        required
                    />
                    <input
                        placeholder="First name*"
                        value={reg.first_name}
                        onChange={e => setReg(r => ({ ...r, first_name: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                        required
                    />
                    <input
                        placeholder="Last name*"
                        value={reg.last_name}
                        onChange={e => setReg(r => ({ ...r, last_name: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                        required
                    />
                    <input
                        placeholder="Location"
                        value={reg.location}
                        onChange={e => setReg(r => ({ ...r, location: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                    />
                    <input
                        placeholder="Description"
                        value={reg.description}
                        onChange={e => setReg(r => ({ ...r, description: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                    />
                    <input
                        placeholder="Occupation"
                        value={reg.occupation}
                        onChange={e => setReg(r => ({ ...r, occupation: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8 }}
                    />
                    <button type="submit" style={{ width: "100%" }}>Register Me</button>
                    {regError && <p style={{ color: "red" }}>{regError}</p>}
                    {regSuccess && <p style={{ color: "green" }}>{regSuccess}</p>}
                </form>
                <button onClick={() => setSignup(false)} style={{ width: "100%", marginTop: 8 }}>Back to Login</button>
            </div>
        );         
    }

    return (
        <div style={{ maxWidth: 350, margin: "40px auto" }}>
            <h2>Login</h2>
            <input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Login name"
                autoComplete="username"
                style={{ width: "100%", marginBottom: 8 }}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                style={{ width: "100%", marginBottom: 8 }}
            />
            <button onClick={handleLogin} style={{ width: "100%" }}>Login</button>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <hr style={{ margin: "32px 0" }} />
            
            <p>Don't have an account? <button onClick={() => setSignup(true)}>Sign up</button></p>
        </div>
    );
}

export default LoginRegister;
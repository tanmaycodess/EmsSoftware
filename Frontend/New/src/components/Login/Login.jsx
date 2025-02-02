import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrorMessage('');
            setLoading(true); // Set loading to true when the form is submitted
            const response = await axios.post(`https://emssoftware-backend.onrender.com/login`, { email, password });

            if (response.status === 200 && response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/home'); // Redirect to home page
            }
        } catch (error) {
            setErrorMessage('Your email and/or password are incorrect.');
        } finally {
            setLoading(false); // Set loading to false after the request is complete
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>Login</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="login-input"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="login-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? (
                            <>
                              
                                <div className="spinner"></div>
                            </>
                        ) : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

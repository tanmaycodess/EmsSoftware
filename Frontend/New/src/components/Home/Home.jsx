import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Import your CSS file for styling

const HomePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate hook

    const openSidebar = () => {
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const goToEmployeeManagement = () => {
        navigate('/employee');
        closeSidebar(); // Optionally close sidebar after navigation
    };

    const goToProfile = () => {
        navigate('/profile');
        closeSidebar(); // Optionally close sidebar after navigation
    };

    const goToRegister = () => {
        navigate('/register');
        closeSidebar(); // Optionally close sidebar after navigation
    };


    const goToPayslip = () => {
        navigate('/payslip');
        closeSidebar(); // Optionally close sidebar after navigation
    };
 
    const goToDisplay = () => {
        navigate('/display');
        closeSidebar(); // Optionally close sidebar after navigation
    };

    const goToClient = () => {
        navigate('/client');
        closeSidebar(); // Optionally close sidebar after navigation
    };

    const goToClientProfile = () => {
        navigate('/cprofile');
        closeSidebar(); // Optionally close sidebar after navigation
    };

    const goToLogin = () => {
        localStorage.clear('token');
        navigate('/login');
    };

    return (
        <div className={`home-page ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="sidebar-close-btn" onClick={closeSidebar}>&times;</button>
                </div>
                <button className="sidebar-link" onClick={goToEmployeeManagement}>Employee Management</button>
                <button className="sidebar-link" onClick={goToProfile}>Employee Profile</button>
                <button className="sidebar-link" onClick={goToRegister}>Manage User</button>
                <button className="sidebar-link" onClick={goToPayslip}>Generate Payslip</button>
                <button className="sidebar-link" onClick={goToDisplay}>Display Payslip</button>
                <button className="sidebar-link" onClick={goToClient}>Client Management</button>
                <button className="sidebar-link" onClick={goToClientProfile}>Client Profile</button>
                <button className="sidebar-link" onClick={goToLogin}>Log out</button>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="header">
                    <button className="open-nav-btn" onClick={openSidebar}>&#9776;</button>
                    <h1 className="page-title">Insansa Technology</h1>
                </div>
                <div className="content">
                </div>
            </div>
        </div>
    );
};

export default HomePage;

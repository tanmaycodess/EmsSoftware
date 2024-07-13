import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Home.css'; // Import your CSS file for styling

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HomePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [totalPayslips, setTotalPayslips] = useState(0);
    const [totalSalarySpent, setTotalSalarySpent] = useState(0); // State to hold total salary spent

    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeesRes, usersRes, clientsRes, payslipsRes] = await Promise.all([
                    axios.get('https://emssoftware-backend.onrender.com/total-employees'),
                    axios.get('https://emssoftware-backend.onrender.com/total-users'),
                    axios.get('https://emssoftware-backend.onrender.com/total-clients'),
                    axios.get('https://emssoftware-backend.onrender.com/total-payslips')
                ]);

                setTotalEmployees(employeesRes.data.total);
                setTotalUsers(usersRes.data.total);
                setTotalClients(clientsRes.data.total);
                setTotalPayslips(payslipsRes.data.total);
            } catch (error) {
                console.error('Error fetching totals:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchTotalSalarySpent = async () => {
            try {
                const response = await axios.get('https://emssoftware-backend.onrender.com/total-salary-spent');
                setTotalSalarySpent(response.data.totalSalarySpent);
            } catch (error) {
                console.error('Error fetching total salary spent:', error);
            }
        };

        fetchTotalSalarySpent();
    }, []);

    const chartData = {
        labels: ['Employees', 'Users', 'Clients', 'Payslips'],
        datasets: [
            {
                label: 'Total Count',
                data: [totalEmployees, totalUsers, totalClients, totalPayslips],
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0']
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count'
                }
            }
        },
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: (value, context) => {
                    return value.toLocaleString(); // Format the label as needed
                },
                font: {
                    weight: 'bold'
                }
            }
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // const openSidebar = () => {
    //     setSidebarOpen(true);
    // };

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
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="sidebar-close-btn" onClick={toggleSidebar}>
                        &times;
                    </button>
                </div>
                <button className="sidebar-link" onClick={goToEmployeeManagement}>
                    Manage Employee
                </button>
                <button className="sidebar-link" onClick={goToProfile}>
                    Employee Profile
                </button>
                <button className="sidebar-link" onClick={goToPayslip}>
                    Generate Payslip
                </button>
                <button className="sidebar-link" onClick={goToDisplay}>
                    View Payslip
                </button>
                <button className="sidebar-link" onClick={goToClient}>
                    Manage Client
                </button>
                <button className="sidebar-link" onClick={goToClientProfile}>
                    Client Profile
                </button>
                <button className="sidebar-link" onClick={goToRegister}>
                    Manage User Auth
                </button>
                <button className="sidebar-link" onClick={goToLogin}>
                    LogOut
                </button>
            </div>
            <div className="main-content">
                <div className="header">
                    <button className="open-nav-btn" onClick={toggleSidebar}>
                        &#9776;
                    </button>
                    <h1 className="page-title">Insansa's Dasboard</h1>
                </div>
                <div className="content">
                    <h2>Dashboard Overview</h2>
                    <div className="card-container">
                        <div className="card total-employees">
                            <div className="card-header">Total Employees</div>
                            <div className="card-body">{totalEmployees}</div>
                           
                        </div>
                        <div className="card total-users">
                            <div className="card-header">Total Users</div>
                            <div className="card-body">{totalUsers}</div>
                            
                        </div>
                        <div className="card total-clients">
                            <div className="card-header">Total Clients</div>
                            <div className="card-body">{totalClients}</div>
                           
                        </div>
                        <div className="card total-payslips">
                            <div className="card-header">Total Payslips</div>
                            <div className="card-body">{totalPayslips}</div>
                           
                        </div>
                        <div className="card total-salary-spent">
                            <div className="card-header">Total Salary Spent</div>
                            <div className="card-body">&#x20B9; {totalSalarySpent}</div>
                           
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

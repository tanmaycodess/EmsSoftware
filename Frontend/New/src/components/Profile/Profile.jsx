import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Profile = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [employee, setEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        axios.get('https://emssoftware-backend.onrender.com/employees')
            .then(response => setEmployees(response.data))
            .catch(error => console.error('Error fetching employees:', error));
    };

    useEffect(() => {
        if (selectedEmployeeId) {
            axios.get(`https://emssoftware-backend.onrender.com/employees/${selectedEmployeeId}`)
                .then(response => setEmployee(response.data))
                .catch(error => console.error('Error fetching employee data:', error));
        }
    }, [selectedEmployeeId]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEmployee(prevState => ({ ...prevState, [name]: value }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const updatedEmployee = { ...employee };
        updatedEmployee.date_of_joining = new Date(updatedEmployee.date_of_joining).toISOString().split('T')[0];
        axios.put(`https://emssoftware-backend.onrender.com/employees/${selectedEmployeeId}`, updatedEmployee)
            .then(() => {
                setIsEditing(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Employee details updated successfully',
                });
            })
            .catch(error => {
                console.error('Error updating employee data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while updating employee details',
                });
            });
    };

    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/home');
    };

    return (
        <div className="profile-container">
            <h1>Employee Profile</h1>
            <div className="select-employee">
                <label>Select Employee:</label>
                <select onChange={(e) => setSelectedEmployeeId(e.target.value)} value={selectedEmployeeId || ''}>
                    <option value="" disabled>Select an employee</option>
                    {employees.map(emp => (
                        <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                    ))}
                </select>
            </div>
            {employee && (
                <div className="employee-details-container">
                    {isEditing ? (
                        <form className="edit-form" onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input type="text" name="name" value={employee.name} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Category:</label>
                                <input type="text" name="categories" value={employee.categories} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" name="email" value={employee.email} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Salary:</label>
                                <input type="number" name="salary" value={employee.salary} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Date of Joining:</label>
                                <input type="date" name="date_of_joining" value={employee.date_of_joining} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Designation:</label>
                                <input type="text" name="designation" value={employee.designation} onChange={handleEditChange} />
                            </div>
                            <div className="button-group">
                                <button type="submit" className="save-button">Save</button>
                                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="employee-details">
                            <p><strong>Name:</strong> {employee.name}</p>
                            <p><strong>Category:</strong> {employee.categories}</p>
                            <p><strong>Email:</strong> {employee.email}</p>
                            <p><strong>Salary:</strong> {employee.salary}</p>
                            <p><strong>Date of Joining:</strong> {new Date(employee.date_of_joining).toLocaleDateString()}</p>
                            <p><strong>Designation:</strong> {employee.designation}</p>

                            <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
                        </div>
                    )}
                    <button className="home-button" onClick={goToHome}>Home</button>
                </div>
            )}
        </div>
    );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Employee.css';
import Swal from 'sweetalert2';

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        categories: '',
        salary: '',
        date_of_joining: '',
        designation: ''
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);

    const toggleFormVisibility = () => {
        setShowForm(!showForm);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        fetch('http://localhost:5000/employees')
            .then(response => response.json())
            .then(data => setEmployees(data))
            .catch(error => console.error('Error fetching employees:', error));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({ ...newEmployee, [name]: value });
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        if (newEmployee.name.trim() !== '' && newEmployee.email.trim() !== '') {
            fetch('http://localhost:5000/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmployee)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.employeeId) {
                        setEmployees([...employees, data]);
                        setNewEmployee({
                            name: '',
                            email: '',
                            categories: '',
                            salary: '',
                            date_of_joining: '',
                            designation: ''
                        });
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Employee added successfully!',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to add employee.',
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while adding the employee.',
                    });
                });
        }
    };

    // Delete an employee with confirmation
    const handleRemoveEmployee = (employeeId, employeeName) => {
        // Show confirmation dialog with employee name
        Swal.fire({
            icon: 'warning',
            title: `Are you sure?`,
            text: `Do you want to remove ${employeeName}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
        }).then((result) => {
            // Check if user confirmed deletion
            if (result.isConfirmed) {
                fetch(`http://localhost:5000/employees/${employeeId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message === 'Employee deleted successfully') {
                            setEmployees(employees => employees.filter(employee => employee.employeeId !== employeeId));
                            setSelectedEmployee(null);
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Employee removed successfully!',
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Failed to remove employee.',
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'An error occurred while removing the employee.',
                        });
                    });
            }
        });
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleLogout = () => {
        navigate('/home');
    };

    return (
        <div className="employee-management-container">
            <header className="header">
                <h1>Employee Management</h1>
                <button onClick={toggleFormVisibility} className="createEmployee">
                    {showForm ? 'Hide Form' : 'Add Employee'}
                </button>
            </header>

            {showForm && (
                <div className="addEmployee">
                    <form className="addEmployee_create" onSubmit={handleAddEmployee}>
                        <h2>Add a new Employee</h2>
                        <div>
                            <input
                                type="text"
                                name="name"
                                value={newEmployee.name}
                                onChange={handleInputChange}
                                placeholder="Enter employee's name"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleInputChange}
                                placeholder="Enter employee's email"
                                required
                            />
                        </div>
                        <input
                            type="number"
                            name="salary"
                            value={newEmployee.salary}
                            onChange={handleInputChange}
                            placeholder="Enter employee's salary"
                        />
                        <input
                            type="text"
                            name="designation"
                            value={newEmployee.designation}
                            onChange={handleInputChange}
                            placeholder="Enter employee's designation"
                        />
                        <select
                            name="categories"
                            value={newEmployee.categories}
                            onChange={handleInputChange}
                        >
                            <option value="">Choose employee's category</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Trainee">Trainee</option>
                            <option value="Contract">Contract</option>
                            <option value="IFFCO">IFFCO</option>
                            <option value="">NULL</option>
                        </select>
                        <label htmlFor="date_of_joining">Date of Joining:</label>
                        <input
                            type="date"
                            id="date_of_joining"
                            name="date_of_joining"
                            value={newEmployee.date_of_joining}
                            onChange={handleInputChange}
                        />
                        <button type="submit" className="addEmployee_create--submit">Submit</button>
                    </form>
                </div>
            )}

            <div className="employees">
                <div className="employees__names">
                    <span className="employees__names--title">Employee List</span>
                    <div className="employees__names--list">
                        {employees.map(employee => (
                            <span
                                key={employee.employeeId}
                                className="employees__names--item"
                                onClick={() => handleEmployeeClick(employee)}
                            >
                                {employee.name}
                                <i
                                    className="employeeDelete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveEmployee(employee.employeeId, employee.name);
                                    }}
                                >
                                    &#10060;
                                </i>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="employees__single">
                    <div className="employees__single--title">Employee Information</div>
                    <div className="employees__single--info">
                        {selectedEmployee ? (
                            <>
                                <span className="employees__single--heading">
                                    {selectedEmployee.name} ({selectedEmployee.designation})
                                </span>
                                <span>{selectedEmployee.email}</span>
                                <span>Category - {selectedEmployee.categories}</span>
                                <span>Salary - {selectedEmployee.salary}</span>
                                <span>Date of Joining - {new Date(selectedEmployee.date_of_joining).toLocaleDateString()}</span>
                                <span>Designation - {selectedEmployee.designation}</span>
                            </>
                        ) : (
                            <span>Please select an employee to see details</span>
                        )}
                    </div>
                </div>
            </div>

            <button onClick={handleLogout} className="logout">Home</button>
        </div>
    );
};

export default Employee;

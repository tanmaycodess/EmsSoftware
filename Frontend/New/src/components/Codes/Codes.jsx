import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Codes.css';
import Swal from 'sweetalert2';


function Codes() {
    const [employeeCodes, setEmployeeCodes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [employeeHasCode, setEmployeeHasCode] = useState(false);

    useEffect(() => {
        fetchEmployeeCodes();
        fetchEmployees();
    }, []);

    const fetchEmployeeCodes = async () => {
        try {
            const response = await axios.get('https://emssoftware-backend.onrender.com/employee-codes');
            setEmployeeCodes(response.data);
        } catch (error) {
            console.error('Error fetching employee codes:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('https://emssoftware-backend.onrender.com/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployeeId(employeeId);
        const codeExists = employeeCodes.some(code => code.employeeId === employeeId);
        setEmployeeHasCode(codeExists);
        if (codeExists) {
            const existingCode = employeeCodes.find(code => code.employeeId === employeeId).employeeCode;
            setEmployeeCode(existingCode);
        } else {
            setEmployeeCode('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!editMode && employeeHasCode) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: 'This employee already has a code assigned.',
                });
                return;
            }

            if (editMode) {
                await axios.put(`https://emssoftware-backend.onrender.com/employee-codes/${selectedEmployeeId}`, { employeeCode });
                setEmployeeCodes(employeeCodes.map(code =>
                    code.employeeId === selectedEmployeeId ? { employeeId: selectedEmployeeId, employeeCode } : code
                ));
            } else {
                await axios.post('https://emssoftware-backend.onrender.com/employee-codes', { employeeId: selectedEmployeeId, employeeCode });
                setEmployeeCodes([...employeeCodes, { employeeId: selectedEmployeeId, employeeCode }]);
            }

            // Clear fields after submission
            setSelectedEmployeeId('');
            setEmployeeCode('');
            setEditMode(false);
            setEmployeeHasCode(false);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.message, // Display the error message from the server
                });
            } else {
                console.error('Error saving employee code:', error);
            }
        }
    };


    const handleEdit = (code) => {
        setSelectedEmployeeId(code.employeeId);
        setEmployeeCode(code.employeeCode);
        setEditMode(true);
        setEmployeeHasCode(false);
    };

    const handleDelete = async (employeeId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`https://emssoftware-backend.onrender.com/employee-codes/${employeeId}`);
                setEmployeeCodes(employeeCodes.filter(code => code.employeeId !== employeeId));
                Swal.fire('Deleted!', 'The employee code has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting employee code:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete the employee code.',
                });
            }
        }
    };


    return (
        <div className="App">
            <h1>Employee Code Manager</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Employee</label>
                    <select
                        value={selectedEmployeeId}
                        onChange={handleEmployeeChange}
                        required
                        disabled={editMode}
                    >
                        <option value="" disabled>Select an employee</option>
                        {employees.map(employee => (
                            <option key={employee._id} value={employee.employeeId}>
                                {employee.name} (ID: {employee.employeeId})
                            </option>
                        ))}
                    </select>
                </div>
                {employeeHasCode && !editMode && (
                    <p>This employee already has a code assigned: {employeeCode}</p>
                )}
                <div>
                    <label>Employee Code</label>
                    <input
                        type="text"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        required
                        disabled={employeeHasCode && !editMode}
                    />
                </div>
                <button type="submit" disabled={employeeHasCode && !editMode}>
                    {editMode ? 'Update' : 'Add'} Employee Code
                </button>
            </form>
            <ul>
                {employeeCodes.map((code) => (
                    <li key={code.employeeId}>
                        <span>Employee ID: {code.employeeId} (Code: {code.employeeCode})</span>
                        <button onClick={() => handleEdit(code)}>Edit</button>
                        <button onClick={() => handleDelete(code.employeeId)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Codes;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Display.css';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function EmployeePayslips() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [payslips, setPayslips] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetch('http://localhost:5000/employees')
            .then((response) => response.json())
            .then((data) => setEmployees(data))
            .catch((error) => console.error('Error fetching employees:', error));
    }, []);

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployeeId(employeeId);
        fetchPayslips(employeeId, selectedDate);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (selectedEmployeeId) {
            fetchPayslips(selectedEmployeeId, date);
        }
    };

    const fetchPayslips = (employeeId, date) => {
        const formattedDate = format(date, 'yyyy-MM');
        axios.get(`http://localhost:5000/payslips/${employeeId}/${formattedDate}`)
            .then(response => setPayslips(response.data))
            .catch(error => console.error('Error fetching payslips:', error));
    };

    const downloadPayslip = (payslipID) => {
        Swal.fire({
            title: "Downloading...",
            text: "Your payslip download will start shortly.",
            icon: "info",
            buttons: false,
            timer: 2000,
        });

        axios.get(`http://localhost:5000/payslip/download/${payslipID}`, {
            responseType: 'arraybuffer',
        })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `payslip_${payslipID}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                Swal.fire({
                    title: "Download Complete!",
                    text: "Your payslip has been downloaded successfully.",
                    icon: "success",
                    button: "OK",
                });
            })
            .catch(error => {
                console.error('Error downloading payslip:', error);
                Swal.fire({
                    title: "Error",
                    text: "There was an error downloading the payslip. Please try again.",
                    icon: "error",
                    button: "OK",
                });
            });
    };


    const deletePayslip = (payslipID) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this payslip? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:5000/payslips/${payslipID}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: payslipID })
                })
                    .then(response => response.text())
                    .then(data => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Payslip deleted successfully!',
                            confirmButtonText: 'OK'
                        });
                        // Refresh payslips
                        setPayslips(payslips.filter(payslip => payslip.payslipId !== payslipID));
                    })
                    .catch(error => {
                        console.error('Error deleting payslip:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to delete payslip!',
                            confirmButtonText: 'OK'
                        });
                    });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    icon: 'info',
                    title: 'Cancelled',
                    text: 'Your payslip is safe!',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/home');
    };

    return (
        <div className="employee-payslips-container">
            <h1>Employee Payslips</h1>
            <div className="form-group">
                <label>Select Employee:</label>
                <select
                    name="employee"
                    value={selectedEmployeeId}
                    onChange={handleEmployeeChange}
                >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.employeeId} value={employee.employeeId}>
                            {employee.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Select Pay Period:</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM"
                    showMonthYearPicker
                />
            </div>
            {payslips.length > 0 ? (
                <table className="payslips-table">
                    <thead>
                        <tr>
                            <th>Pay Period</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payslips.map((payslip) => (
                            <tr key={payslip.payslipId}>
                                <td>{payslip.payPeriod}</td>
                                <td>{payslip.createdAt}</td>
                                <td>
                                    <button onClick={() => downloadPayslip(payslip.payslipId)}>Download</button>
                                    <button onClick={() => deletePayslip(payslip.payslipId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <h4>No payslips found for the selected employee and pay period.</h4>
            )}
            <button className='back' onClick={goToHome}>Home</button>
        </div>
    );
}

export default EmployeePayslips;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Payslip.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toWords } from 'number-to-words'; // Import the library

function Payslip() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        employeeName: '',
        designation: '',
        dateOfJoining: '',
        payPeriod: '',
        basicSalary: '',
        allowances: '',
        otherBenefits: '',
        tds: '',
        otherDeductions: '',
        netPay: '',
        paidDays: '',
        lopDays: ''
    });

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/employees')
            .then((response) => setEmployees(response.data))
            .catch((error) => console.error('Error fetching employees:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const updatedFormData = { ...prevData, [name]: value };

            if (name === 'employeeName') {
                const selectedEmployee = employees.find(emp => emp.name === value);
                if (selectedEmployee) {
                    const formattedDate = new Date(selectedEmployee.date_of_joining).toISOString().split('T')[0];
                    updatedFormData.designation = selectedEmployee.designation;
                    updatedFormData.dateOfJoining = formattedDate;
                    updatedFormData.basicSalary = selectedEmployee.salary;
                }
            }

            // Calculate net pay after updating the state
            calculateNetPay(updatedFormData);

            return updatedFormData;
        });
    };

    const calculateNetPay = (data) => {
        const basicSalary = parseFloat(data.basicSalary) || 0;
        const allowances = parseFloat(data.allowances) || 0;
        const otherBenefits = parseFloat(data.otherBenefits) || 0;
        const tds = parseFloat(data.tds) || 0;
        const otherDeductions = parseFloat(data.otherDeductions) || 0;
        const paidDays = parseFloat(data.paidDays) || 0;
        const lopDays = parseFloat(data.lopDays) || 0;

        const grossEarnings = basicSalary + allowances + otherBenefits;
        const totalDeductions = tds + otherDeductions;
        const monthlySalary = basicSalary + allowances + otherBenefits;

        // Calculate proportional deductions for LOP days
        const dailySalary = monthlySalary / 30;
        const lopDeduction = lopDays * dailySalary;

        const netPay = grossEarnings - totalDeductions - lopDeduction;

        // Update net pay in formData
        setFormData((prevData) => ({ ...prevData, netPay: netPay.toFixed(2) }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Company Details
        doc.setFontSize(12);
        doc.text('INSANSA Technologies', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text('1403 / 05, Highland Park, Dhokali, Thane (W) MH 400607. GSTN: 27AOVPP2379G1Z8', 105, 20, { align: 'center' });
        doc.text('Payslip for the Month of ' + formData.payPeriod, 105, 25, { align: 'center' });

        // Employee Pay Summary
        doc.autoTable({
            startY: 30,
            head: [['Employee Pay Summary', 'Employee Net Pay']],
            body: [
                [`Employee Name: ${formData.employeeName}`, `₹ ${formData.netPay}`],
                [`Designation: ${formData.designation}`, `Paid Days: ${formData.paidDays} | LOP Days: ${formData.lopDays}`],
                [`Date of Joining: ${formData.dateOfJoining}`, ''],
                [`Pay Period: ${formData.payPeriod}`, '']
            ],
            theme: 'plain',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            margin: { top: 30, left: 15, right: 15 }
        });

        // Earnings and Deductions
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['EARNINGS', 'AMOUNT', 'DEDUCTIONS', 'AMOUNT']],
            body: [
                ['Basic Salary', ` ₹ ${formData.basicSalary}`, 'TDS', ` ₹ ${formData.tds}`],
                ['Allowances', `₹ ${formData.allowances}`, 'Other Deductions', `₹ ${formData.otherDeductions}`],
                ['Other Benefits (Bonus)', `₹ ${formData.otherBenefits}`, '', ''],
                ['Gross Earnings', `₹ ${parseFloat(formData.basicSalary) + parseFloat(formData.allowances) + parseFloat(formData.otherBenefits)}`, 'Total Deductions', `₹ ${parseFloat(formData.tds) + parseFloat(formData.otherDeductions)}`]
            ],
            theme: 'plain',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            margin: { top: 10, left: 15, right: 15 }
        });

        // Convert netPay to words
        const netPayInWords = toWords(parseFloat(formData.netPay));

        // Net Payable
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            body: [
                [`Net Pay`, `₹ ${formData.netPay}`],
                [`Total Net Payable (Amount In Words)`, `${netPayInWords} rupees only`],
                [`**Total Net Payable = Gross Earnings - Total Deductions - LOP Deduction`, ``]
            ],
            theme: 'plain',
            bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            margin: { top: 10, left: 15, right: 15 }
        });

        // Save the PDF
        doc.save('payslip.pdf');

        // Show success message with SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Payslip generated successfully!',
            confirmButtonText: 'OK'
        });

        const pdfBlob = doc.output('blob');

        // Prepare the form data
        const formDataToUpload = new FormData();
        formDataToUpload.append('employeeId', employees.find(emp => emp.name === formData.employeeName).employeeId); // Assuming you have selectedEmployeeID in your state
        formDataToUpload.append('payPeriod', formData.payPeriod);
        formDataToUpload.append('payslip', pdfBlob, 'payslip.pdf');

        // Upload the PDF to the backend
        axios.post('http://localhost:5000/payslip', formDataToUpload)
            .then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Payslip generated and saved successfully!',
                    confirmButtonText: 'OK'
                });
            })
            .catch(error => {
                console.error('Error uploading payslip:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save payslip!',
                    confirmButtonText: 'OK'
                });
            });
    };

    return (
        <div className="payslip-container">
            <div className="content-container">
                <p className="main-title">Generate Payslip</p>
                <form className="payslip-form">
                    <div className="form-group">
                        <label>Employee Name:</label>
                        <select
                            name="employeeName"
                            value={formData.employeeName}
                            onChange={handleChange}
                        >
                            <option value="">Select Employee</option>
                            {employees.map((employee) => (
                                <option key={employee._id} value={employee.name}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Designation:</label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Joining:</label>
                        <input
                            type="date"
                            name="dateOfJoining"
                            value={formData.dateOfJoining}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label>Pay Period:</label>
                        <input
                            type="month"
                            name="payPeriod"
                            value={formData.payPeriod}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Basic Salary:</label>
                        <input
                            type="number"
                            name="basicSalary"
                            value={formData.basicSalary}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label>Allowances:</label>
                        <input
                            type="number"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Other Benefits:</label>
                        <input
                            type="number"
                            name="otherBenefits"
                            value={formData.otherBenefits}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>TDS:</label>
                        <input
                            type="number"
                            name="tds"
                            value={formData.tds}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Other Deductions:</label>
                        <input
                            type="number"
                            name="otherDeductions"
                            value={formData.otherDeductions}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Paid Days:</label>
                        <input
                            type="number"
                            name="paidDays"
                            value={formData.paidDays}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>LOP Days:</label>
                        <input
                            type="number"
                            name="lopDays"
                            value={formData.lopDays}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Net Pay:</label>
                        <input
                            type="number"
                            name="netPay"
                            value={formData.netPay}
                            readOnly
                        />
                    </div>
                    <button
                        type="button"
                        className="generate-button"
                        onClick={generatePDF}
                    >
                        Generate Payslip
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Payslip;

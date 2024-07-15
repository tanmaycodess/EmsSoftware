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
        professionalTax: 'Not Applicable', // Default value set to "Not Applicable"
        tds: 'Not Applicable', // Default value set to "Not Applicable"
        otherDeductions: '',
        netPay: '',
        paidDays: '',
        lopDays: ''
    });

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        axios.get('https://emssoftware-backend.onrender.com/employees')
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

    const handleTaxChange = (taxType) => {
        setFormData((prevData) => ({
            ...prevData,
            professionalTax: taxType === 'professionalTax' ? '200' : 'Not Applicable',
            tds: taxType === 'tds' ? '10%' : 'Not Applicable'
        }));
    };


    const calculateNetPay = (data) => {
        const basicSalary = parseFloat(data.basicSalary) || 0;
        const allowances = parseFloat(data.allowances) || 0;
        const otherBenefits = parseFloat(data.otherBenefits) || 0;
        const professionalTax = data.professionalTax === '200' ? 200 : 0;
        const tds = data.tds === '10%' ? (basicSalary * 0.10) : 0;
        const otherDeductions = parseFloat(data.otherDeductions) || 0;
        const paidDays = parseFloat(data.paidDays) || 0;
        const lopDays = parseFloat(data.lopDays) || 0;

        const grossEarnings = basicSalary + allowances + otherBenefits;
        const totalDeductions = professionalTax + tds + otherDeductions;
        const monthlySalary = basicSalary + allowances + otherBenefits;

        const dailySalary = monthlySalary / 30;
        const lopDeduction = lopDays * dailySalary;

        const netPay = grossEarnings - totalDeductions - lopDeduction;

        setFormData((prevData) => ({ ...prevData, netPay: netPay.toFixed(2) }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Add your logo image at the top left corner
        const logo = 'data: image / png; base64, iVBORw0KGgoAAAANSUhEUgAAAHQAAAAfCAYAAAA2qem + AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAABJ6SURBVGhD7VpZbFzndf7u7AuHy3A1N3GRRNnWYjuxZcuIbDeG4zSO49Qx4KBp0IfARRAUbYOi6GMf + tCHAG2Bok0fUhhIm4e2aevWNiJn81YncmRZlrVSIilquA6Hw5khZ78zt9 / 33yEpuRKNUjXQCjzy5d3 + 5ZzznfWOLYeEW6I64PCAxTOPOg / LRsVbg9fxwgu / eWxpHDxmxg59cnRrgJqpFmwCllwtoMh7n9eHnmiQQFY0AD4nYICuexzCyYE79InSLQAqjwOq9MiLyRW8O7 + M5aZmjM / M4IvD / Xh6VzeBtAmkD8QSNcsFdAfST5a2HwNpB3VOTyYzmMtkMeNvwvfn03h9KYvxeXprUYMs + qjGgh7rku4d87fGw964M + NueLUFNQasj916vPbTce0oGeVHn63TJl / ulWvAm7Q + l7Q + 8DranK3j2ruNK / dmC9IA7SM96dD11pO2DahDiLTF24kEvrewghcXFjG9VkJTKICmaBFnZqa4unIomaCLOsY76wZi10v1lzArwRomG4yagLE104Y0xCykNaVYCbuFwMzn7nHNfg7F17P1 + w1y7zf51RwdWp97iceNuXzGmgHWR / den6NDf7WWu55LPDNqbUniVfvA5x5mT3e9m9G2ARVzmvyrxTUU8nV0lAuoplfwQGc7HmqNIyj5SHX + M3Aaea9lqHHmSQpzBZVy3PP1wt + ANM68dkVgJudR5tUWc0SGEZkigdnQzboa9K7BuHmmtRr7rCtXh / a2NF8vGs8 + 1hAbRmfGaWOtr71uNoda4 / pmW3PHQ9cbPN + YtOr2iLnTR8UMtHSgI72Mr3XGMFSq4lenxnH83FX0xNs5SGxoC / qQx1WWwzkK1pvccYz + M9fuM12be02 / hq5L93ovzxA4RqEqvsK8v4lIVpWHW6jBkbXrcF8Zh1vfk / M39m4A5Zi5DS / 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';
        // Company Details
        doc.addImage(logo, 'PNG', 10, 10, 40, 10);
        doc.setFontSize(12);
        doc.text('INSANSA Technologies', 105, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.text('1403 / 05, Highland Park, Dhokali, Thane (W) MH 400607. GSTN: 27AOVPP2379G1Z8', 105, 35, { align: 'center' });
        doc.text(`Payslip for the Month of ${formData.payPeriod}`, 105, 40, { align: 'center' });

        // Employee Pay Summary
        doc.autoTable({
            startY: 50, // Adjusted for logo
            head: [['Employee Pay Summary', 'Employee Net Pay']],
            body: [
                [`Employee Name: ${formData.employeeName}`, `Rs ${formData.netPay}`],
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
                ['Basic Salary', `Rs ${formData.basicSalary}`, 'TDS', `${formData.tds}`],
                ['Allowances', `Rs ${formData.allowances}`, 'Professional Tax', `Rs ${formData.professionalTax}`],
                ['Other Deductions', `Rs ${formData.otherDeductions}`, '', ''],
                ['Gross Earnings', `Rs ${parseFloat(formData.basicSalary) + parseFloat(formData.allowances) + parseFloat(formData.otherBenefits)}`, 'Total Deductions', `Rs ${parseFloat(formData.tds) + parseFloat(formData.professionalTax) + parseFloat(formData.otherDeductions)}`],
                ['Net Pay', `Rs ${formData.netPay}`, '', '']
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
                [`Net Pay`, `Rs ${formData.netPay}`],
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
        axios.post('https://emssoftware-backend.onrender.com/payslip', formDataToUpload)
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
                        <label htmlFor="tds">TDS</label>
                        <select name="tds" id="tds" value={formData.tds} onChange={handleChange}>
                            <option value="Not Applicable">Not Applicable</option>
                            <option value="10%">10%</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Professional Tax:</label>
                        <select name="professionalTax" value={formData.professionalTax} onChange={(e) => handleChange(e)}>
                            <option value="Not Applicable">Not Applicable</option>
                            <option value="200">Rs 200</option>
                        </select>
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

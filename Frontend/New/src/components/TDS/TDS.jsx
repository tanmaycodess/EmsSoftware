import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './TDS.css';
import axios from 'axios';
import Papa from 'papaparse';
import Swal from 'sweetalert2';


const BillingDetails = () => {
    const [billingData, setBillingData] = useState([]);
    const [newEntry, setNewEntry] = useState({
        month: '', code: '', typeOfPayment: '', partyName: '', panNo: '', billDate: '', billAmt: '', tdsPercent: ''
    });
    const [persons, setPersons] = useState([]);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
    const [csvFile, setCsvFile] = useState(null);

    useEffect(() => {
        const fetchTdsRecords = async () => {
            try {
                const response = await axios.get('https://emssoftware-backend.onrender.com/tds'); // Replace with your actual API endpoint
                setPersons(response.data); // Assuming the response contains an array of TDS records
            } catch (error) {
                console.error('Error fetching TDS records:', error);
            }
        };

        fetchTdsRecords();
    }, []);

    const handleChange = (e) => {
        setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
    };

    const handleSelectName = (e) => {
        const selectedName = e.target.value;
        const person = persons.find(person => person.partyName === selectedName);
        setNewEntry({ ...newEntry, partyName: selectedName, panNo: person ? person.panCardNo : '' });
    };

    const handleAddEntry = () => {
        if (selectedEntryIndex !== null) {
            // Update existing entry
            const updatedData = billingData.map((entry, index) =>
                index === selectedEntryIndex ? newEntry : entry
            );
            setBillingData(updatedData);
            setSelectedEntryIndex(null);
        } else {
            // Add new entry
            setBillingData([...billingData, newEntry]);
        }
        setNewEntry({
            month: '', code: '', typeOfPayment: '', partyName: '', panNo: '', billDate: '', billAmt: '', tdsPercent: ''
        });
    };

    const handleDeleteEntry = (index) => {
        const updatedData = billingData.filter((_, i) => i !== index);
        setBillingData(updatedData);
    };

    const handleEditEntry = (index) => {
        setNewEntry(billingData[index]);
        setSelectedEntryIndex(index);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setCsvFile(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const data = result.data.map((row, index) => ({
                    srNo: index + 1,
                    month: row['Month'],
                    code: row['Code'],
                    typeOfPayment: row['Type of Payment'],
                    partyName: row['Party Name'],
                    panNo: row['PAN NO'],
                    billDate: row['Bill Date'],
                    billAmt: parseFloat(row['Bill Amt']),
                    tdsPercent: parseFloat(row['TDS %']),
                    tdsAmt: parseFloat(row['TDS Amt']),
                    totalAmt: parseFloat(row['Total Amt'])
                }));
                setBillingData(data);
            }
        });
    };

    const calculateTDSAmount = (billAmt, tdsPercent) => {
        return (billAmt * tdsPercent) / 100;
    };

    const calculateTotalAmount = (billAmt, tdsAmount) => {
        return billAmt - tdsAmount;
    };

    const headers = [
        { label: "Sr No", key: "srNo" },
        { label: "Month", key: "month" },
        { label: "Code", key: "code" },
        { label: "Type of Payment", key: "typeOfPayment" },
        { label: "Party Name", key: "partyName" },
        { label: "PAN NO", key: "panNo" },
        { label: "Bill Date", key: "billDate" },
        { label: "Bill Amt", key: "billAmt" },
        { label: "TDS %", key: "tdsPercent" },
        { label: "TDS Amt", key: "tdsAmt" },
        { label: "Total Amt", key: "totalAmt" }
    ];

    const csvData = billingData.map((data, index) => {
        const tdsAmt = calculateTDSAmount(data.billAmt, data.tdsPercent);
        const totalAmt = calculateTotalAmount(data.billAmt, tdsAmt);
        return {
            srNo: index + 1,
            month: data.month,
            code: data.code,
            typeOfPayment: data.typeOfPayment,
            partyName: data.partyName,
            panNo: data.panNo,
            billDate: data.billDate,
            billAmt: parseFloat(data.billAmt).toFixed(2),
            tdsPercent: parseFloat(data.tdsPercent).toFixed(2),
            tdsAmt: tdsAmt.toFixed(2),
            totalAmt: totalAmt.toFixed(2)
        };
    });

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Insansa Technologies", 105, 30, { align: 'center' });
        doc.setFontSize(16);
        doc.text("TDS Working From", 105, 37, { align: 'center' });
        doc.setFontSize(14);
        doc.text("Billing Details", 105, 44, { align: 'center' });

        const tableColumn = headers.map(header => header.label);
        const tableRows = csvData.map((data) => [
            data.srNo,
            data.month,
            data.code,
            data.typeOfPayment,
            data.partyName,
            data.panNo,
            data.billDate,
            data.billAmt,
            data.tdsPercent,
            data.tdsAmt,
            data.totalAmt
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50
        });

        // Get the generated PDF file as a Blob
        const pdfBlob = doc.output('blob');

        // Call function to upload PDF Blob to the server
        uploadPDF(pdfBlob);

        doc.save("billing_details.pdf");
    };

    const uploadPDF = async (pdfBlob) => {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'billing_details.pdf');

        try {
            const response = await axios.post('https://emssoftware-backend.onrender.com/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'PDF saved successfully!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error uploading PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to save PDF.',
                text: 'There was an issue saving the PDF.',
                confirmButtonText: 'Ok'
            });
        }
    };

    return (
        <div className="tds-container">
            <div className="upload-section">
                <input type="file" accept=".csv" onChange={handleFileUpload} />
                <CSVLink data={csvData} headers={headers} filename={"billing_details.csv"} className="btn">Download CSV</CSVLink>
                <button onClick={generatePDF}>Generate PDF</button>
            </div>
            <div className="entry-section">
                <h2>{selectedEntryIndex !== null ? 'Edit Entry' : 'Add Entry'}</h2>
                <form>
                    <input type="text" name="month" value={newEntry.month} onChange={handleChange} placeholder="Month" />
                    <input type="text" name="code" value={newEntry.code} onChange={handleChange} placeholder="Code" />
                    <input type="text" name="typeOfPayment" value={newEntry.typeOfPayment} onChange={handleChange} placeholder="Type of Payment" />
                    <select name="partyName" value={newEntry.partyName} onChange={handleSelectName}>
                        <option value="">Select Party Name</option>
                        {persons.map(person => (
                            <option key={person.partyName} value={person.partyName}>{person.partyName}</option>
                        ))}
                    </select>
                    <input type="text" name="panNo" value={newEntry.panNo} onChange={handleChange} placeholder="PAN NO" />
                    <input type="date" name="billDate" value={newEntry.billDate} onChange={handleChange} placeholder="Bill Date" />
                    <input type="number" name="billAmt" value={newEntry.billAmt} onChange={handleChange} placeholder="Bill Amt" />
                    <input type="number" name="tdsPercent" value={newEntry.tdsPercent} onChange={handleChange} placeholder="TDS %" />
                    <button type="button" onClick={handleAddEntry}>{selectedEntryIndex !== null ? 'Update' : 'Add'}</button>
                </form>
            </div>
            <div className="data-section">
                <h2>Billing Data</h2>
                <table>
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header.key}>{header.label}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {csvData.map((entry, index) => (
                            <tr key={index}>
                                {headers.map(header => (
                                    <td key={header.key}>{entry[header.key]}</td>
                                ))}
                                <td>
                                    <button onClick={() => handleEditEntry(index)}>Edit</button>
                                    <button onClick={() => handleDeleteEntry(index)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillingDetails;

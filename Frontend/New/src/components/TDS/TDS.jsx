import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import './TDS.css';
import axios from 'axios';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const BillingDetails = () => {
    const [billingData, setBillingData] = useState([]);
    const [newEntry, setNewEntry] = useState({
        month: '', code: '', typeOfPayment: 'Professional Tax', partyName: '', panNo: '', billDate: '', billAmt: '', tdsPercent: 10
    });
    const [persons, setPersons] = useState([]);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [isPasswordProtected, setIsPasswordProtected] = useState(true);
    const [enteredPassword, setEnteredPassword] = useState('');
    const correctPassword = 'password'; // Change this to your desired password

    useEffect(() => {
        const passwordStatus = localStorage.getItem('passwordStatus');
        if (passwordStatus === 'unlocked') {
            setIsPasswordProtected(false);
        } else {
            Swal.fire({
                title: 'Enter password',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (password) => {
                    if (password === correctPassword) {
                        localStorage.setItem('passwordStatus', 'unlocked');
                        return true;
                    } else {
                        Swal.showValidationMessage('Incorrect password');
                        return false;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsPasswordProtected(false);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = '/home'; // Redirect if the user cancels the prompt
                }
            });
        }

        const fetchTdsRecords = async () => {
            try {
                const response = await axios.get('https://emssoftware-backend.onrender.com/tds');
                setPersons(response.data);
            } catch (error) {
                console.error('Error fetching TDS records:', error);
            }
        };

        fetchTdsRecords();

        // Load data from localStorage
        const savedBillingData = JSON.parse(localStorage.getItem('billingData'));
        if (savedBillingData) {
            setBillingData(savedBillingData);
        }
    }, [isPasswordProtected]);

    const handleChange = (e) => {
        setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
    };

    const handleSelectName = (e) => {
        const selectedName = e.target.value;
        const person = persons.find(person => person.partyName === selectedName);
        setNewEntry({ ...newEntry, partyName: selectedName, panNo: person ? person.panCardNo : '' });
    };

    const handleAddEntry = () => {
        let updatedData;
        if (selectedEntryIndex !== null) {
            updatedData = billingData.map((entry, index) =>
                index === selectedEntryIndex ? newEntry : entry
            );
            setSelectedEntryIndex(null);
        } else {
            updatedData = [...billingData, newEntry];
        }
        setBillingData(updatedData);
        localStorage.setItem('billingData', JSON.stringify(updatedData)); // Save to localStorage
        setNewEntry({
            month: '', code: '', typeOfPayment: 'Professional Tax', partyName: '', panNo: '', billDate: '', billAmt: '', tdsPercent: 10
        });
    };

    const handleDeleteEntry = (index) => {
        const updatedData = billingData.filter((_, i) => i !== index);
        setBillingData(updatedData);
        localStorage.setItem('billingData', JSON.stringify(updatedData)); // Save to localStorage
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
                localStorage.setItem('billingData', JSON.stringify(data)); // Save to localStorage

                // Now upload the file to the server
                uploadFile(file);
            }
        });
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('month', newEntry.month); // Adjust as needed based on your requirements

        try {
            await axios.post('http://localhost:5/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire('Success', 'CSV file uploaded successfully!', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to upload CSV file', 'error');
        }
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

    const navigate = useNavigate();

    const goTohome = () => {
        navigate('/home');
    }

    if (isPasswordProtected) {
        return null; // Return null or a loading spinner while the password is being checked
    }

    return (
        <div className="tds-container">
            <div className="upload-section">
                <form encType="multipart/form-data">
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    <CSVLink data={csvData} headers={headers} filename={"billing_details.csv"} className="btn">Download CSV</CSVLink>
                </form>
            </div>
            <div className="entry-section">
                <h2>{selectedEntryIndex !== null ? 'Edit Entry' : 'Add Entry'}</h2>
                <form>
                    <input type="text" name="month" value={newEntry.month} onChange={handleChange} placeholder="Month" />
                    <input type="text" name="code" value={newEntry.code} onChange={handleChange} placeholder="Code" />
                    <input type="text" name="typeOfPayment" value={newEntry.typeOfPayment} onChange={handleChange} placeholder="Type of Payment" />
                    <input list="partyNames" name="partyName" value={newEntry.partyName} onChange={handleSelectName} placeholder="Party Name" />
                    <datalist id="partyNames">
                        {persons.map((person, index) => (
                            <option key={index} value={person.partyName} />
                        ))}
                    </datalist>
                    <input type="text" name="panNo" value={newEntry.panNo} onChange={handleChange} placeholder="PAN No" />
                    <input type="date" name="billDate" value={newEntry.billDate} onChange={handleChange} placeholder="Bill Date" />
                    <input type="number" name="billAmt" value={newEntry.billAmt} onChange={handleChange} placeholder="Bill Amount" />
                    <input type="number" name="tdsPercent" value={newEntry.tdsPercent} onChange={handleChange} placeholder="TDS %" />
                    <button type="button" onClick={handleAddEntry}>{selectedEntryIndex !== null ? 'Update Entry' : 'Add Entry'}</button>
                </form>
                <table>
                    <thead>
                        <tr>
                            <th>Sr No</th>
                            <th>Month</th>
                            <th>Code</th>
                            <th>Type of Payment</th>
                            <th>Party Name</th>
                            <th>PAN No</th>
                            <th>Bill Date</th>
                            <th>Bill Amount</th>
                            <th>TDS %</th>
                            <th>TDS Amount</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billingData.map((data, index) => {
                            const tdsAmt = calculateTDSAmount(data.billAmt, data.tdsPercent);
                            const totalAmt = calculateTotalAmount(data.billAmt, tdsAmt);
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{data.month}</td>
                                    <td>{data.code}</td>
                                    <td>{data.typeOfPayment}</td>
                                    <td>{data.partyName}</td>
                                    <td>{data.panNo}</td>
                                    <td>{data.billDate}</td>
                                    <td>{parseFloat(data.billAmt).toFixed(2)}</td>
                                    <td>{parseFloat(data.tdsPercent).toFixed(2)}</td>
                                    <td>{tdsAmt.toFixed(2)}</td>
                                    <td>{totalAmt.toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => handleEditEntry(index)}>Edit</button>
                                        <button onClick={() => handleDeleteEntry(index)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={goTohome}>Go to Home</button>
        </div>
    );
};

export default BillingDetails;

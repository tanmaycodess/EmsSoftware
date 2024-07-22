// src/components/TDSForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './TDSDETAILS.css';


const TDSForm = () => {
    const [partyName, setPartyName] = useState('');
    const [panCardNo, setPanCardNo] = useState('');
    const [tdsRecords, setTdsRecords] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    useEffect(() => {
        const fetchTdsRecords = async () => {
            try {
                const response = await fetch('https://emssoftware-backend.onrender.com/tds'); // Replace with your actual API endpoint
                const data = await response.json();
                setTdsRecords(data);
            } catch (error) {
                console.error('Error fetching TDS records:', error);
            }
        };

        fetchTdsRecords();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editMode && currentRecord) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to update this TDS record?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, update it!'
            });

            if (result.isConfirmed) {
                try {
                    await axios.put(`https://emssoftware-backend.onrender.com/tds/${currentRecord.tdsId}`, { partyName, panCardNo });
                    Swal.fire('Updated!', 'TDS record has been updated.', 'success');
                    setPartyName('');
                    setPanCardNo('');
                    setEditMode(false);
                    setCurrentRecord(null);
                    // Refresh TDS records after update
                    const response = await fetch('https://emssoftware-backend.onrender.com/tds');
                    const data = await response.json();
                    setTdsRecords(data);
                } catch (error) {
                    Swal.fire('Error!', 'Error updating TDS record.', 'error');
                    console.error('Error updating TDS record:', error);
                }
            }
        } else {
            try {
                await axios.post('https://emssoftware-backend.onrender.com/tds', { partyName, panCardNo });
                Swal.fire('Success!', 'TDS record added successfully!', 'success');
                setPartyName('');
                setPanCardNo('');
                // Refresh TDS records after adding a new one
                const response = await fetch('https://emssoftware-backend.onrender.com/tds');
                const data = await response.json();
                setTdsRecords(data);
            } catch (error) {
                Swal.fire('Error!', 'Error adding TDS record.', 'error');
                console.error('Error adding TDS record:', error);
            }
        }
    };

    const deleteTDSRecord = async (tdsId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`https://emssoftware-backend.onrender.com/tds/${tdsId}`, {
                    method: 'DELETE',
                });
                setTdsRecords(prevRecords => prevRecords.filter(record => record.tdsId !== tdsId));
                Swal.fire('Deleted!', 'TDS record has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Error deleting TDS record.', 'error');
                console.error('Error deleting TDS record:', error);
            }
        }
    };

    const handleEdit = (record) => {
        setPartyName(record.partyName);
        setPanCardNo(record.panCardNo);
        setCurrentRecord(record);
        setEditMode(true);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>
                    Party Name:
                    <input
                        type="text"
                        value={partyName}
                        onChange={(e) => setPartyName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    PAN Card No:
                    <input
                        type="text"
                        value={panCardNo}
                        onChange={(e) => setPanCardNo(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">{editMode ? 'Update TDS' : 'Add TDS'}</button>
                {editMode && (
                    <button type="button" onClick={() => {
                        setEditMode(false);
                        setPartyName('');
                        setPanCardNo('');
                        setCurrentRecord(null);
                    }}>
                        Cancel
                    </button>
                )}
            </form>

            <h2>TDS Records</h2>

            <div className='TDSR'>
                
                <ul>
                    {tdsRecords.map(record => (
                        <li key={record.tdsId}>
                            {record.partyName} - {record.panCardNo}
                            <button onClick={() => handleEdit(record)}>Edit</button>
                            <button onClick={() => deleteTDSRecord(record.tdsId)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default TDSForm;

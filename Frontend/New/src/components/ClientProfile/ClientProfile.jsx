import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ClientProfile.css';

function UpdateClient() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [client, setClient] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClientId) {
            fetchClient(selectedClientId);
        }
    }, [selectedClientId]);

    const fetchClients = () => {
        axios.get('http://localhost:5000/clients')
            .then(response => setClients(response.data))
            .catch(error => console.error('Error fetching clients:', error));
    };

    const fetchClient = (clientId) => {
        console.log(`Fetching client with ID: ${clientId}`); // Debugging line
        axios.get(`http://localhost:5000/clients/${clientId}`)
            .then(response => {
                console.log('Client data:', response.data); // Debugging line
                setClient(response.data);
            })
            .catch(error => {
                console.error('Error fetching client:', error);
                if (error.response) {
                    console.error('Server responded with:', error.response.status, error.response.data); // More detailed error info
                }
            });
    };

    const handleClientChange = (e) => {
        setSelectedClientId(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClient({ ...client, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:5000/clients/${selectedClientId}`, client)
            .then(response => {
                console.log(response.data);
                navigate('/client'); // Navigate back to clients page
            })
            .catch(error => console.error('Error updating client:', error));
    };
    return (
        <div className="container">
            <h1>Update Client</h1>
            <div>
                <select value={selectedClientId} onChange={handleClientChange}>
                    <option value="">Select a client</option>
                    {clients.map(client => (
                        <option key={client.clientId} value={client.clientId}>{client.name}</option>
                    ))}
                </select>
            </div>
            {selectedClientId && (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" value={client.name} onChange={handleInputChange} placeholder="Name" required />
                    <input type="email" name="email" value={client.email} onChange={handleInputChange} placeholder="Email" required />
                    <input type="text" name="phone" value={client.phone} onChange={handleInputChange} placeholder="Phone" />
                    <input type="text" name="address" value={client.address} onChange={handleInputChange} placeholder="Address" />
                    <input type="text" name="city" value={client.city} onChange={handleInputChange} placeholder="City" />
                    <input type="text" name="state" value={client.state} onChange={handleInputChange} placeholder="State" />
                    <input type="text" name="zipCode" value={client.zipCode} onChange={handleInputChange} placeholder="Zip Code" />
                    <button type="submit">Update Client</button>
                </form>
            )}
        </div>
    );
}

export default UpdateClient;

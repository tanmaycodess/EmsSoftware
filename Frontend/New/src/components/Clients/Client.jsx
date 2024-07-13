import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Client.css';

const Client = () => {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [selectedClient, setSelectedClient] = useState(null);
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('https://emssoftware-backend.onrender.com/clients');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };

    const handleAddClient = (e) => {
        e.preventDefault();
        console.log(newClient); // Add this line
        if (newClient.name.trim() !== '' && newClient.email.trim() !== '') {
            fetch('https://emssoftware-backend.onrender.com/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newClient)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.clientId) {
                        setClients([...clients, data]);
                        setNewClient({
                            name: '',
                            email: '',
                            phone: '',
                            address: '',
                            city: '',
                            state: '',
                            zipCode: ''
                        });
                        setShowForm(false);
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Client added successfully!',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to add client.',
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while adding the client.',
                    });
                });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter client name and email.',
            });
        }
    };




    const handleRemoveClient = async (clientId, clientName) => {
        console.log(`Attempting to delete client with id: ${clientId}, name: ${clientName}`);
        const result = await Swal.fire({
            icon: 'warning',
            title: `Are you sure?`,
            text: `Do you want to remove ${clientName}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`https://emssoftware-backend.onrender.com/clients/${clientId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete client.');
            }
            const data = await response.json();
            console.log(`Client deleted successfully: `, data);
            setClients(clients.filter(client => client.clientId !== clientId));
            setSelectedClient(null);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Client removed successfully!',
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while removing the client.',
            });
        }
    };



    const handleClientClick = (client) => {
        setSelectedClient(client);
    };

    const handleLogout = () => {
        navigate('/home');
    };

    return (
        <div className="client-management-container">
            <header className="header">
                <h1>Client Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="createClient">
                    {showForm ? 'Hide Form' : 'Add Client'}
                </button>
            </header>

            {showForm && (
                <div className={`addClient ${showForm ? 'active' : ''}`}>
                    <form className="addClient_form" onSubmit={handleAddClient}>
                        <h2>Add a new Client</h2>
                        <input
                            type="text"
                            name="name"
                            value={newClient.name}
                            onChange={handleInputChange}
                            placeholder="Enter client's name"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={newClient.email}
                            onChange={handleInputChange}
                            placeholder="Enter client's email"
                            required
                        />
                        <input
                            type="text"
                            name="phone"
                            value={newClient.phone}
                            onChange={handleInputChange}
                            placeholder="Enter client's phone"
                        />
                        <input
                            type="text"
                            name="address"
                            value={newClient.address}
                            onChange={handleInputChange}
                            placeholder="Enter client's address"
                        />
                        <input
                            type="text"
                            name="city"
                            value={newClient.city}
                            onChange={handleInputChange}
                            placeholder="Enter client's city"
                        />
                        <input
                            type="text"
                            name="state"
                            value={newClient.state}
                            onChange={handleInputChange}
                            placeholder="Enter client's state"
                        />
                        <input
                            type="text"
                            name="zipCode"
                            value={newClient.zipCode}
                            onChange={handleInputChange}
                            placeholder="Enter client's zip code"
                        />
                        <button onClick={handleAddClient}>Submit</button>
                    </form>
                </div>
            )}

            <div className="clients">
                <div className="clients__names">
                    <span className="clients__names--title">Client List</span>
                    <div className="clients__names--list">
                        {clients.map(client => (
                            <span
                                key={client.clientId}
                                className="clients__names--item"
                                onClick={() => handleClientClick(client)}
                            >
                                {client.name}
                                <i
                                    className="clientDelete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveClient(client.clientId, client.name);
                                    }}
                                >
                                    &#10060;
                                </i>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="clients__single">
                    <div className="clients__single--title">Client Information</div>
                    <div className="clients__single--info">
                        {selectedClient ? (
                            <>
                                <span className="clients__single--heading">{selectedClient.name}</span>
                                <span>Email: {selectedClient.email}</span>
                                <span>Phone: {selectedClient.phone}</span>
                                <span>Address: {selectedClient.address}, {selectedClient.city}, {selectedClient.state}, {selectedClient.zipCode}</span>
                            </>
                        ) : (
                            <span>Please select a client to see details</span>
                        )}
                    </div>
                </div>
            </div>

            <button onClick={handleLogout} className="logout">Home</button>
        </div>
    );
};

export default Client;
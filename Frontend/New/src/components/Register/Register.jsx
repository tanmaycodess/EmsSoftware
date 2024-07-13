import React, { useState, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://emssoftware-backend.onrender.com/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users:', response.statusText);
            }
        } catch (error) {
            console.error('An error occurred while fetching users:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Register a new user
    const handleRegistration = async () => {
        try {
            const response = await fetch('https://emssoftware-backend.onrender.com/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('User registered successfully!');
                setFormData({ email: '', password: '' });
                fetchUsers(); // Refresh user list
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User added successfully',
                    confirmButtonText: 'OK'
                });
            } else {
                console.error('Failed to register user:', response.statusText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to register user',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('An error occurred during registration:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred during registration',
                confirmButtonText: 'OK'
            });
        }
    };

    // Delete a user
    const handleRemoveUser = async (email) => {
        // Show confirmation dialog
        const confirmResult = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: `Do you want to remove the user with email: ${email}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
        });

        // Check if user confirmed deletion
        if (confirmResult.isConfirmed) {
            try {
                const response = await fetch(`https://emssoftware-backend.onrender.com/users`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    console.log('User removed successfully!');
                    fetchUsers(); // Refresh user list
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'User removed successfully',
                        confirmButtonText: 'OK'
                    });
                } else {
                    console.error('Failed to remove user:', response.statusText);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to remove user',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('An error occurred during user removal:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred during user removal',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/home');
    }

    return (
        <div className="container">
            <h1>User Management</h1>
            <form>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                <button type="button" onClick={handleRegistration}>Register</button>
            </form>

            <div className="user-list">
                <h2>Existing Users</h2>
                {users.map((user) => (
                    <div key={user.email} className="user-item">
                        {user.email}
                        <button onClick={() => handleRemoveUser(user.email)}>Remove</button>
                    </div>
                ))}
            </div>

            <button className="gobtn" onClick={goToHome}>Home</button>
        </div>
    );
}

export default UserManagementPage;

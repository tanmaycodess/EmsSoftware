import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const PdfManager = () => {
    const [pdfs, setPdfs] = useState([]); // Initialize as an empty array

    useEffect(() => {
        // Fetch all PDFs when the component mounts
        const fetchPdfs = async () => {
            try {
                const response = await axios.get('https://emssoftware-backend.onrender.com/pdfs');
                console.log('Fetched PDFs:', response.data); // Check the response data
                if (Array.isArray(response.data)) {
                    setPdfs(response.data);
                } else {
                    console.error('Unexpected response format');
                }
            } catch (error) {
                console.error('Error fetching PDFs:', error);
                Swal.fire('Error', 'Failed to fetch PDFs.', 'error');
            }
        };

        fetchPdfs();
    }, []);

    const handleDownload = async (id) => {
        try {
            console.log(`Requesting download for PDF with ID: ${id}`);
            const response = await axios.get(`/download-pdf/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pdf_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire('Success', 'PDF downloaded successfully.', 'success');
        } catch (error) {
            console.error('Error downloading PDF:', error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to download PDF.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this PDF!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`https://emssoftware-backend.onrender.com/pdfs/${id}`);
                Swal.fire('Deleted!', 'PDF has been deleted.', 'success');
                setPdfs(pdfs.filter(pdf => pdf.tdsPdfId !== id)); // Update state
            } catch (error) {
                console.error('Error deleting PDF:', error);
                Swal.fire('Error', 'Failed to delete PDF.', 'error');
            }
        }
    };

    const navigate = useNavigate();
    const goTOhome = () => {
        navigate('/home');
    }

    return (
        <div>
            <h1>PDF Manager</h1>
            <table>
                <thead>
                    <tr>
                        <th>CreatedAt</th>
                        <th>Filename</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(pdfs) && pdfs.length > 0 ? (
                        pdfs.map(pdf => (
                            <tr key={pdf.tdsPdfId}>
                                <td>{pdf.createdAt}</td>
                                <td>{pdf.filename}</td>
                                <td>
                                    <button onClick={() => handleDownload(pdf.tdsPdfId)}>Download</button>
                                    <button onClick={() => handleDelete(pdf.tdsPdfId)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No PDFs available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <button onClick={goTOhome}>Home</button>
        </div>
    );
};

export default PdfManager;

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import autoIncrement from 'mongoose-sequence';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());



const AutoIncrement = autoIncrement(mongoose);


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB Atlas Connection
const uri = process.env.MONGODB_URI;



mongoose.connect(uri
)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "Frontend", "New", "dist")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "Frontend", "New", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Define Mongoose schemas and models

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: Number,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    categories: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    date_of_joining: {
        type: Date,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

employeeSchema.plugin(AutoIncrement, { inc_field: 'employeeId' });

const Employee = mongoose.model('Employee', employeeSchema);

const payslipSchema = new mongoose.Schema({
    payslipId: {
        type: Number,
        unique: true
    },
    employeeId: {
        type: Number,
        required: true,
        ref: 'Employee'
    },
    payPeriod: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pdfFile: {
        type: Buffer,
        required: true
    }
});

payslipSchema.plugin(AutoIncrement, { inc_field: 'payslipId' });

const Payslip = mongoose.model('Payslip', payslipSchema);

const clientSchema = new mongoose.Schema({
    clientId: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
});

clientSchema.plugin(AutoIncrement, { inc_field: 'clientId' });

const Client = mongoose.model('Client', clientSchema);


// JWT token generation function
function generateTokenForUser(userEmail) {
    const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1d' });
    return token;
}

// Endpoint for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            const token = generateTokenForUser(email);
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Login failed. Invalid username or password.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register a new user
app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

// Delete a user by email
app.delete('/users', async (req, res) => {
    const { email } = req.body; // Correctly retrieve email from req.body
    try {
        const result = await User.deleteOne({ email });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        } else {
            return res.status(200).json({ message: 'User removed successfully' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

// Save a new employee
app.post('/employees', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch all employees
app.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch an employee by ID
app.get('/employees/:employeeId', async (req, res) => {
    try {
        const employeeId = parseInt(req.params.employeeId, 10); // Ensure employeeId is a number
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an employee by ID
app.put('/employees/:employeeId', async (req, res) => {
    try {
        const employeeId = parseInt(req.params.employeeId, 10); // Ensure employeeId is a number
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId },
            req.body,
            { new: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an employee by ID
app.delete('/employees/:employeeId', async (req, res) => {
    try {
        const employeeId = parseInt(req.params.employeeId, 10); // Ensure employeeId is a number
        const deletedEmployee = await Employee.findOneAndDelete({ employeeId });
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save a new payslip
app.post('/payslip', upload.single('payslip'), async (req, res) => {
    const { employeeId, payPeriod } = req.body;
    const pdfFile = req.file.buffer;

    try {
        const payslip = new Payslip({
            employeeId,
            payPeriod,
            pdfFile
        });
        await payslip.save();
        res.status(201).json({ message: 'Payslip uploaded and saved in database' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while saving the payslip.' });
    }
});

// Fetch payslips for a specific employee
app.get('/payslips/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const payslips = await Payslip.find({ employeeId: parseInt(employeeId, 10) });
        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the payslips.' });
    }
});

// Fetch payslips for a specific employee and pay period (month)
app.get('/payslips/:employeeId/:payPeriod', async (req, res) => {
    const { employeeId, payPeriod } = req.params;
    try {
        const payslips = await Payslip.find({
            employeeId: parseInt(employeeId, 10),
            payPeriod
        });
        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the payslips.' });
    }
});

// Delete a specific payslip
app.delete('/payslips/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Payslip.findOneAndDelete({ payslipId: parseInt(id, 10) });
        if (!result) {
            return res.status(404).json({ message: 'Payslip not found.' });
        }
        res.status(200).json({ message: 'Payslip deleted' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while deleting the payslip.' });
    }
});

// Endpoint to fetch and download a specific payslip
app.get('/payslip/download/:payslipId', async (req, res) => {
    const { payslipId } = req.params;

    try {
        // Find the payslip by ID
        const payslip = await Payslip.findOne({ payslipId });

        if (!payslip) {
            // If payslip not found, return a 404 response
            return res.status(404).json({ message: 'Payslip not found' });
        }

        // Set response headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=payslip_${payslipId}.pdf`,
        });

        // Send the PDF file
        res.send(payslip.pdfFile);
    } catch (error) {
        // Handle any errors during the process
        res.status(500).json({ message: 'An error occurred while downloading the payslip.' });
    }
});


// Endpoint to add a new client

// app.post('/clients', async (req, res) => {
//     const { name, email, phone, address, city, state, zipCode } = req.body;
//     const newClient = new Client({ name, email, phone, address, city, state, zipCode });
//     try {
//         await newClient.save();
//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (err) {
//         res.status(500).json({ message: 'An error occurred while adding the client.', error: err.message });
//     }
// });

app.post('/clients', async (req, res) => {
    const { name, email, phone, address, city, state, zipCode } = req.body;

    try {
        // Check if client with the same email already exists
        const existingClient = await Client.findOne({ email });

        if (existingClient) {
            return res.status(400).json({ message: 'Client with this email already exists.' });
        }

        const newClient = new Client({
            name,
            email,
            phone,
            address,
            city,
            state,
            zipCode
        });

        const savedClient = await newClient.save();
        res.status(201).json(savedClient);
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Failed to add client' });
    }
});



// Endpoint to fetch all clients
app.get('/clients', async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching clients.', error: err.message });
    }
});

// Endpoint to update a client by ID
app.put('/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const { name, email, phone, address, city, state, zipCode } = req.body;
    try {
        const updatedClient = await Client.findOneAndUpdate(
            { clientId: parseInt(clientId, 10) },
            { name, email, phone, address, city, state, zipCode },
            { new: true }
        );
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while updating the client.', error: err.message });
    }
});

// Endpoint to delete a client by ID
app.delete('/clients/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete client with id: ${id}`);
    try {
        const deletedClient = await Client.findOneAndDelete({ clientId: id });
        if (!deletedClient) {
            console.log(`Client not found with id: ${id}`);
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error(`Error deleting client with id: ${id}`, err);
        res.status(500).json({ message: 'An error occurred while deleting the client.', error: err.message });
    }
});

// Fetch a single client by clientId
app.get('/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const client = await Client.findOne({ clientId: clientId });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching the client.', error: err.message });
    }
});

// Update a client by clientId
app.put('/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const { name, email, phone, address, city, state, zipCode } = req.body;
    try {
        const updatedClient = await Client.findOneAndUpdate(
            { clientId: clientId },
            { name, email, phone, address, city, state, zipCode },
            { new: true }
        );
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while updating the client.', error: err.message });
    }
});



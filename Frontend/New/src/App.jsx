import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import ProtectedRoute from './Route/ProtectedRoute';
import Employee from './components/Employee/Employee';
import Profile from './components/Profile/Profile';
import Register from './components/Register/Register';
import Payslip from './components/Payslip/Payslip';
import Display from './components/Payslip/Display';
import Client from './components/Clients/Client';
import ClientProfile from './components/ClientProfile/ClientProfile'
import Codes from './components/Codes/Codes';
import TDS from './components/TDS/TDS';
import TDSDETAILS from './components/TDS/TDSDETAILS';
import List from './components/TDS/List';


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee"
            element={
              <ProtectedRoute>
                <Employee/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payslip"
            element={
              <ProtectedRoute>
                <Payslip />
              </ProtectedRoute>
            }
          />

          <Route
            path="/display"
            element={
              <ProtectedRoute>
                <Display />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <Client />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cprofile"
            element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/codes"
            element={
              <ProtectedRoute>
                <Codes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tds"
            element={
              <ProtectedRoute>
                <TDS />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tdsdetails"
            element={
              <ProtectedRoute>
                <TDSDETAILS />
              </ProtectedRoute>
            }
          />

          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      
    </div>
  )
}

export default App

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import AcceptRequest from './pages/AcceptRequest';
import Warehouse from './pages/Warehouse';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Tracking from './pages/Tracking';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <Header />

        <main style={{ flex: '1' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Customer from './components/Customer';
import Ticket from './components/Ticket';
import ViewTicket from './components/Viewticket';
import Support from './components/support';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/customer" element={<Customer />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/viewtickets" element={<ViewTicket />} />
          <Route path="/support" element={<Support />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;


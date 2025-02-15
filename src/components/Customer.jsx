import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Customer = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  React.useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/');
    }
  }, [navigate]);

  const handleRaiseTicket = () => {
    navigate('/ticket'); // Redirect to Ticket page
  };

  const handleViewTickets = () => {
    navigate('/viewtickets'); // Redirect to view tickets page
  };

  return (
    <div className="customer-page">
      <button 
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
      
      {/* Header Section */}
      <div className="header">
        <h1>Welcome to Customer Support</h1>
        <p>Choose an option below to get started.</p>
      </div>

      {/* Card Container */}
      <div className="card-container">
        <div className="card" onClick={handleRaiseTicket}>
          <FontAwesomeIcon icon={faTicketAlt} className="card-icon" />
          <h3>Raise a Ticket</h3>
          <p>Click here to raise a new ticket.</p>
        </div>
        <div className="card" onClick={handleViewTickets}>
          <FontAwesomeIcon icon={faListAlt} className="card-icon" />
          <h3>View Tickets</h3>
          <p>Click here to view all your raised tickets.</p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="footer">
        <p>
          &copy; 2023 Customer Support. All rights reserved. |{' '}
        </p>
      </div>
      <a href="/contact" className="contact">Contact Us</a>
    </div>
  );
};

export default Customer;
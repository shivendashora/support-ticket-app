import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../firebase-config';

const ViewTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const ticketsCollectionRef = collection(db, "tickets");

  const fetchTickets = async () => {
    try {
      // Check if tickets exist in local storage
      const localTickets = JSON.parse(localStorage.getItem('tickets'));

      // Display tickets from local storage immediately (if available)
      if (localTickets) {
        setTickets(localTickets);
      }

      // Fetch tickets from Firebase in the background
      const querySnapshot = await getDocs(query(ticketsCollectionRef));
      const ticketData = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ticketNumber: `TKT-${String(index + 1).padStart(4, '0')}`,
        ...doc.data()
      }));

      // Update local storage with fresh data from Firebase
      localStorage.setItem('tickets', JSON.stringify(ticketData));

      // Update state with fresh data (if local storage data was outdated)
      if (!localTickets || localTickets.length !== ticketData.length) {
        setTickets(ticketData);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/');
    } else {
      fetchTickets();
    }
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      // Delete ticket from Firebase
      await deleteDoc(doc(db, "tickets", id));
      
      // Update local storage by removing the deleted ticket
      const updatedTickets = tickets.filter(ticket => ticket.id !== id);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
      
      alert('Ticket deleted successfully');
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert('Error deleting ticket');
    }
  };

  const handleEdit = (ticket) => {
    navigate('/ticket', { state: { isEdit: true, ticket } });
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    localStorage.removeItem('isLoggedIn'); // Clear login state from localStorage
    navigate('/'); // Navigate to the login page
  };

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  // Sort tickets by priority: High > Medium > Low
  const sortTicketsByPriority = (tickets) => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered tickets by priority
  const sortedTickets = sortTicketsByPriority(filteredTickets);

  return (
    <div className="view-ticket-page">
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

      <h2>View Tickets</h2>
      
      <div className="header-controls">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search tickets by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      {sortedTickets.length === 0 ? (
        <p className="no-tickets">No tickets found.</p>
      ) : (
        <div className="tickets-grid">
          {sortedTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-number">{ticket.ticketNumber}</span>
                <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="ticket-body">
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-description">
                  {truncateDescription(ticket.description, 20)}
                </p>
                <div className="ticket-details">
                  <p><strong>Category:</strong> {ticket.category}</p>
                  <p><strong>Due Date:</strong> {ticket.dueDate}</p>
                  <p><strong>Contact Email:</strong> {ticket.contactEmail}</p>
                  <p><strong>Phone:</strong> {ticket.phone}</p>
                </div>
              </div>
              <div className="ticket-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(ticket)}>Edit</button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(ticket.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewTicket;
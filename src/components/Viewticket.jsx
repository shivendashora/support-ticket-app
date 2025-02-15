import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../firebase-config';  // Make sure you have this config file

const ViewTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const ticketsCollectionRef = collection(db, "tickets");

  const fetchTickets = async () => {
    try {
      const querySnapshot = await getDocs(query(ticketsCollectionRef));
      const ticketData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      await fetchTickets();
      alert('Ticket deleted successfully');
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert('Error deleting ticket');
    }
  };

  const handleEdit = (ticket) => {
    navigate('/ticket', { state: { isEdit: true, ticket } });
  };

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-ticket-page">
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

      {filteredTickets.length === 0 ? (
        <p className="no-tickets">No tickets found.</p>
      ) : (
        <div className="table-container">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Due Date</th>
                <th>Contact Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td className="description-cell">
                    <div className="description-text">
                      {truncateDescription(ticket.description, 20)}
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{ticket.category}</td>
                  <td>{ticket.dueDate}</td>
                  <td>{ticket.contactEmail}</td>
                  <td>{ticket.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={() => handleEdit(ticket)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(ticket.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;
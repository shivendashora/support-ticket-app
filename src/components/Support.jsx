import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import '../styles/support.css'; // Add this import

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Low",
    status: "Open",
    createdBy: "",
    assignedTo: "",
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Add handleLogout function
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ticketsCollectionRef = collection(db, "tickets"); // Changed from supportTickets to tickets

  // Updated fetchTickets function to get all tickets
  const fetchTickets = async () => {
    try {
      // Check cache first
      const cachedTickets = localStorage.getItem('allTickets');
      if (cachedTickets) {
        const parsed = JSON.parse(cachedTickets);
        setTickets(parsed);
        setFilteredTickets(parsed);
      }

      // Fetch from both collections
      const supportTicketsQuery = await getDocs(collection(db, "supportTickets"));
      const customerTicketsQuery = await getDocs(collection(db, "tickets"));

      const supportTickets = supportTicketsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'support'
      }));

      const customerTickets = customerTicketsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'customer'
      }));

      // Combine and sort by creation date
      const allTickets = [...supportTickets, ...customerTickets].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setTickets(allTickets);
      setFilteredTickets(allTickets);
      localStorage.setItem('allTickets', JSON.stringify(allTickets));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/');
    }
    fetchTickets();
  }, [navigate]);

  // Handle Add Ticket
  const handleAddTicket = async () => {
    try {
      const docRef = await addDoc(ticketsCollectionRef, {
        ...newTicket,
        createdAt: new Date(),
      });

      const newTicketWithId = { id: docRef.id, ...newTicket };
      const updatedTickets = [...tickets, newTicketWithId];
      
      // Update state and cache
      setTickets(updatedTickets);
      localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
      
      setIsModalOpen(false);
      setNewTicket({
        title: "",
        description: "",
        priority: "Low",
        status: "Open",
        createdBy: "",
        assignedTo: "",
      });
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "supportTickets", id));
      const updatedTickets = tickets.filter(ticket => ticket.id !== id);
      
      // Update state and cache
      setTickets(updatedTickets);
      localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  // Handle Save (Edit)
  const handleSave = async () => {
    try {
      const ticketRef = doc(db, "supportTickets", editingTicket.id);
      await updateDoc(ticketRef, editingTicket);
      
      const updatedTickets = tickets.map(ticket => 
        ticket.id === editingTicket.id ? editingTicket : ticket
      );
      
      // Update state and cache
      setTickets(updatedTickets);
      localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
      
      setEditingTicket(null);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({ ...newTicket, [name]: value });
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
  };

  const handleView = (ticket) => {
    setViewingTicket(ticket);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(viewingTicket, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `ticket_${viewingTicket.id}.json`;
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter((ticket) =>
        ticket.id.toString().includes(searchTerm.trim())
      );
      setFilteredTickets(filtered);
    }
  }, [searchTerm, tickets]);

  return (
    <div className="support-page">
      <button 
        onClick={handleLogout}
        className="header-button logout-button"
      >
        Logout
      </button>

      <h2 className="dashboard-title">Support Dashboard</h2>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by Ticket ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <button 
          className="header-button raise-ticket-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Raise Ticket
        </button>
      </div>

      <div className="table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.title || 'N/A'}</td>
                  <td>{ticket.description || 'N/A'}</td>
                  <td>
                    <span className={`priority-badge ${(ticket.priority || 'low').toLowerCase()}`}>
                      {ticket.priority || 'Low'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${(ticket.status || 'open').toLowerCase().replace(" ", "-")}`}>
                      {ticket.status || 'Open'}
                    </span>
                  </td>
                  <td>{ticket.createdBy || 'N/A'}</td>
                  <td>{ticket.assignedTo || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={() => handleView(ticket)}>View</button>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(ticket)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(ticket.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-entries-message">
                  No matching tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Raise a Ticket</h3>
            <label>
              Title: 
              <input type="text" name="title" value={newTicket.title} onChange={handleInputChange} />
            </label>
            <label>
              Description: 
              <textarea name="description" value={newTicket.description} onChange={handleInputChange} />
            </label>
            <label>
              Priority:
              <select name="priority" value={newTicket.priority} onChange={handleInputChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              Created By: 
              <input type="text" name="createdBy" value={newTicket.createdBy} onChange={handleInputChange} />
            </label>
            <label>
              Assigned To: 
              <input type="text" name="assignedTo" value={newTicket.assignedTo} onChange={handleInputChange} />
            </label>
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleAddTicket}>Submit</button>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editingTicket && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Ticket</h3>
            <label>
              Title: 
              <input type="text" name="title" value={editingTicket.title} onChange={(e) => setEditingTicket({...editingTicket, title: e.target.value})} />
            </label>
            <label>
              Description: 
              <textarea name="description" value={editingTicket.description} onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})} />
            </label>
            <label>
              Priority:
              <select name="priority" value={editingTicket.priority} onChange={(e) => setEditingTicket({...editingTicket, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              Status:
              <select 
                name="status" 
                value={editingTicket.status} 
                onChange={(e) => setEditingTicket({...editingTicket, status: e.target.value})}
                className={`status-dropdown ${editingTicket.status.toLowerCase().replace(" ", "-")}`}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <label>
              Created By: 
              <input type="text" name="createdBy" value={editingTicket.createdBy} onChange={(e) => setEditingTicket({...editingTicket, createdBy: e.target.value})} />
            </label>
            <label>
              Assigned To: 
              <input type="text" name="assignedTo" value={editingTicket.assignedTo} onChange={(e) => setEditingTicket({...editingTicket, assignedTo: e.target.value})} />
            </label>
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditingTicket(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {viewingTicket && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>View Ticket</h3>
            <div className="view-form">
              <label>
                Title: 
                <input type="text" value={viewingTicket.title} readOnly />
              </label>
              <label>
                Description: 
                <textarea value={viewingTicket.description} readOnly />
              </label>
              <label>
                Priority:
                <input type="text" value={viewingTicket.priority} readOnly />
              </label>
              <label>
                Created By: 
                <input type="text" value={viewingTicket.createdBy} readOnly />
              </label>
              <label>
                Assigned To: 
                <input type="text" value={viewingTicket.assignedTo} readOnly />
              </label>
            </div>
            <div className="modal-actions">
              <button className="download-btn" onClick={handleDownload}>Download</button>
              <button className="cancel-btn" onClick={() => setViewingTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
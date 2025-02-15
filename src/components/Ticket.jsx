import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';  // Make sure you have this config file

const Ticket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEdit, ticket: editTicket } = location.state || {};

  const [ticketDetails, setTicketDetails] = useState({
    title: '',
    description: '',
    priority: 'low',
    category: '',
    dueDate: '',
    contactEmail: '',
    phone: '',
    agreeTerms: false,
    notification: 'email',
    attachment: null,
  });

  const [errors, setErrors] = useState({});

  // Pre-fill the form if in edit mode
  useEffect(() => {
    if (isEdit && editTicket) {
      setTicketDetails({
        title: editTicket.title,
        description: editTicket.description,
        priority: editTicket.priority.toLowerCase(),
        category: editTicket.category.toLowerCase(),
        dueDate: editTicket.dueDate,
        contactEmail: editTicket.contactEmail,
        phone: editTicket.phone,
        agreeTerms: editTicket.agreeTerms,
        notification: editTicket.notification,
        attachment: editTicket.attachment,
      });
    }
  }, [isEdit, editTicket]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setTicketDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!ticketDetails.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Description validation
    if (!ticketDetails.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Contact Email validation
    if (!ticketDetails.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticketDetails.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }

    // Phone validation
    if (!ticketDetails.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(ticketDetails.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    // Terms agreement validation
    if (!ticketDetails.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const ticketsCollectionRef = collection(db, "tickets");

      if (isEdit) {
        // Update the ticket in Firebase
        const ticketDoc = doc(db, "tickets", editTicket.id);
        await updateDoc(ticketDoc, ticketDetails);
      } else {
        // Add new ticket to Firebase
        await addDoc(ticketsCollectionRef, {
          ...ticketDetails,
          createdAt: new Date(),
        });
      }

      // Redirect to ViewTicket component
      navigate('/viewtickets');
    }
  };

  return (
    <div className="ticket-page">
      <h2>{isEdit ? 'Edit Ticket' : 'Raise a New Ticket'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={ticketDetails.title}
            onChange={handleChange}
            placeholder="Enter a title for your ticket"
            required
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={ticketDetails.description}
            onChange={handleChange}
            placeholder="Describe your issue in detail"
            required
          ></textarea>
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        {/* Priority (Dropdown) */}
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={ticketDetails.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Category (Dropdown) */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={ticketDetails.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={ticketDetails.dueDate}
            onChange={handleChange}
            placeholder="Select a due date"
          />
        </div>

        {/* Contact Email */}
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={ticketDetails.contactEmail}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
          {errors.contactEmail && <span className="error">{errors.contactEmail}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={ticketDetails.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        {/* Notification Preference (Radio Buttons) */}
        <div className="form-group">
          <label>Notification Preference</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="notification"
                value="email"
                checked={ticketDetails.notification === 'email'}
                onChange={handleChange}
              />
              Email
            </label>
            <label>
              <input
                type="radio"
                name="notification"
                value="sms"
                checked={ticketDetails.notification === 'sms'}
                onChange={handleChange}
              />
              SMS
            </label>
          </div>
        </div>

        {/* Attachment (File Upload) */}
        <div className="form-group">
          <label htmlFor="attachment">Attachment</label>
          <div className="file-upload">
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleChange}
            />
            <label htmlFor="attachment">Choose File</label>
          </div>
        </div>

        {/* Terms Agreement (Checkbox) */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={ticketDetails.agreeTerms}
            onChange={handleChange}
          />
          <label htmlFor="agreeTerms">I agree to the terms and conditions</label>
          {errors.agreeTerms && <span className="error">{errors.agreeTerms}</span>}
        </div>

        {/* Submit Button */}
        <div className="submit-button-container">
          <button type="submit" className="submit-button">
            {isEdit ? 'Update Ticket' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Ticket;
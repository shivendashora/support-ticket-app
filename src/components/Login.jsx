import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/firebaseService';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Use isAuthenticated from context

  const CREDENTIALS = {
    customer: {
      email: import.meta.env.VITE_CUSTOMER_EMAIL || 'customer@support.com',
      password: import.meta.env.VITE_CUSTOMER_PASSWORD || '123',
    },
    support: {
      email: import.meta.env.VITE_SUPPORT_EMAIL || 'agent@support.com',
      password: import.meta.env.VITE_SUPPORT_PASSWORD || '123',
    },
  };

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate(userType === 'customer' ? '/customer' : '/support');
    }
  }, [isAuthenticated, navigate, userType]);

  const handleCheckboxChange = (type) => {
    setUserType(type);
  };

  const handleSignupToggle = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const email = data.email;
    const password = data.password;
    const username = data.username || '';

    try {
      if (isSignup) {
        await registerUser(email, password, username, userType);
        const userData = {
          email,
          username,
          userType,
        };

        // Store in Firestore
        await addDoc(collection(db, "users"), userData);

        alert('Account created successfully!');
        setIsSignup(false);
      } else {
        // Check if user type is selected
        if (!userType) {
          alert('Please select user type (Customer or Support).');
          return;
        }

        const credentials = userType === 'customer' ? CREDENTIALS.customer : CREDENTIALS.support;

        // Check if email and password match
        if (data.email === credentials.email && data.password === credentials.password) {
          login();
          navigate(userType === 'customer' ? '/customer' : '/support');
        } else {
          alert('Invalid credentials');
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="background-section">
        <div className="welcome-text">
          <h1 className='wlcome-heading'>Welcome to CSA</h1>
        </div>
      </div>
      <div className="login-container">
        <div className={`login-card ${isSignup ? 'signup' : ''}`}>
          <h2 className="login-header">{isSignup ? 'Sign Up' : 'Login'}</h2>
          <form onSubmit={handleFormSubmit} autoComplete="off">
            {isSignup && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required placeholder="Enter your email" />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" name="username" required placeholder="Enter your username" />
                </div>
              </>
            )}
            {!isSignup && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email" />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="Enter your password" />
            </div>
            {!isSignup && (
              <div className="checkboxgroup">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={userType === 'customer'}
                    onChange={() => handleCheckboxChange('customer')}
                  />
                  Customer
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={userType === 'support'}
                    onChange={() => handleCheckboxChange('support')}
                  />
                  Support
                </label>
              </div>
            )}
            <button type="submit" className="submit-button">{isSignup ? 'Sign Up' : 'Login'}</button>
          </form>
          <button onClick={handleSignupToggle} className="toggle-button">
            {isSignup ? 'Back to Login' : 'New user? Sign Up'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
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
  const { login } = useAuth();

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
        // Custom authentication for predefined users
        if (email === 'customer@support.com' && password === '123') {
          handleLogin();
          return;
        } else if (email === 'agent@support.com' && password === '123') {
          login(); // Set login state
          navigate('/support');
          return;
        }

        // If credentials don't match predefined users
        alert('Invalid credentials');
        return;

        // Comment out or remove the Firebase authentication for now
        // await loginUser(email, password);
        // alert('Login successful!');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = () => {
    login();
    navigate('/customer');
  };

  return (
    <div className="login-page">
      <div className="background-section"></div>
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

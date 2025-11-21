import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const api = axios.create({ baseURL: 'http://localhost:8080' });

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/register', { email, password });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Email taken?');
    }
  };

  return (
    // ADDED THIS WRAPPER
    <div className="auth-wrapper">
        <div className="login-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
            
            <div className="input-group">
            <label>Email</label>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            </div>

            <div className="input-group">
            <label>Password</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            </div>

            <button type="submit">REGISTER</button>
        </form>
        
        {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
        
        <div className="footer">
            <p>Have an account? <Link to="/login">Log In</Link></p>
        </div>
        </div>
    </div>
  );
}

export default RegisterPage;
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const api = axios.create({ baseURL: 'http://localhost:8080' });

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token); 
    } catch (err) {
      setError('Invalid credentials.');
    }
  };

  return (
    // ADDED THIS WRAPPER
    <div className="auth-wrapper">
        <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            
            <div className="input-group">
            <label>Email</label>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
            />
            </div>

            <div className="input-group">
            <label>Password</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
            />
            </div>

            <button type="submit">LOG IN</button>
        </form>
        
        {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
        
        <div className="footer">
            <p>New? <Link to="/register">Create Account</Link></p>
        </div>
        </div>
    </div>
  );
}

export default LoginPage;
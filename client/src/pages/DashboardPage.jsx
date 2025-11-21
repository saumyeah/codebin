import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

function DashboardPage() {
  const [snippets, setSnippets] = useState([]); 
  const { token, logout } = useAuth(); 
  const navigate = useNavigate(); 

  // Fetch Logic
  const fetchSnippets = async () => {
    try {
      const response = await api.get('/snippets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSnippets(response.data); 
    } catch (error) {
      console.error('Failed to fetch snippets', error);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, [token]);

  // Delete Logic
  const deleteSnippet = async (e, id) => {
    e.preventDefault(); 
    if (!window.confirm("Are you sure you want to delete this snippet?")) return;

    try {
      await api.delete(`/snippets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSnippets();
    } catch (error) {
      alert('Failed to delete snippet');
    }
  };

  // Create Logic
  const createNewSnippet = async () => {
    try {
      const response = await api.post('/snippets', 
        { 
          title: 'New Snippet', 
          content: '// Start coding...',
          language: 'javascript'
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      navigate(`/editor/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create snippet', error);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header Section */}
      <h2 style={{ 
        textAlign: 'center', 
        fontSize: '2rem', 
        fontWeight: '900', 
        marginBottom: '30px',
        textTransform: 'uppercase' 
      }}>
        Your Dashboard
      </h2>
      
      {/* Top Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <button 
          onClick={createNewSnippet}
          style={{
            backgroundColor: '#28a745', // Green
            color: 'white',
            padding: '15px 25px',
            fontWeight: 'bold',
            border: '2px solid black',
            boxShadow: '4px 4px 0px black',
            cursor: 'pointer'
          }}
        >
          + NEW SNIPPET
        </button>

        <button 
          onClick={logout} 
          style={{
            backgroundColor: '#dc3545', // Red
            color: 'white',
            padding: '15px 25px',
            fontWeight: 'bold',
            border: '2px solid black',
            boxShadow: '4px 4px 0px black',
            cursor: 'pointer'
          }}
        >
          LOGOUT
        </button>
      </div>
      
      <h3 style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>YOUR SNIPPETS:</h3>
      
      {/* THE SNIPPET CONTAINER GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        
        {snippets.length === 0 ? <p>No snippets found.</p> : snippets.map(snippet => (
          
          /* INDIVIDUAL SNIPPET CARD */
          <div key={snippet._id} style={{
            border: '2px solid black',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '6px 6px 0px black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '150px'
          }}>
            
            {/* CARD HEADER: Title on Left, Delete Button on Right */}
            <div style={{ 
                // display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10x',
                marginBottom: '10px'
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{snippet.title}</h4>
                    <span style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        
                    </span>
                </div>

                {/* DELETE BUTTON (Beside the title) */}
                <button 
                    onClick={(e) => deleteSnippet(e, snippet._id)} 
                    style={{ 
                      
                        backgroundColor: 'transparent',
                        color: 'red', 
                        cursor: 'pointer',
                        border: '0px solid red',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        padding: '1px 5px'
                    }}
                >
                    DELETE
                </button>
            </div>

            {/* OPEN BUTTON (Full width at bottom) */}
            <Link to={`/editor/${snippet._id}`}>
              <button style={{
                width: '100%',
                backgroundColor: 'black',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                border: 'none',
                fontWeight: 'bold',
                marginTop: '10px'
              }}>
                OPEN CODE
              </button>
            </Link>

          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import AceEditor from 'react-ace';
import io from 'socket.io-client';
import ace from 'ace-builds';

// Import modes (languages)
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
// Import theme
import 'ace-builds/src-noconflict/theme-monokai';

// Tell Ace where to find workers
ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.33.0/src-noconflict/"
);

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

const SOCKET_SERVER_URL = "http://localhost:8081";

function EditorPage() {
  const { snippetId } = useParams();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const socketRef = useRef();
  const isUpdatingFromSocket = useRef(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await api.get(`/snippets/${snippetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCode(response.data.content);
        setTitle(response.data.title);
        setLanguage(response.data.language);
      } catch (error) {
        console.error('Failed to load snippet', error);
        navigate('/');
      }
    };
    fetchSnippet();
  }, [snippetId, token, navigate]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    const socket = socketRef.current;

    socket.emit('join-room', snippetId);

    socket.on('receive-change', (newCode) => {
      isUpdatingFromSocket.current = true;
      setCode(newCode);
    });

    return () => {
      socket.disconnect();
    };
  }, [snippetId]);

  const handleSave = async () => {
    try {
      await api.put(`/snippets/${snippetId}`, 
        { title, content: code, language },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Saved!');
    } catch (error) {
      console.error('Failed to save snippet', error);
    }
  };

  const onEditorChange = (newCode) => {
    if (isUpdatingFromSocket.current) {
      isUpdatingFromSocket.current = false;
      return;
    }
    setCode(newCode);
    socketRef.current.emit('code-change', {
      room: snippetId,
      newCode: newCode
    });
  };

  return (
    // CHANGE: maxWidth set to 95vw (95% of screen width) to be much wider
    <div style={{ 
        width: '55vw',           // Takes up 95% of the view width
        maxWidth: '1600px',      // Stops it from getting too crazy on huge monitors
        margin: '20px auto',     // Centers it horizontally
        padding: '20px', 
        boxSizing: 'border-box',
        backgroundColor: '#ffffffff',
        minHeight: '100vh'
    }}>
      
      {/* CONTROLS ROW 1: Title and Language */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ 
            flex: 3, // Title takes more space
            padding: '12px', 
            border: '2px solid black', 
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        />
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            border: '2px solid black',
            fontSize: '16px'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* CONTROLS ROW 2: Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        
        {/* SAVE BUTTON (GREEN) */}
        <button 
            onClick={handleSave}
            style={{
                flex: 1,
                backgroundColor: '#28a745', // Green
                color: 'white',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '2px solid black',
                boxShadow: '4px 4px 0px black',
                cursor: 'pointer'
            }}
        >
            SAVE
        </button>

        {/* BACK BUTTON (BLACK) */}
        <button 
            onClick={() => navigate('/')}
            style={{
                flex: 1,
                backgroundColor: 'blue', // Black
                color: 'white',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '2px solid black',
                boxShadow: '4px 4px 0px black',
                cursor: 'pointer'
            }}
        >
            BACK TO DASHBOARD
        </button>
      </div>
      
      {/* EDITOR CONTAINER */}
      <div style={{ border: '2px solid black', boxShadow: '6px 6px 0px black' }}>
        <AceEditor
            mode={language}
            theme="monokai"
            onChange={onEditorChange}
            value={code}
            name="code-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="85vh"
            fontSize={16}
        />
      </div>
    </div>
  );
}

export default EditorPage;
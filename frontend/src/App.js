import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get backend URL from environment variable or detect it intelligently
  const getBackendUrl = () => {
    // If running in development with port-forward
    if (window.location.hostname === 'localhost') {
      return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    }
    // If accessing via minikube IP, use the same IP with backend port
    const currentUrl = new URL(window.location.href);
    return process.env.REACT_APP_BACKEND_URL || `http://${currentUrl.hostname}:30250`;
  };
  
  const BACKEND_URL = getBackendUrl();

  useEffect(() => {
    // Fetch data from FastAPI backend
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/data`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BACKEND_URL]);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="loading">Loading...</div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <p>Make sure the backend is running on {BACKEND_URL}</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI + Kubernetes</h1>
        <div className="data-container">
          <h2>Data from {data?.server}:</h2>
          <p>Environment: {data?.environment}</p>
          <ul className="data-list">
            {data?.data?.map(item => (
              <li key={item.id} className="data-item">
                <strong>{item.name}</strong>: {item.description}
              </li>
            ))}
          </ul>
        </div>
        <div className="tech-stack">
          <h3>Tech Stack</h3>
          <p>Frontend: React</p>
          <p>Backend: FastAPI</p>
          <p>Container: Docker</p>
          <p>Orchestration: Kubernetes</p>
        </div>
      </header>
    </div>
  );
}

export default App;
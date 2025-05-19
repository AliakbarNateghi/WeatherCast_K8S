import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic backend URL discovery
  const getBackendUrl = () => {
    // Check if explicit backend URL is provided
    if (process.env.REACT_APP_BACKEND_URL) {
      return process.env.REACT_APP_BACKEND_URL;
    }

    // If running via port-forward (localhost)
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8000';
    }

    // For minikube/cluster access, try to discover backend port
    // First try common ports, then fall back to detection
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`; // We'll handle this with a fallback detection
  };

  const [backendUrl, setBackendUrl] = useState(getBackendUrl());
  const [triedUrls, setTriedUrls] = useState([]);

  useEffect(() => {
    // Backend discovery and data fetching
    const discoverAndFetch = async () => {
      setLoading(true);
      setError(null);

      const hostname = window.location.hostname;
      const possiblePorts = [8000, 30250, 30755, 31000, 31500, 32000]; // Common NodePort range

      // If not localhost, try to discover the actual backend port
      if (hostname !== 'localhost' && !process.env.REACT_APP_BACKEND_URL) {
        console.log(`Discovering backend on ${hostname}...`);

        for (const port of possiblePorts) {
          const testUrl = `http://${hostname}:${port}`;

          try {
            console.log(`Trying backend at: ${testUrl}`);
            const response = await fetch(`${testUrl}/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(3000) // 3 second timeout
            });

            if (response.ok) {
              console.log(`✅ Found backend at: ${testUrl}`);
              setBackendUrl(testUrl);
              break;
            }
          } catch (err) {
            console.log(`❌ Backend not found at: ${testUrl}`);
            setTriedUrls(prev => [...prev, testUrl]);
            continue;
          }
        }
      }

      // Now fetch data from the discovered/configured backend
      try {
        console.log(`Fetching data from: ${backendUrl}`);
        const response = await fetch(`${backendUrl}/api/data`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(`Failed to connect to backend at ${backendUrl}. Error: ${err.message}`);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    discoverAndFetch();
  }, [backendUrl]);

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
            <h2>Backend Connection Error</h2>
            <p>{error}</p>
            <div className="debug-info">
              <h3>Debug Information:</h3>
              <p><strong>Current backend URL:</strong> {backendUrl}</p>
              <p><strong>Frontend URL:</strong> {window.location.href}</p>
              {triedUrls.length > 0 && (
                <div>
                  <p><strong>Attempted URLs:</strong></p>
                  <ul>
                    {triedUrls.map((url, index) => (
                      <li key={index}>{url}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p>Try running: <code>kubectl port-forward service/fastapi-service 8000:8000</code></p>
            </div>
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
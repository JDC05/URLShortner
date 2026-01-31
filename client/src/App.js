import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [result, setResult] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyticsCode, setAnalyticsCode] = useState('');

  const API_BASE_URL = 'http://localhost:3000';

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/shorten`, {
        url: longUrl,
        expiryDays: parseInt(expiryDays)
      });

      setResult(response.data.data);
      setLongUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnalytics = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalytics(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/${analyticsCode}`);
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>URL Shortener</h1>

        {/* Shorten URL Form */}
        <div className="card">
          <h2>Shorten URL</h2>
          <form onSubmit={handleShorten}>
            <div className="form-group">
              <input
                type="url"
                placeholder="Enter your long URL here..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="expiry">Expiry (days):</label>
              <input
                type="number"
                id="expiry"
                min="1"
                max="365"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="input-small"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <h3>URL Shortened Successfully!</h3>
              <div className="result-item">
                <strong>Short URL:</strong>
                <div className="url-display">
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="btn-copy"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="result-item">
                <strong>Short Code:</strong> {result.shortCode}
              </div>
              <div className="result-item">
                <strong>Expires In:</strong> {result.expiresIn}
              </div>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="card">
          <h2>View Analytics</h2>
          <form onSubmit={handleGetAnalytics}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter short code (e.g., abc123)"
                value={analyticsCode}
                onChange={(e) => setAnalyticsCode(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-secondary">
              {loading ? 'Loading...' : 'Get Analytics'}
            </button>
          </form>

          {analytics && (
            <div className="analytics">
              <h3>📊 Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-label">Short Code</div>
                  <div className="analytics-value">{analytics.shortCode}</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-label">Total Clicks</div>
                  <div className="analytics-value clicks">{analytics.clicks}</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-label">Expires In</div>
                  <div className="analytics-value">{analytics.expiresIn}</div>
                </div>
                <div className="analytics-item full-width">
                  <div className="analytics-label">Original URL</div>
                  <div className="analytics-value url">{analytics.longUrl}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
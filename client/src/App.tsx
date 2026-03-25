import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, User, Shirt, Sparkles, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import './styles/main.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [clothingPreview, setClothingPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [cleanClothing, setCleanClothing] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    // Check if user exists
    if (username.length > 3) {
      axios.get(`${API_BASE}/api/profile/${username}`)
        .then(res => {
          if (res.data.profile_image) {
            setProfilePreview(`${API_BASE}/${res.data.profile_image}`);
            setProfileSaved(true);
          }
        })
        .catch(() => {
          setProfileSaved(false);
          setProfilePreview(null);
        });
    }
  }, [username]);

  const handleProfileUpload = async () => {
    if (!username || !profileImage) return;
    setLoading(true);
    setStatus('Uploading profile...');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('image', profileImage);

    try {
      const res = await axios.post(`${API_BASE}/api/profile`, formData);
      setProfilePreview(`${API_BASE}/${res.data.profile_image}`);
      setProfileSaved(true);
      setStatus('Profile saved!');
    } catch (err) {
      setStatus('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTryOn = async () => {
    if (!username || !clothingImage) return;
    setLoading(true);
    setResultImage(null);
    setCleanClothing(null);
    setStatus('Processing try-on...');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('clothing', clothingImage);

    try {
      const res = await axios.post(`${API_BASE}/api/tryon`, formData);
      setResultImage(`${API_BASE}/${res.data.result_image}`);
      setCleanClothing(`${API_BASE}/${res.data.clean_clothing}`);
      setStatus('Try-on complete!');
    } catch (err) {
      setStatus('Error during try-on');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>PixSnap</h1>
        <p style={{color: 'var(--text-muted)'}}>Virtual Try-On with Nano Banana 2</p>
      </header>

      <div className="card">
        <div className="section-title">
          <User size={24} color="var(--primary)" />
          Your Profile
        </div>
        
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="upload-zone" onClick={() => document.getElementById('profileInput')?.click()}>
          {profilePreview ? (
            <img src={profilePreview} className="preview-img" alt="Profile" />
          ) : (
            <div className="placeholder-content">
              <Camera size={48} color="var(--text-muted)" style={{marginBottom: '1rem'}} />
              <p>Upload your full body look</p>
            </div>
          )}
          <input 
            id="profileInput"
            type="file" 
            hidden 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setProfileImage(file);
                setProfilePreview(URL.createObjectURL(file));
                setProfileSaved(false);
              }
            }}
          />
        </div>

        {!profileSaved && profileImage && (
          <button className="btn" style={{marginTop: '1rem'}} onClick={handleProfileUpload} disabled={loading}>
            {loading ? <div className="loading-spinner" /> : 'Save Look'}
          </button>
        )}
        
        {profileSaved && (
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginTop: '1rem', fontSize: '0.875rem'}}>
            <CheckCircle2 size={16} /> Look Saved
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">
          <Shirt size={24} color="var(--primary)" />
          Try on Something New
        </div>

        <div className="upload-zone" onClick={() => document.getElementById('clothingInput')?.click()}>
          {clothingPreview ? (
            <img src={clothingPreview} className="preview-img" alt="Clothing" />
          ) : (
            <div className="placeholder-content">
              <Upload size={48} color="var(--text-muted)" style={{marginBottom: '1rem'}} />
              <p>Snap a photo of a dress or shirt</p>
            </div>
          )}
          <input 
            id="clothingInput"
            type="file" 
            hidden 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setClothingImage(file);
                setClothingPreview(URL.createObjectURL(file));
                setResultImage(null);
              }
            }}
          />
        </div>

        <button 
          className="btn" 
          style={{marginTop: '1rem'}} 
          onClick={handleTryOn} 
          disabled={loading || !clothingImage || !profileSaved}
        >
          {loading ? <Loader2 className="loading-spinner" /> : (
            <>
              <Sparkles size={18} />
              Try It On
            </>
          )}
        </button>

        {status && <p style={{textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem', color: 'var(--text-muted)'}}>{status}</p>}
      </div>

      {(resultImage || cleanClothing) && (
        <div className="card">
          <div className="section-title">
            <Sparkles size={24} color="var(--primary)" />
            The Result
          </div>
          <div className="results-grid">
            <div>
              <label>Clean Clothing</label>
              {cleanClothing ? (
                <img src={cleanClothing} className="preview-img" alt="Clean" />
              ) : (
                <div className="placeholder-shape">Removing BG...</div>
              )}
            </div>
            <div>
              <label>Your New Look</label>
              {resultImage ? (
                <img src={resultImage} className="preview-img" alt="Result" />
              ) : (
                <div className="placeholder-shape">Merging...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

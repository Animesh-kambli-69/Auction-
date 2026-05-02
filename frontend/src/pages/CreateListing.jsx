import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuction } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './CreateListing.css'; // Let's just reuse dashboard/login styles or create a simple one

export default function CreateListing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    startingPrice: '',
    increment: '10',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If not logged in, they shouldn't be here, but we check
  if (!isAuthenticated) {
    return <div className="error-screen" style={{textAlign:'center', padding:'4rem'}}>Please login to create a listing.</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Backend expects specific types
      const payload = {
        ...formData,
        startingPrice: Number(formData.startingPrice),
        increment: Number(formData.increment),
        // we might need to send images if backend supports it, for now basic text
      };
      
      await createAuction(payload);
      alert("Listing requested successfully! It is pending admin approval.");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit listing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-listing-page">
      <div className="login-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Create Listing Request</h2>
        <p className="login-subtitle">Submit an item to be auctioned on AuctionHub</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required minLength="5" placeholder="e.g. Vintage Rolex" />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              minLength="10"
              placeholder="Describe the item condition, history, etc..."
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.03)', color: 'white', minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Starting Price ($)</label>
              <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} required min="0" />
            </div>
            
            <div className="form-group">
              <label>Bid Increment ($)</label>
              <input type="number" name="increment" value={formData.increment} onChange={handleChange} required min="1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: '#18181b', color: 'white' }}
              >
                <option value="Watches">Watches</option>
                <option value="Art">Art</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Gaming">Gaming</option>
                <option value="Audio">Audio</option>
                <option value="Antiques">Antiques</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          
          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

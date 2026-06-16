import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../api';
import './Profile.css';

export default function Profile() {
  const { user, login } = useAuth(); // assuming login or similar can update context
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          phone: data.phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  if (!profile) return <div className="error-screen">Error loading profile.</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">{profile.name.charAt(0)}</div>
            )}
          </div>
          <div className="profile-title">
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.role.toUpperCase()}</p>
            <p className="profile-email">{profile.email}</p>
          </div>
          {!isEditing && (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-stats">
            <div className="stat-card">
              <h3>{profile.totalBids || 0}</h3>
              <p>Total Bids</p>
            </div>
            <div className="stat-card">
              <h3>{profile.totalWins || 0}</h3>
              <p>Auctions Won</p>
            </div>
            {profile.role === 'seller' && (
              <div className="stat-card">
                <h3>{profile.totalListings || 0}</h3>
                <p>Total Listings</p>
              </div>
            )}
            <div className="stat-card">
              <h3>{profile.rating ? profile.rating.toFixed(1) : 'No'}</h3>
              <p>Rating</p>
            </div>
          </div>

          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info-display">
                <h3>About Me</h3>
                <p>{profile.bio || 'No bio provided yet.'}</p>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Location:</span>
                    <span className="value">{profile.location || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone:</span>
                    <span className="value">{profile.phone || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Member Since:</span>
                    <span className="value">{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

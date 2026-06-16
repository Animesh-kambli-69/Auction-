import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = io('http://localhost:5000', {
        auth: { token: user.token }
      });

      socket.on('outbid_notification', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          message: `You've been outbid on "${data.auctionTitle}"! Current bid is $${data.currentBid}.`,
          type: 'warning',
          link: `/auction/${data.auctionId}`
        }, ...prev]);
        // Simple browser alert or toast can go here as well
      });

      socket.on('auction_ending_soon', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          message: `Auction "${data.auctionTitle}" you bid on ends in 15 minutes!`,
          type: 'info',
          link: `/auction/${data.auctionId}`
        }, ...prev]);
      });

      return () => socket.disconnect();
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/home">AuctionHub</Link>
        </div>
        
        <form className="navbar-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search auctions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/home">Explore</Link>
          {isAuthenticated && (
            <>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem', position: 'relative' }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div style={{ position: 'absolute', top: '40px', right: '0', width: '300px', background: '#18181b', border: '1px solid var(--color-border)', borderRadius: '12px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold' }}>Notifications</div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No new notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: notif.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }} onClick={() => { navigate(notif.link); setShowNotifications(false); }}>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {user?.role !== 'admin' && user?.role !== 'superadmin' && (
                <Link to="/create-listing" style={{ color: 'var(--color-primary)' }}>+ Create Listing</Link>
              )}
              <Link to="/profile">Profile</Link>
              <Link to="/dashboard">Dashboard</Link>
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <Link to="/admin">Admin</Link>
              )}
            </>
          )}
          <button className="auth-btn" onClick={handleAuthAction}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

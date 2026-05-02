import React, { useEffect, useState } from 'react';
import { fetchPendingAuctions, approveAuction, rejectAuction, fetchAllUsers, fetchAdminReports, fetchAdminDisputes } from '../api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approvals');
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pendingData, usersData, reportsData, disputesData] = await Promise.all([
        fetchPendingAuctions(),
        fetchAllUsers(),
        fetchAdminReports(),
        fetchAdminDisputes()
      ]);
      setPending(pendingData);
      setUsers(usersData);
      setReports(reportsData);
      setDisputes(disputesData);
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === 'active') {
        await approveAuction(id);
      } else if (status === 'rejected') {
        await rejectAuction(id, 'Rejected by admin');
      }
      setPending(pending.filter(a => a._id !== id));
      alert(`Auction ${status} successfully.`);
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="loading-screen">Loading admin dashboard...</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Admin Command Center</h2>
        <p>Manage platform rules, user safety, and disputes.</p>
        
        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>Approvals</button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Flagged Reports</button>
          <button className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`} onClick={() => setActiveTab('disputes')}>Disputes</button>
        </div>
      </header>

      {activeTab === 'approvals' && (
        <section className="dashboard-card full-width">
          <h3>Pending Approvals ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="empty-state">No pending auctions to review.</p>
          ) : (
            <div className="admin-list">
              {pending.map(auction => (
                <div key={auction._id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="item-info">
                    <h4>{auction.title}</h4>
                    <p style={{ color: 'var(--color-text-muted)' }}>Requested by: {auction.seller?.name || 'Unknown User'}</p>
                    <p>Starting Price: ${auction.startingPrice}</p>
                  </div>
                  <div className="item-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => handleStatusUpdate(auction._id, 'active')} style={{ background: '#22c55e', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleStatusUpdate(auction._id, 'rejected')} style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="dashboard-card full-width">
          <h3>User Management ({users.length})</h3>
          <div className="admin-list">
            {users.map(u => (
              <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <h4>{u.name}</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>{u.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.85rem' }}>{u.role}</span>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>{u.isVerified ? '✓ Verified' : 'Unverified'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="dashboard-card full-width">
          <h3>Flagged Reports ({reports.length})</h3>
          {reports.length === 0 ? (
            <p className="empty-state">No active reports.</p>
          ) : (
            <div className="admin-list">
              {reports.map(r => (
                <div key={r._id} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ color: '#ef4444' }}>🚩 {r.reason.replace('_', ' ').toUpperCase()}</h4>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{r.status}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0' }}>{r.description}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Reported by: {r.reporter?.email} | Target: {r.reportedAuction ? r.reportedAuction.title : r.reportedUser?.email}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'disputes' && (
        <section className="dashboard-card full-width">
          <h3>Active Disputes ({disputes.length})</h3>
          {disputes.length === 0 ? (
            <p className="empty-state">No active disputes.</p>
          ) : (
            <div className="admin-list">
              {disputes.map(d => (
                <div key={d._id} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ color: '#f59e0b' }}>⚠️ {d.reason.replace(/_/g, ' ').toUpperCase()}</h4>
                    <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{d.status}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0' }}><strong>Buyer issue:</strong> {d.description}</p>
                  {d.sellerResponse && (
                    <p style={{ margin: '0.5rem 0', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}><strong>Seller response:</strong> {d.sellerResponse}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      Auction: {d.auction?.title} | Buyer: {d.buyer?.email} | Seller: {d.seller?.email}
                    </p>
                    <button 
                      onClick={() => navigate(`/dispute/${d._id}`)}
                      style={{ background: 'var(--color-primary)', color: 'black', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                      View Thread / Mediate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

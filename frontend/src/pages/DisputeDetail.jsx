import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDisputeById, addDisputeMessage } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css'; // Reuse dashboard styles

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const loadDispute = async () => {
    try {
      const data = await getDisputeById(id);
      setDispute(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dispute.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispute();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dispute?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      const updatedDispute = await addDisputeMessage(id, newMessage);
      setDispute(updatedDispute);
      setNewMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading dispute...</div>;
  if (error || !dispute) return <div className="error-screen">{error || 'Dispute not found'}</div>;

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isBuyer = String(user?._id) === String(dispute.buyer?._id);
  const isSeller = String(user?._id) === String(dispute.seller?._id);

  return (
    <div className="dashboard-page" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '80px' }}>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', background: 'transparent', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
        ← Back
      </button>

      <div className="dashboard-card full-width">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#f59e0b' }}>Dispute: {dispute.auction?.title}</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Reason: {dispute.reason.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
            {dispute.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)' }}>Buyer</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{dispute.buyer?.name} ({dispute.buyer?.email})</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)' }}>Seller</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{dispute.seller?.name} ({dispute.seller?.email})</p>
          </div>
        </div>

        <div className="messages-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '500px', overflowY: 'auto', padding: '1rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          {/* Initial Dispute Description */}
          <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <span>{dispute.buyer?.name} (Buyer)</span>
              <span>{new Date(dispute.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ margin: 0 }}>{dispute.description}</p>
          </div>

          {/* Legacy Seller Response */}
          {dispute.sellerResponse && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <span>{dispute.seller?.name} (Seller)</span>
                <span>{new Date(dispute.sellerRespondedAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: 0 }}>{dispute.sellerResponse}</p>
            </div>
          )}

          {/* Message Thread */}
          {dispute.messages?.map((msg, idx) => {
            const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);
            const roleColor = msg.role === 'buyer' ? '#ef4444' : msg.role === 'seller' ? '#3b82f6' : '#22c55e';
            
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', background: isMe ? 'rgba(var(--color-primary-rgb), 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: isMe ? 'none' : `4px solid ${roleColor}`, borderRight: isMe ? `4px solid ${roleColor}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', gap: '2rem' }}>
                  <span>{msg.sender?.name || 'Unknown'} ({msg.role})</span>
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0 }}>{msg.message}</p>
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>📎 View Attachment</a>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {['resolved_buyer_refunded', 'resolved_seller_paid', 'dismissed'].includes(dispute.status) ? (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            This dispute has been resolved and is now closed.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
            <button type="submit" disabled={submitting || !newMessage.trim()} style={{ padding: '0 2rem', background: 'var(--color-primary)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting || !newMessage.trim() ? 'not-allowed' : 'pointer', opacity: submitting || !newMessage.trim() ? 0.5 : 1 }}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

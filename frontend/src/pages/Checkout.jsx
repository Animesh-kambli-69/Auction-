import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById, processPayment } from '../api';
import './Checkout.css';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctionById(id);
        setAuction(data);
        if (data.payment?.status === 'paid') {
          setSuccess(true);
        }
      } catch (err) {
        console.error('Failed to load auction for checkout', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Please provide a shipping address');
      return;
    }

    setProcessing(true);
    try {
      await processPayment(id, { address });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Checkout...</div>;
  if (!auction) return <div className="error-screen">Auction not found.</div>;

  const totalAmount = auction.currentBid || auction.startingPrice;
  const tax = totalAmount * 0.08;
  const shipping = 25;
  const finalTotal = totalAmount + tax + shipping;

  if (success) {
    return (
      <div className="checkout-page success-state">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Your payment of <strong>${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> has been processed securely.</p>
          <div className="order-details">
            <p><strong>Item:</strong> {auction.title}</p>
            <p><strong>Transaction ID:</strong> {auction.payment?.transactionId || `txn_${Math.random().toString(36).substr(2, 9)}`}</p>
            <p><strong>Shipping To:</strong> {address || auction.payment?.shippingAddress}</p>
          </div>
          <button className="back-btn" onClick={() => navigate('/home')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-item-card">
            <div className="item-image" style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400'})` }}></div>
            <div className="item-info">
              <h3>{auction.title}</h3>
              <p className="winning-bid">Winning Bid: ${totalAmount.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>Estimated Tax (8%)</span>
              <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="price-row">
              <span>Shipping & Handling</span>
              <span>${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="checkout-form-container">
          <h2>Checkout</h2>
          <p className="secure-badge">🔒 Secure Payment</p>
          
          <form onSubmit={handlePayment} className="checkout-form">
            <div className="form-section">
              <h3>Shipping Information</h3>
              <div className="form-group">
                <label>Full Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  required
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="mock-card-element">
                <div className="card-input">Card number: •••• •••• •••• 4242</div>
                <div className="card-input-row">
                  <div className="card-input half">MM / YY</div>
                  <div className="card-input half">CVC</div>
                </div>
              </div>
              <p className="mock-note">This is a simulated checkout. No real card is charged.</p>
            </div>

            <button type="submit" className="pay-btn" disabled={processing}>
              {processing ? 'Processing...' : `Pay $${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate(`/auction/${id}`)}>
              Back to Auction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

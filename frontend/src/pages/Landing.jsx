import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuctions, fetchSiteReviews } from '../api';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [topAuctions, setTopAuctions] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activeAuctions, siteReviews] = await Promise.all([
          fetchAuctions({ status: 'active' }),
          fetchSiteReviews({ limit: 3 })
        ]);
        
        // Sort active auctions by current price to get highest
        const sortedAuctions = activeAuctions.sort((a, b) => {
          const priceA = a.currentBid || a.startingPrice;
          const priceB = b.currentBid || b.startingPrice;
          return priceB - priceA;
        });
        
        setTopAuctions(sortedAuctions.slice(0, 3));
        setReviews(siteReviews.slice(0, 3));
      } catch (err) {
        console.error("Failed to load landing data", err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover the Extraordinary</h1>
          <p className="hero-subtitle">
            Join the world's most exclusive digital auction house. Bid on rare artifacts, fine art, and premium collectibles in real-time.
          </p>
          <button className="primary-action" onClick={() => navigate('/home')}>
            Enter AuctionHub
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="hero-visual">
          <div className="gavel-animation">
            <div className="gavel"></div>
            <div className="base"></div>
          </div>
        </div>
      </section>

      {/* Top 3 Auctions Section */}
      {topAuctions.length > 0 && (
        <section className="top-auctions-section">
          <h2>Top Premium Auctions</h2>
          <p className="section-desc">The highest valued items currently up for bidding.</p>
          <div className="landing-auction-grid">
            {topAuctions.map(auction => (
              <div key={auction._id} className="landing-auction-card" onClick={() => navigate(`/auction/${auction._id}`)}>
                <div 
                  className="landing-auction-image" 
                  style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'})` }}
                ></div>
                <div className="landing-auction-details">
                  <h3>{auction.title}</h3>
                  <div className="price-tag">
                    ${(auction.currentBid || auction.startingPrice).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>About AuctionHub</h2>
          <p>
            AuctionHub was founded on the belief that acquiring rare and premium items should be a seamless, thrilling, and transparent experience. 
            We bridge the gap between discerning collectors and world-class artifacts, offering a real-time, anti-snipe bidding environment that ensures fairness for all participants.
          </p>
          <p>
            Whether you are looking for vintage timepieces, contemporary art, or historical memorabilia, our curated selection meets the highest standards of authenticity and provenance.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat-box">
            <h3>50K+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-box">
            <h3>$10M+</h3>
            <p>In Successful Bids</p>
          </div>
          <div className="stat-box">
            <h3>100%</h3>
            <p>Verified Sellers</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="landing-reviews-section">
        <h2>What Our Users Say</h2>
        <p className="section-desc">Don't just take our word for it.</p>
        <div className="landing-reviews-grid">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="landing-review-card">
                <div className="landing-review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <p className="landing-review-text">"{review.comment}"</p>
                <div className="landing-reviewer-name">- {review.reviewer?.name || 'Anonymous'}</div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)' }}>No reviews yet.</p>
          )}
        </div>
        <button className="secondary-action" onClick={() => navigate('/reviews')}>
          Read All Reviews & Leave Yours
        </button>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <h2>Get in Touch</h2>
          <p>Have questions about bidding or selling? Our support team is here 24/7.</p>
          <div className="contact-info-grid">
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email Us</h3>
              <p>support@auctionhub.com</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>Call Us</h3>
              <p>+1 (800) 123-4567</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Visit Us</h3>
              <p>123 Collector's Avenue, NY 10001</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

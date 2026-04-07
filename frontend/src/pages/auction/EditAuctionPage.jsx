// frontend/src/pages/auction/EditAuctionPage.jsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { auctionAPI } from '../../services/api'
import './EditAuctionPage.css'

const EditAuctionPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, currentUser } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    startingPrice: '',
    reservePrice: '',
    increment: '25',
    endDate: '',
    location: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadAuction()
  }, [id, isLoggedIn])

  const loadAuction = async () => {
    try {
      const response = await auctionAPI.getAuctionById(id)
      const auction = response.data.auction

      if (auction.status !== 'draft') {
        alert('Can only edit draft auctions')
        navigate('/my-auctions')
        return
      }

      if (auction.seller._id !== currentUser._id) {
        alert('Not authorized to edit this auction')
        navigate('/')
        return
      }

      const endDate = new Date(auction.endDate).toISOString().slice(0, 16)

      setFormData({
        title: auction.title || '',
        subtitle: auction.subtitle || '',
        description: auction.description || '',
        category: auction.category || 'Electronics',
        condition: auction.condition || 'Good',
        startingPrice: auction.startingPrice || '',
        reservePrice: auction.reservePrice || '',
        increment: auction.increment || '25',
        endDate,
        location: auction.location || '',
      })
    } catch (err) {
      setError('Failed to load auction')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const submitData = {
        ...formData,
        endDate: new Date(formData.endDate).toISOString(),
      }

      await auctionAPI.editDraftAuction(id, submitData)
      alert('Auction updated successfully!')
      navigate('/my-auctions')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update auction')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Loading auction...</div>

  return (
    <div className="edit-auction-page">
      <div className="page-container">
        <h1>Edit Auction</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auction-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Vintage Sony Headphones"
                required
                minLength={5}
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
              <input
                id="subtitle"
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Optional subtitle"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the item..."
                required
                minLength={10}
                rows={6}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="Gaming">Gaming</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Audio">Audio</option>
                  <option value="Watches">Watches</option>
                  <option value="Antiques">Antiques</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Art">Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} required>
                  <option value="Mint">Mint</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="For Parts">For Parts</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Duration</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startingPrice">Starting Price ($) *</label>
                <input
                  id="startingPrice"
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reservePrice">Reserve Price ($)</label>
                <input
                  id="reservePrice"
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="increment">Bid Increment ($) *</label>
                <input
                  id="increment"
                  type="number"
                  name="increment"
                  value={formData.increment}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date & Time *</label>
                <input
                  id="endDate"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/my-auctions')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAuctionPage

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { auctionAPI } from '../../services/api'
import '../auction/CreateAuctionPage.css'

export default function CreateAuctionPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [previewImages, setPreviewImages] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    startingPrice: '',
    reservePrice: '',
    increment: '25',
    location: '',
    endDate: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)

    // Limit to 10 total images
    if (uploadedImages.length + files.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setPreviewImages(prev => [...prev, {
          id: `preview-${Date.now()}-${Math.random()}`,
          src: evt.target.result,
          file: file,
          isPreview: true,
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'auctionhub') // Configure this in Cloudinary
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      return {
        url: data.secure_url,
        publicId: data.public_id,
      }
    } catch (err) {
      throw new Error('Failed to upload image to Cloudinary')
    }
  }

  const handleUploadImages = async () => {
    if (previewImages.length === 0) {
      setError('Select images to upload')
      return
    }

    setUploadingImages(true)
    setError('')

    try {
      const uploadPromises = previewImages
        .filter(img => img.isPreview)
        .map(img => uploadToCloudinary(img.file))

      const uploadedData = await Promise.all(uploadPromises)
      setUploadedImages([...uploadedImages, ...uploadedData])

      // Remove preview images after upload
      setPreviewImages(prev => prev.filter(img => !img.isPreview || uploadedData.length === 0))

      setError('')
    } catch (err) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (imageId, isPreview = false) => {
    if (isPreview) {
      setPreviewImages(prev => prev.filter(img => img.id !== imageId))
    } else {
      setUploadedImages(prev => prev.filter(img => img !== imageId))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploadedImages.length === 0) {
      setError('At least one image is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await auctionAPI.createAuction({
        ...formData,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : 0,
        increment: parseFloat(formData.increment),
        endDate: new Date(formData.endDate),
        images: uploadedImages,
      })

      if (res.data.success) {
        alert('Auction created successfully! Status: Draft. You can now edit or submit for approval.')
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-auction-page">
      <div className="create-container">
        <h1>Create New Auction</h1>
        <p className="subtitle">List your item for auction with images. Once created, you can submit for admin approval.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auction-form">
          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h3>📸 Upload Images</h3>
            <p className="image-hint">Upload up to 10 images of your item (JPG, PNG)</p>

            <div className="image-input-wrapper">
              <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadedImages.length + previewImages.filter(p => p.isPreview).length >= 10}
              />
              <label htmlFor="image-input" className="file-label">
                Choose Images
              </label>
            </div>

            {/* Preview Images */}
            {previewImages.length > 0 && (
              <div>
                <h4>Selected Images ({previewImages.length})</h4>
                <div className="image-grid">
                  {previewImages.map(img => (
                    <div key={img.id} className="image-item">
                      <img src={img.src} alt="preview" />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(img.id, true)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="upload-btn"
                  onClick={handleUploadImages}
                  disabled={uploadingImages || previewImages.length === 0}
                >
                  {uploadingImages ? 'Uploading...' : `Upload ${previewImages.length} Image(s)`}
                </button>
              </div>
            )}

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div>
                <h4>✓ Uploaded ({uploadedImages.length}/10)</h4>
                <div className="image-grid">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="image-item uploaded">
                      <img src={img.url} alt={`uploaded-${idx}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(idx)}
                      >
                        ✕
                      </button>
                      <span className="uploaded-badge">Uploaded</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="form-divider" />

          {/* Auction Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Auction Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Vintage Gaming Console"
                maxLength={150}
              />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Detailed description of the item"
              rows="5"
              minLength={10}
              maxLength={2000}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option>Electronics</option>
                <option>Gaming</option>
                <option>Furniture</option>
                <option>Audio</option>
                <option>Watches</option>
                <option>Antiques</option>
                <option>Art</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condition *</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option>Mint</option>
                <option>Excellent</option>
                <option>Very Good</option>
                <option>Good</option>
                <option>Fair</option>
                <option>For Parts</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Starting Price ($) *</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Reserve Price ($)</label>
              <input
                type="number"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Bid Increment ($)</label>
              <input
                type="number"
                name="increment"
                value={formData.increment}
                onChange={handleChange}
                placeholder="25"
                step="1"
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>
            <div className="form-group">
              <label>Auction End Date/Time *</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading || uploadingImages}>
              {loading ? 'Creating...' : 'Create Auction'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>

        <div className="info-box">
          <h3>📋 Next Steps</h3>
          <ul>
            <li>Your auction will be created as a <strong>Draft</strong></li>
            <li>You can edit, delete, or add more images while in draft</li>
            <li>Submit it for <strong>Admin Approval</strong> when ready</li>
            <li>Admin will review and schedule it to go live</li>
            <li>Auction becomes <strong>Live</strong> at the scheduled time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../components/common/Navigation'
import { getCurrentUser, updateUserProfile } from '../../api/auth'
import './ProfilePage.css'

const emptyForm = {
  name: '',
  email: '',
  bio: '',
  location: '',
  phone: '',
}

export default function ProfilePage({ onBack }) {
  const { isLoggedIn, currentUser, updateCurrentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await getCurrentUser()
        const user = response.user || null

        setForm({
          name: user?.name || '',
          email: user?.email || '',
          bio: user?.bio || '',
          location: user?.location || '',
          phone: user?.phone || '',
        })

        if (user) {
          updateCurrentUser(user)
        }

        setError('')
      } catch (requestError) {
        setError(requestError.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [isLoggedIn, updateCurrentUser])

  const initials = useMemo(() => {
    if (!form.name) return 'U'
    return form.name
      .split(' ')
      .map((token) => token.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [form.name])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    setForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
      location: currentUser?.location || '',
      phone: currentUser?.phone || '',
    })
    setIsEditing(false)
    setMessage('')
    setError('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await updateUserProfile({
        name: form.name,
        bio: form.bio,
        location: form.location,
        phone: form.phone,
      })

      const updatedUser = response.user || form
      updateCurrentUser({
        ...currentUser,
        ...updatedUser,
      })

      setForm((previousForm) => ({
        ...previousForm,
        name: updatedUser.name || previousForm.name,
        bio: updatedUser.bio || '',
        location: updatedUser.location || '',
        phone: updatedUser.phone || '',
      }))

      setIsEditing(false)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.message || 'Failed to update profile')
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-content">
            <h2>Please log in to view your profile</h2>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <button type="button" className="action-btn" onClick={onBack}>
            Back to auctions
          </button>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <h1>{form.name || 'User'}</h1>
            <p className="email">{form.email}</p>
          </div>
        </header>

        <section className="profile-content">
          {loading ? <p>Loading profile...</p> : null}
          {error ? <p className="message message--error">{error}</p> : null}
          {message ? <p className="message">{message}</p> : null}

          {!loading && !isEditing ? (
            <div className="profile-card">
              <div className="profile-field">
                <label>Name</label>
                <p>{form.name || 'Not set'}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{form.email || 'Not set'}</p>
              </div>
              <div className="profile-field">
                <label>Bio</label>
                <p>{form.bio || 'No bio added yet'}</p>
              </div>
              <div className="profile-field">
                <label>Location</label>
                <p>{form.location || 'Not specified'}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{form.phone || 'Not provided'}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-label">Total Bids</p>
                  <p className="stat-value">{currentUser?.totalBids || 0}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Auctions Won</p>
                  <p className="stat-value">{currentUser?.totalWins || 0}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Listings</p>
                  <p className="stat-value">{currentUser?.totalListings || 0}</p>
                </div>
              </div>

              <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit profile
              </button>
            </div>
          ) : null}

          {!loading && isEditing ? (
            <form className="edit-form" onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email</label>
                <input id="profile-email" name="email" value={form.email} disabled />
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell others about yourself"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-location">Location</label>
                <input
                  id="profile-location"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save changes</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </main>
  )
}

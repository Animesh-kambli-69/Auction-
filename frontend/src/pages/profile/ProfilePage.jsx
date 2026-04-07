import { useAuth } from '../../components/common/Navigation'
import '../AuctionDetailPage.css'

export default function ProfilePage() {
  const { isLoggedIn, currentUser } = useAuth()

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please log in to view your profile</h2>
      </div>
    )
  }

  return (
    <main className="profile-page">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>User Profile</h1>
        
        <div className="profile-card" style={{ 
          border: '1px solid #ddd', 
          padding: '2rem', 
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold'
            }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2>{currentUser?.name || 'User'}</h2>
              <p style={{ color: '#666' }}>{currentUser?.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3>Bio</h3>
              <p>{currentUser?.bio || 'No bio added yet'}</p>
            </div>
            <div>
              <h3>Location</h3>
              <p>{currentUser?.location || 'Not specified'}</p>
            </div>
            <div>
              <h3>Contact</h3>
              <p>{currentUser?.phone || 'Not provided'}</p>
            </div>
            <div>
              <h3>Member Since</h3>
              <p>Member</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
            <h3>Account Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>Total Bids</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>Auctions Won</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>Listings</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

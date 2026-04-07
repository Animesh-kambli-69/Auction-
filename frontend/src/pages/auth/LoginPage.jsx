import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { authAPI } from '../../services/api'
import '../auth/LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await authAPI.login(formData.email, formData.password)

      if (res.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', res.data.token)

        // Update auth context
        login(res.data.user)

        // Redirect to home
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      if (res.data.success) {
        // Store token
        localStorage.setItem('token', res.data.token)

        // Update context
        login(res.data.user)

        // Redirect
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1>AuctionHub</h1>
          <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="login-form">
            {isSignup && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="toggle-auth">
            <p>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    confirmPassword: '',
                  })
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-sidebar">
          <div className="feature">
            <h3>🔒 Secure</h3>
            <p>Your account is protected with industry-standard encryption</p>
          </div>
          <div className="feature">
            <h3>⚡ Fast</h3>
            <p>Quick signup and instant access to auctions</p>
          </div>
          <div className="feature">
            <h3>🎯 Easy</h3>
            <p>Simple process to start bidding on amazing items</p>
          </div>
        </div>
      </div>
    </div>
  )
}

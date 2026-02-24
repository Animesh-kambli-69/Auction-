import { useState, useRef, useEffect, createContext, useContext } from 'react';
import Login from './Login';
import { filterCategories } from '../../data/filters';
import './nav.css';

// Create Auth Context
export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const login = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setShowLoginModal(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => setShowLoginModal(false);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      currentUser, 
      login, 
      logout, 
      showLoginModal, 
      openLogin, 
      closeLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const Nav = () => {
  const { isLoggedIn, currentUser, login, logout, showLoginModal, openLogin, closeLogin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const filterRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (userData) => {
    login(userData);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery, 'in category:', selectedFilter);
    // Add your search logic here
  };

  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
    console.log('Filter selected:', filterId);
  };

  const currentFilter = filterCategories.find(f => f.id === selectedFilter) || filterCategories[0];

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo/Brand */}
          <div className="nav-brand">
            <h2>AuctionHub</h2>
          </div>

          {/* Search Bar */}
          <form className="nav-search" onSubmit={handleSearch}>
            <div className="search-wrapper">
              {/* Filter Button */}
              <div className="filter-container" ref={filterRef}>
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  title="Filter categories"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span className="filter-icon-text">{currentFilter.icon}</span>
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div className="filter-dropdown-header">
                      <h4>Filter by Category</h4>
                    </div>
                    <div className="filter-options">
                      {filterCategories.map((filter) => (
                        <button
                          key={filter.id}
                          className={`filter-option ${selectedFilter === filter.id ? 'active' : ''}`}
                          onClick={() => handleFilterSelect(filter.id)}
                          type="button"
                        >
                          <span className="filter-option-icon">{filter.icon}</span>
                          <span className="filter-option-name">{filter.name}</span>
                          {selectedFilter === filter.id && (
                            <svg className="filter-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Icon */}
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>

              {/* Search Input */}
              <input
                type="text"
                placeholder={`Search in ${currentFilter.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          {/* Login Button / User Menu */}
          <div className="nav-actions">
            {isLoggedIn ? (
              <div className="user-menu" ref={userMenuRef}>
                <button 
                  className="user-btn" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{currentUser?.name || 'User'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="user-info">
                        <p className="user-dropdown-name">{currentUser?.name}</p>
                        <p className="user-dropdown-email">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="user-dropdown-menu">
                      <button className="menu-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        My Profile
                      </button>
                      <button className="menu-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        My Bids
                      </button>
                      <button className="menu-item" onClick={handleLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={openLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && <Login onClose={closeLogin} onLogin={handleLogin} />}
    </>
  );
};

export default Nav;
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchAuctions } from '../api';
import './Search.css';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Parse initial state from URL params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'ending-soon');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Gaming', 'Furniture', 'Audio', 'Watches', 'Antiques', 'Electronics', 'Art', 'Other'];
  const conditions = ['Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'For Parts'];

  const doSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (sort) params.sort = sort;

      // Update URL without reloading page
      setSearchParams({ q: query, ...params }, { replace: true });

      const data = await fetchAuctions(params);
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, condition, sort]); // Auto-search when dropdowns change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setCondition('');
    setPriceMin('');
    setPriceMax('');
    setSort('ending-soon');
    setSearchParams({});
    doSearch();
  };

  return (
    <div className="advanced-search-page">
      <div className="search-header-container">
        <h2>Advanced Search</h2>
        <p>Find exactly what you're looking for with precision filters.</p>
      </div>

      <div className="search-layout">
        <aside className="search-sidebar">
          <form onSubmit={handleSearchSubmit} className="filter-form">
            <div className="filter-group">
              <label>Search Keyword</label>
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="E.g. Rolex, Vintage..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="filter-select">
                <option value="">Any Condition</option>
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range ($)</label>
              <div className="price-inputs">
                <input 
                  type="number" 
                  value={priceMin} 
                  onChange={e => setPriceMin(e.target.value)} 
                  placeholder="Min" 
                  min="0"
                  className="filter-input half"
                />
                <span className="price-separator">-</span>
                <input 
                  type="number" 
                  value={priceMax} 
                  onChange={e => setPriceMax(e.target.value)} 
                  placeholder="Max" 
                  min="0"
                  className="filter-input half"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="filter-select">
                <option value="ending-soon">Ending Soonest</option>
                <option value="newest">Newly Listed</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="most-bids">Most Bids</option>
              </select>
            </div>

            <div className="filter-actions">
              <button type="submit" className="apply-btn">Apply Filters</button>
              <button type="button" onClick={clearFilters} className="clear-btn">Clear All</button>
            </div>
          </form>
        </aside>

        <main className="search-results-area">
          <div className="results-header">
            <h3>{results.length} Results Found</h3>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching auctions...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No items found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="clear-btn-large">Clear Filters</button>
            </div>
          ) : (
            <div className="search-results-grid">
              {results.map(auction => (
                <div key={auction._id} className="search-card" onClick={() => navigate(`/auction/${auction._id}`)}>
                  <div className="search-card-image" style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400'})` }}>
                    <div className="condition-badge">{auction.condition}</div>
                  </div>
                  <div className="search-card-content">
                    <span className="category-text">{auction.category}</span>
                    <h4>{auction.title}</h4>
                    <div className="card-footer">
                      <div className="price-block">
                        <span className="price-label">Current Bid</span>
                        <span className="price-value">${(auction.currentBid || auction.startingPrice).toLocaleString()}</span>
                      </div>
                      <div className="bids-block">
                        <span>{auction.bidCount} Bids</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

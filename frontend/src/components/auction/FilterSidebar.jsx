// frontend/src/components/auction/FilterSidebar.jsx

import React, { useState } from 'react'
import './FilterSidebar.css'

const FilterSidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    condition: 'all',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest',
  })

  const categories = ['Gaming', 'Furniture', 'Audio', 'Watches', 'Antiques', 'Electronics', 'Art', 'Other']
  const conditions = ['Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'For Parts']
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'most-bids', label: 'Most Bids' },
  ]

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const resetFilters = () => {
    const defaultFilters = {
      category: 'all',
      condition: 'all',
      priceMin: '',
      priceMax: '',
      sortBy: 'newest',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>

      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Condition</label>
        <select
          value={filters.condition}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Conditions</option>
          {conditions.map((cond) => (
            <option key={cond} value={cond}>{cond}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            className="price-input"
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default FilterSidebar

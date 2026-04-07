// frontend/src/pages/auction/SearchPage.jsx

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AuctionCard from '../../components/auction/AuctionCard'
import FilterSidebar from '../../components/auction/FilterSidebar'
import { auctionAPI } from '../../services/api'
import './SearchPage.css'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: 'all',
    condition: 'all',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest',
  })

  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    loadAuctions()
  }, [searchQuery, filters])

  const loadAuctions = async () => {
    if (!searchQuery.trim()) {
      setAuctions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = {
        search: searchQuery,
        status: 'active',
      }

      if (filters.category !== 'all') params.category = filters.category
      if (filters.condition !== 'all') params.condition = filters.condition
      if (filters.priceMin) params.priceMin = filters.priceMin
      if (filters.priceMax) params.priceMax = filters.priceMax
      if (filters.sortBy) params.sort = filters.sortBy

      const response = await auctionAPI.getAllAuctions(params)
      let results = response.data.auctions || []

      // Apply price filter client-side if needed
      if (filters.priceMin || filters.priceMax) {
        results = results.filter(a => {
          const price = a.currentBid
          if (filters.priceMin && price < parseFloat(filters.priceMin)) return false
          if (filters.priceMax && price > parseFloat(filters.priceMax)) return false
          return true
        })
      }

      // Apply sorting
      if (filters.sortBy === 'price-asc') {
        results.sort((a, b) => a.currentBid - b.currentBid)
      } else if (filters.sortBy === 'price-desc') {
        results.sort((a, b) => b.currentBid - a.currentBid)
      } else if (filters.sortBy === 'ending-soon') {
        results.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      } else if (filters.sortBy === 'most-bids') {
        results.sort((a, b) => b.bidCount - a.bidCount)
      }

      setAuctions(results)
    } catch (err) {
      setError('Failed to search auctions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        {searchQuery && <p className="search-query">Results for "<strong>{searchQuery}</strong>"</p>}
      </div>

      <div className="search-container">
        <aside className="sidebar">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </aside>

        <main className="content">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Searching auctions...</div>
          ) : !searchQuery.trim() ? (
            <div className="empty-state">
              <p>Enter a search term to find auctions</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="empty-state">
              <p>No auctions found matching your search</p>
              <p className="hint">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <p className="result-count">Found <strong>{auctions.length}</strong> auction{auctions.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="auctions-grid">
                {auctions.map(auction => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default SearchPage

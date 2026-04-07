import { createContext, useContext, useState } from 'react'

/**
 * AuctionContext - Manages auction browsing and filtering state
 * Stores: auctions list, filters, search query, pagination
 */
export const AuctionContext = createContext()

/**
 * Custom hook to use AuctionContext
 */
export const useAuctions = () => {
  const context = useContext(AuctionContext)
  if (!context) {
    throw new Error('useAuctions must be used within AuctionProvider')
  }
  return context
}

/**
 * AuctionProvider Component
 * Wraps the app to provide auction state to auction-related components
 */
export const AuctionProvider = ({ children, initialAuctions = [] }) => {
  const [auctions, setAuctions] = useState(initialAuctions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('ending-soon') // ending-soon, lowest-bid, highest-bid
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Filter and search auctions
  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || auction.category === selectedCategory
    const matchesPrice = auction.currentBid >= priceRange.min && auction.currentBid <= priceRange.max
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Sort auctions
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'lowest-bid':
        return a.currentBid - b.currentBid
      case 'highest-bid':
        return b.currentBid - a.currentBid
      case 'ending-soon':
      default:
        return a.endAt - b.endAt
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedAuctions.length / itemsPerPage)
  const paginatedAuctions = sortedAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const updateAuction = (auctionId, updates) => {
    setAuctions(auctions.map((auction) => (auction.id === auctionId ? { ...auction, ...updates } : auction)))
  }

  const addAuction = (newAuction) => {
    setAuctions([...auctions, { ...newAuction, id: Date.now() }])
  }

  const removeAuction = (auctionId) => {
    setAuctions(auctions.filter((auction) => auction.id !== auctionId))
  }

  const value = {
    // State
    auctions: paginatedAuctions,
    allAuctions: auctions,
    searchQuery,
    selectedCategory,
    sortBy,
    priceRange,
    currentPage,
    totalPages,
    
    // Setters
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setPriceRange,
    setCurrentPage,
    
    // Actions
    updateAuction,
    addAuction,
    removeAuction,
  }

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
}

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../components/common/Navigation'
import Header from '../../components/common/Header'
import Hero from '../../components/common/Hero'
import AuctionList from '../../components/auction/AuctionList'
import AuctionDetail from '../../components/auction/AuctionDetail'
import Sidebar from '../../components/common/Sidebar'
import { initialAuctions } from '../../data/auctions'
import { initialActivity } from '../../data/activity'
import { currency } from '../../utils/format'
import '../AuctionDetailPage.css'

export default function HomePage() {
  const { isLoggedIn, currentUser, openLogin } = useAuth()
  const [now, setNow] = useState(Date.now())
  const [auctions, setAuctions] = useState(initialAuctions)
  const [selectedId, setSelectedId] = useState(initialAuctions[0].id)
  const [bidInput, setBidInput] = useState('')
  const [bidError, setBidError] = useState('')
  const [activity, setActivity] = useState(initialActivity)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const selectedAuction = auctions.find((auction) => auction.id === selectedId)

  const stats = useMemo(() => {
    const active = auctions.filter((auction) => auction.endAt > now)
    const totalValue = auctions.reduce((sum, auction) => sum + auction.currentBid, 0)
    const endingSoon = auctions.filter((auction) => auction.endAt - now < 60 * 60 * 1000 && auction.endAt > now)
    return {
      activeCount: active.length,
      totalValue,
      endingSoon: endingSoon.length,
    }
  }, [auctions, now])

  const handleBidInputChange = (event) => setBidInput(event.target.value)

  const handleBidSubmit = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      openLogin()
      return
    }

    const bidAmount = parseFloat(bidInput)

    // Validation
    if (!bidAmount || bidAmount <= selectedAuction.currentBid) {
      setBidError(`Bid must be more than ${currency.format(selectedAuction.currentBid)}`)
      return
    }

    // Update auction and add activity
    setAuctions(
      auctions.map((auction) => {
        if (auction.id === selectedId) {
          return { ...auction, currentBid: bidAmount, bidCount: (auction.bidCount || 0) + 1 }
        }
        return auction
      }),
    )
    setActivity([
      {
        id: activity.length + 1,
        name: currentUser?.name || 'Anonymous',
        action: `placed a bid on ${selectedAuction.title}`,
        amount: bidAmount,
        time: 'Just now',
      },
      ...activity,
    ])

    setBidInput('')
    setBidError('')
  }

  return (
    <main className="app">
      <Header stats={stats} totalBids={auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0)} />
      <Hero stats={stats} now={now} />

      <div className="room">
        <AuctionList
          auctions={auctions}
          now={now}
          selectedId={selectedId}
          onSelectAuction={setSelectedId}
          onViewDetail={() => {}}
        />

        <div className="detail-container">
          {selectedAuction && (
            <AuctionDetail
              auction={selectedAuction}
              now={now}
              bidInput={bidInput}
              bidError={bidError}
              onBidInputChange={handleBidInputChange}
              onBidSubmit={handleBidSubmit}
            />
          )}
        </div>

        <Sidebar auctions={auctions} stats={stats} activity={activity} />
      </div>
    </main>
  )
}

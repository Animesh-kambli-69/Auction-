import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import AuctionList from './components/AuctionList'
import AuctionDetail from './components/AuctionDetail'
import Sidebar from './components/Sidebar'
import { initialAuctions } from './data/auctions'
import { initialActivity } from './data/activity'
import { currency } from './utils/format'
import './App.css'

function App() {
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

  const handleBid = (event) => {
    event.preventDefault()
    if (!selectedAuction) return

    const nextBid = Number(bidInput)
    if (!nextBid) {
      setBidError('Enter a bid amount.')
      return
    }

    if (selectedAuction.endAt <= now) {
      setBidError('This auction has ended.')
      return
    }

    const minimumBid = selectedAuction.currentBid + selectedAuction.increment
    if (nextBid < minimumBid) {
      setBidError(`Minimum bid is ${currency.format(minimumBid)}.`)
      return
    }

    setBidError('')
    setBidInput('')

    setAuctions((prev) =>
      prev.map((auction) =>
        auction.id === selectedAuction.id
          ? {
              ...auction,
              currentBid: nextBid,
              bids: auction.bids + 1,
              bidders: auction.bidders + 1,
            }
          : auction,
      ),
    )

    setActivity((prev) => [
      {
        id: `activity-${now}`,
        name: 'You',
        action: `placed a bid on ${selectedAuction.title}`,
        amount: nextBid,
        time: 'just now',
      },
      ...prev,
    ])
  }

  const totalBids = auctions.reduce((sum, auction) => sum + auction.bids, 0)

  return (
    <div className="app">
      <Header stats={stats} totalBids={totalBids} />

      <Hero stats={stats} now={now} />

      <main className="layout">
        <AuctionList
          auctions={auctions}
          now={now}
          selectedId={selectedId}
          onSelectAuction={setSelectedId}
        />

        {selectedAuction && (
          <AuctionDetail
            auction={selectedAuction}
            now={now}
            bidInput={bidInput}
            bidError={bidError}
            onBidInputChange={(e) => setBidInput(e.target.value)}
            onBidSubmit={handleBid}
          />
        )}

        <Sidebar auctions={auctions} stats={stats} activity={activity} />
      </main>
    </div>
  )
}

export default App

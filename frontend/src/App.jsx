import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './components/common/Navigation'
import Header from './components/common/Header'
import Hero from './components/common/Hero'
import AuctionList from './components/auction/AuctionList'
import AuctionDetail from './components/auction/AuctionDetail'
import AuctionDetailPage from './pages/auction/AuctionDetailPage'
import ProfilePage from './pages/profile/ProfilePage'
import ListingRequestPage from './pages/auction/ListingRequestPage'
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard'
import Sidebar from './components/common/Sidebar'
import NotificationCenter from './components/common/NotificationCenter'
import { initialAuctions } from './data/auctions'
import { initialActivity } from './data/activity'
import { currency } from './utils/format'
import { getAllAuctions } from './api/auctions'
import BidService from './services/bidService'
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates'
import './App.css'

const categoryAccentMap = {
  gaming: 'sunset',
  furniture: 'linen',
  audio: 'sea',
  watches: 'ember',
  antiques: 'forest',
  electronics: 'sea',
  art: 'ember',
  other: 'sunset',
}

const normalizeAuction = (auction) => {
  const resolvedEndAt = new Date(auction.endDate || Date.now() + 60 * 60 * 1000).getTime()
  const reserve = auction.reservePrice ?? auction.startingPrice ?? 0
  const biddersCount = typeof auction.bidderCount === 'number'
    ? auction.bidderCount
    : (Array.isArray(auction.bidders) ? auction.bidders.length : 0)

  return {
    id: auction._id,
    title: auction.title,
    subtitle: auction.subtitle || auction.description?.slice(0, 80) || 'Live auction lot',
    currentBid: auction.currentBid ?? auction.startingPrice ?? 0,
    bids: auction.bidCount ?? 0,
    endAt: Number.isFinite(resolvedEndAt) ? resolvedEndAt : Date.now() + 60 * 60 * 1000,
    category: auction.category || 'Other',
    condition: auction.condition || 'Good',
    reserve,
    increment: auction.increment || 25,
    bidders: biddersCount,
    location: auction.location || 'Virtual',
    accent: auction.accent || categoryAccentMap[(auction.category || '').toLowerCase()] || 'sunset',
    currentBidderId: auction.currentBidder?._id || auction.currentBidder || null,
  }
}

const buildActivityItem = (name, action, amount) => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name,
  action,
  amount,
  time: 'just now',
})

function App() {
  const { isLoggedIn, currentUser, activePage, setActivePage, openLogin } = useAuth()
  const [now, setNow] = useState(() => Date.now())
  const [auctions, setAuctions] = useState(initialAuctions)
  const [selectedId, setSelectedId] = useState(initialAuctions[0].id)
  const [bidInput, setBidInput] = useState('')
  const [bidError, setBidError] = useState('')
  const [activity, setActivity] = useState(initialActivity)
  const [notifications, setNotifications] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'detail'

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const loadAuctions = useCallback(async () => {
    try {
      const response = await getAllAuctions({ status: 'active', limit: 50 })
      const normalizedAuctions = (response.auctions || []).map(normalizeAuction)

      if (normalizedAuctions.length > 0) {
        setAuctions(normalizedAuctions)
        setSelectedId((previousSelectedId) => {
          const hasSelected = normalizedAuctions.some((auction) => auction.id === previousSelectedId)
          return hasSelected ? previousSelectedId : normalizedAuctions[0].id
        })
      }
    } catch (error) {
      console.error('Failed to load auctions from API:', error)
    }
  }, [])

  useEffect(() => {
    loadAuctions()
  }, [loadAuctions])

  const selectedAuction = auctions.find((auction) => auction.id === selectedId) || auctions[0]

  const handleRealtimeBid = useCallback((eventData) => {
    if (!eventData?.auctionId) return

    const auctionId = eventData.auctionId.toString()

    setAuctions((previousAuctions) =>
      previousAuctions.map((auction) =>
        auction.id === auctionId
          ? {
              ...auction,
              currentBid: eventData.currentBid ?? eventData.bidAmount ?? auction.currentBid,
              bids: typeof eventData.bidCount === 'number' ? eventData.bidCount : auction.bids,
              bidders: typeof eventData.bidderCount === 'number' ? eventData.bidderCount : auction.bidders,
              currentBidderId: eventData.bidder?._id || auction.currentBidderId,
            }
          : auction,
      ),
    )

    if (eventData.bidder?.name && eventData.auctionTitle) {
      setActivity((previousActivity) => [
        buildActivityItem(
          eventData.bidder.name,
          `placed a bid on ${eventData.auctionTitle}`,
          eventData.bidAmount,
        ),
        ...previousActivity,
      ].slice(0, 20))
    }
  }, [])

  const handleOutbidNotification = useCallback((eventData) => {
    if (!eventData?.auctionId) return

    const notificationId = `outbid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const currentBid = Number(eventData.currentBid || 0)

    setNotifications((previousNotifications) => [
      {
        id: notificationId,
        title: 'You were outbid',
        message: `${eventData.auctionTitle} now has a top bid of ${currency.format(currentBid)}.`,
        auctionId: eventData.auctionId.toString(),
      },
      ...previousNotifications,
    ].slice(0, 4))

    setTimeout(() => {
      setNotifications((previousNotifications) =>
        previousNotifications.filter((item) => item.id !== notificationId),
      )
    }, 7000)
  }, [])

  useRealtimeUpdates({
    onBid: handleRealtimeBid,
    onOutbid: handleOutbidNotification,
    auctionId: selectedAuction?.id || null,
  })

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

  const handleBid = async (event) => {
    event.preventDefault()
    if (!selectedAuction) return

    if (!isLoggedIn) {
      openLogin()
      return
    }

    const nextBid = Number(bidInput)
    if (!nextBid) {
      setBidError('Enter a valid bid amount.')
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

    try {
      const result = await BidService.placeBid(selectedAuction.id, nextBid)

      setBidError('')
      setBidInput('')

      setAuctions((previousAuctions) =>
        previousAuctions.map((auction) =>
          auction.id === selectedAuction.id
            ? {
                ...auction,
                currentBid: result.auction?.currentBid ?? nextBid,
                bids: result.auction?.bidCount ?? auction.bids + 1,
                bidders: result.auction?.bidderCount ?? auction.bidders,
                currentBidderId: currentUser?._id || auction.currentBidderId,
              }
            : auction,
        ),
      )

      setActivity((previousActivity) => [
        buildActivityItem(
          currentUser?.name || 'You',
          `placed a bid on ${selectedAuction.title}`,
          nextBid,
        ),
        ...previousActivity,
      ].slice(0, 20))
    } catch (error) {
      const message = (error.message || 'Failed to place bid').replace('Failed to place bid: ', '')
      setBidError(message)
    }
  }

  const handleViewDetail = (auctionId) => {
    setSelectedId(auctionId)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
  }

  const handleBidFromDetailPage = () => {
    if (!isLoggedIn) {
      openLogin()
    } else {
      setViewMode('list')
    }
  }

  const dismissNotification = useCallback((notificationId) => {
    setNotifications((previousNotifications) =>
      previousNotifications.filter((item) => item.id !== notificationId),
    )
  }, [])

  const openAuctionFromNotification = useCallback((auctionId) => {
    setSelectedId(auctionId)
    setActivePage('home')
    setViewMode('list')
  }, [setActivePage])

  const totalBids = auctions.reduce((sum, auction) => sum + auction.bids, 0)

  return (
    <div className="app">
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
        onOpenAuction={openAuctionFromNotification}
      />

      {activePage === 'profile' ? (
        <ProfilePage onBack={() => setActivePage('home')} />
      ) : activePage === 'listing-request' ? (
        <ListingRequestPage onBack={() => setActivePage('home')} onRequireLogin={openLogin} />
      ) : activePage === 'superadmin-dashboard' ? (
        <SuperAdminDashboard onBack={() => setActivePage('home')} onRequireLogin={openLogin} />
      ) : viewMode === 'list' ? (
        <>
          <Header stats={stats} totalBids={totalBids} />
          <Hero stats={stats} now={now} />

          <main className="layout">
            <AuctionList
              auctions={auctions}
              now={now}
              selectedId={selectedId}
              onSelectAuction={setSelectedId}
              onViewDetail={handleViewDetail}
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
        </>
      ) : (
        <AuctionDetailPage
          auction={selectedAuction}
          now={now}
          onBack={handleBackToList}
          onBid={handleBidFromDetailPage}
          isLoggedIn={isLoggedIn}
          onLoginRequired={openLogin}
        />
      )}
    </div>
  )
}

export default App
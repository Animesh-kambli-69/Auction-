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
  const currentBid = auction.currentBid ?? auction.startingPrice ?? 0
  const increment = auction.increment || 25
  const biddersCount = typeof auction.bidderCount === 'number'
    ? auction.bidderCount
    : (Array.isArray(auction.bidders) ? auction.bidders.length : 0)

  return {
    id: auction._id,
    title: auction.title,
    subtitle: auction.subtitle || auction.description?.slice(0, 80) || 'Live auction lot',
    currentBid,
    bids: auction.bidCount ?? 0,
    endAt: Number.isFinite(resolvedEndAt) ? resolvedEndAt : Date.now() + 60 * 60 * 1000,
    category: auction.category || 'Other',
    condition: auction.condition || 'Good',
    reserve,
    increment,
    bidders: biddersCount,
    location: auction.location || 'Virtual',
    accent: auction.accent || categoryAccentMap[(auction.category || '').toLowerCase()] || 'sunset',
    currentBidderId: auction.currentBidder?._id || auction.currentBidder || null,
    minimumNextBid: auction.minimumNextBid ?? (currentBid + increment),
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
  const [bidNotice, setBidNotice] = useState('')
  const [activity, setActivity] = useState(initialActivity)
  const [notifications, setNotifications] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'detail'

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const loadAuctions = useCallback(async () => {
    try {
      const limit = 100
      let offset = 0
      let total = Infinity
      const allAuctions = []

      while (allAuctions.length < total) {
        const response = await getAllAuctions({ status: 'active', limit, offset })
        const batch = response.auctions || []

        allAuctions.push(...batch)
        total = response.pagination?.total ?? batch.length

        if (batch.length === 0) {
          break
        }

        offset += limit
      }

      const normalizedAuctions = allAuctions.map(normalizeAuction)

      if (normalizedAuctions.length > 0) {
        setAuctions(normalizedAuctions)
        setSelectedId((previousSelectedId) => {
          const hasSelected = normalizedAuctions.some((auction) => auction.id === previousSelectedId)
          return hasSelected ? previousSelectedId : normalizedAuctions[0].id
        })
      } else {
        setAuctions([])
      }
    } catch (error) {
      console.error('Failed to load auctions from API:', error)
      setAuctions([])
    }
  }, [])

  useEffect(() => {
    loadAuctions()
  }, [loadAuctions])

  useEffect(() => {
    setBidError('')
    setBidNotice('')
    setBidInput('')
  }, [selectedId])

  const selectedAuction = auctions.find((auction) => auction.id === selectedId) || auctions[0]

  const handleRealtimeBid = useCallback((eventData) => {
    if (!eventData?.auctionId) return

    const auctionId = eventData.auctionId.toString()

    setAuctions((previousAuctions) =>
      previousAuctions.map((auction) =>
        auction.id === auctionId
          ? (() => {
              const nextBid = eventData.currentBid ?? eventData.bidAmount ?? auction.currentBid
              const nextEndAt = eventData.endDate
                ? new Date(eventData.endDate).getTime()
                : auction.endAt

              return {
                ...auction,
                currentBid: nextBid,
                bids: typeof eventData.bidCount === 'number' ? eventData.bidCount : auction.bids,
                bidders: typeof eventData.bidderCount === 'number' ? eventData.bidderCount : auction.bidders,
                currentBidderId: eventData.bidder?._id || auction.currentBidderId,
                minimumNextBid: eventData.minimumNextBid ?? (nextBid + auction.increment),
                endAt: Number.isFinite(nextEndAt) ? nextEndAt : auction.endAt,
              }
            })()
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

    if (eventData.wasExtended && eventData.extendedUntil) {
      const notificationId = `extended-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const extendedLabel = new Date(eventData.extendedUntil).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      setNotifications((previousNotifications) => [
        {
          id: notificationId,
          title: 'Auction extended',
          message: `${eventData.auctionTitle || 'An auction'} was extended to ${extendedLabel} after a late bid.`,
          auctionId,
        },
        ...previousNotifications,
      ].slice(0, 4))

      setTimeout(() => {
        setNotifications((previousNotifications) =>
          previousNotifications.filter((item) => item.id !== notificationId),
        )
      }, 7000)
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

  const handleListingStatusNotification = useCallback((eventData) => {
    if (!eventData?.auctionId || !eventData?.status) return

    const notificationId = `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const isRejected = eventData.status === 'rejected'
    const title = isRejected ? 'Listing rejected' : 'Listing approved'
    const message = isRejected
      ? `${eventData.auctionTitle} was rejected.${eventData.reason ? ` Reason: ${eventData.reason}` : ''}`
      : `${eventData.auctionTitle} is approved and now live.`

    setNotifications((previousNotifications) => [
      {
        id: notificationId,
        title,
        message,
        page: 'listing-request',
        actionLabel: 'View requests',
      },
      ...previousNotifications,
    ].slice(0, 4))

    setTimeout(() => {
      setNotifications((previousNotifications) =>
        previousNotifications.filter((item) => item.id !== notificationId),
      )
    }, 9000)
  }, [])

  useRealtimeUpdates({
    onBid: handleRealtimeBid,
    onOutbid: handleOutbidNotification,
    onListingStatus: handleListingStatusNotification,
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

    setBidNotice('')

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

    const minimumBid = selectedAuction.minimumNextBid
      ?? (selectedAuction.currentBid + selectedAuction.increment)
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
            ? (() => {
                const updatedCurrentBid = result.auction?.currentBid ?? nextBid
                const updatedEndAt = result.auction?.endDate
                  ? new Date(result.auction.endDate).getTime()
                  : auction.endAt

                return {
                  ...auction,
                  currentBid: updatedCurrentBid,
                  bids: result.auction?.bidCount ?? auction.bids + 1,
                  bidders: result.auction?.bidderCount ?? auction.bidders,
                  currentBidderId: currentUser?._id || auction.currentBidderId,
                  minimumNextBid: result.auction?.minimumNextBid
                    ?? (updatedCurrentBid + auction.increment),
                  endAt: Number.isFinite(updatedEndAt) ? updatedEndAt : auction.endAt,
                }
              })()
            : auction,
        ),
      )

      if (result.auction?.wasExtended && result.auction?.extendedUntil) {
        const extendedLabel = new Date(result.auction.extendedUntil).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
        setBidNotice(`Late bid accepted. Auction extended to ${extendedLabel}.`)
      } else {
        setBidNotice('Bid placed successfully.')
      }

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
      setBidNotice('')
    }
  }

  const handleQuickBid = useCallback((amount) => {
    setBidInput(String(amount))
    setBidError('')
    setBidNotice('')
  }, [])

  const handleViewDetail = (auctionId) => {
    setSelectedId(auctionId)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
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

  const openPageFromNotification = useCallback((pageName) => {
    if (!pageName) return
    setActivePage(pageName)
    setViewMode('list')
  }, [setActivePage])

  const totalBids = auctions.reduce((sum, auction) => sum + auction.bids, 0)

  return (
    <div className="app">
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
        onOpenAuction={openAuctionFromNotification}
        onOpenPage={openPageFromNotification}
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
                bidNotice={bidNotice}
                onBidInputChange={(e) => setBidInput(e.target.value)}
                onBidSubmit={handleBid}
                onQuickBid={handleQuickBid}
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
          isLoggedIn={isLoggedIn}
          onLoginRequired={openLogin}
          bidInput={bidInput}
          bidError={bidError}
          bidNotice={bidNotice}
          onBidInputChange={(e) => setBidInput(e.target.value)}
          onBidSubmit={handleBid}
          onQuickBid={handleQuickBid}
        />
      )}
    </div>
  )
}

export default App
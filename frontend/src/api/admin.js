import { apiCall } from './index'

export const getPendingAuctionRequests = async (options = {}) => {
  const queryParams = new URLSearchParams(options).toString()
  const endpoint = `/api/admin/auctions/pending${queryParams ? `?${queryParams}` : ''}`
  return apiCall(endpoint, { method: 'GET' })
}

export const approveAuctionRequest = async (auctionId, notes = '') => {
  return apiCall(`/api/admin/auctions/${auctionId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

export const rejectAuctionRequest = async (auctionId, reason) => {
  return apiCall(`/api/admin/auctions/${auctionId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export const getSuperAdminStats = async () => {
  return apiCall('/api/admin/stats', { method: 'GET' })
}

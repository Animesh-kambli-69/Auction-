// src/hooks/useFetchAuctions.js - Fetch Auctions Hook

import { useState, useEffect } from 'react';
import { getAllAuctions } from '../api/auctions';

export const useFetchAuctions = (filters = {}) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllAuctions(filters);
        setAuctions(data.auctions || []);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch auctions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [JSON.stringify(filters)]);

  return { auctions, loading, error, setAuctions };
};

export default useFetchAuctions;

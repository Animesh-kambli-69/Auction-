import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import AuctionDetail from './pages/AuctionDetail';
import CreateListing from './pages/CreateListing';
import Register from './pages/Register';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DisputeDetail from './pages/DisputeDetail';
import { AuthProvider } from './contexts/AuthContext';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/dispute/:id" element={<DisputeDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

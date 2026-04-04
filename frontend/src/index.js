import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard/Dashboard';
import SubscriptionList from './components/Subscriptions/SubscriptionList';
import SubscriptionForm from './components/Subscriptions/SubscriptionForm';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="subscriptions" element={<SubscriptionList />} />
          <Route path="subscriptions/new" element={<SubscriptionForm />} />
          <Route path="subscriptions/:id/edit" element={<SubscriptionForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

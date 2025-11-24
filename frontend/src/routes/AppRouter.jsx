// src/routes/AppRouter.jsx
/*
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { AuthContext } from "../contexts/AuthContext";

// Component bảo vệ route (chỉ cho vào nếu đã login)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <p className="text-center mt-10">Đang kiểm tra đăng nhập...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/login" element={<Login />} />

        {}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
*/
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';

// Auth pages
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import RegisterTest from '../features/auth/pages/RegisterTest';
import Dashboard from '../features/auth/pages/Dashboard';

// UPDATED: Added Register and RegisterTest routes

// Household pages
import HouseholdList from '../features/household/pages/List';
import HouseholdDetail from '../features/household/pages/Detail';

// Citizen pages
import CitizenList from '../features/citizen/pages/List';
import CitizenDetail from '../features/citizen/pages/Detail';

// Population pages
import PopulationList from '../features/population/pages/List';
import PopulationDetail from '../features/population/pages/Detail';

// Fee Period pages
import FeePeriodList from '../features/fee-period/pages/List';
import FeePeriodDetail from '../features/fee-period/pages/Detail';

// Fee Collection pages
import FeeCollectionList from '../features/fee-collection/pages/List';
import FeeCollectionDetail from '../features/fee-collection/pages/Detail';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-test" element={<RegisterTest />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Household routes */}
            <Route path="/household">
              <Route index element={<HouseholdList />} />
              <Route path=":id" element={<HouseholdDetail />} />
              <Route path="new" element={<HouseholdDetail />} />
            </Route>

            {/* Citizen routes */}
            <Route path="/citizen">
              <Route index element={<CitizenList />} />
              <Route path=":id" element={<CitizenDetail />} />
              <Route path="new" element={<CitizenDetail />} />
            </Route>

            {/* Population routes */}
            <Route path="/population">
              <Route index element={<PopulationList />} />
              <Route path=":id" element={<PopulationDetail />} />
              <Route path="new" element={<PopulationDetail />} />
            </Route>

            {/* Fee Period routes */}
            <Route path="/fee-period">
              <Route index element={<FeePeriodList />} />
              {/* CRITICAL: 'new' must come BEFORE ':id' */}
              <Route path="new" element={<FeePeriodDetail />} />
              <Route path=":id" element={<FeePeriodDetail />} />
            </Route>

            {/* Fee Collection routes */}
            <Route path="/fee-collection">
              <Route index element={<FeeCollectionList />} />
              <Route path=":id" element={<FeeCollectionDetail />} />
              <Route path="new" element={<FeeCollectionDetail />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
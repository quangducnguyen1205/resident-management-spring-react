import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./features/auth/contexts/AuthContext";
import { useContext } from "react";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// Auth pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import RegisterTest from "./features/auth/pages/RegisterTest";
import Dashboard from "./features/auth/pages/Dashboard";

// Household pages
import HouseholdList from "./features/household/pages/List";
import HouseholdDetail from "./features/household/pages/Detail";

// Citizen pages
import CitizenList from "./features/citizen/pages/List";
import CitizenDetail from "./features/citizen/pages/Detail";

// Population pages
import PopulationList from "./features/population/pages/List";
import PopulationDetail from "./features/population/pages/Detail";

// Fee Period pages
import FeePeriodList from "./features/fee-period/pages/List";
import FeePeriodDetail from "./features/fee-period/pages/Detail";

// Fee Collection pages
import FeeCollectionList from "./features/fee-collection/pages/List";
import FeeCollectionDetail from "./features/fee-collection/pages/Detail";

// Statistics pages
import StatisticsOverview from "./features/statistics/pages/Overview";

// Account pages
import AccountList from "./features/accounts/pages/List";
import CreateAccount from "./features/accounts/pages/Create";

export default function App() {
  return (
    <Router>
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

            {/* Household routes - Flat structure */}
            <Route path="/household" element={<HouseholdList />} />
            <Route path="/household/new" element={<HouseholdDetail />} />
            <Route path="/household/:id" element={<HouseholdDetail />} />

            {/* Citizen routes - Flat structure */}
            <Route path="/citizen" element={<CitizenList />} />
            <Route path="/citizen/new" element={<CitizenDetail />} />
            <Route path="/citizen/:id" element={<CitizenDetail />} />

            {/* Population routes - Flat structure */}
            <Route path="/population" element={<PopulationList />} />
            <Route path="/population/new" element={<PopulationDetail />} />
            <Route path="/population/:id" element={<PopulationDetail />} />

            {/* Fee Period routes - Flat structure */}
            <Route path="/fee-period" element={<FeePeriodList />} />
            {/* IMPORTANT: /new must come BEFORE /:id to prevent 'new' being treated as an ID */}
            <Route path="/fee-period/new" element={<FeePeriodDetail />} />
            <Route path="/fee-period/:id" element={<FeePeriodDetail />} />

            {/* Fee Collection routes - Flat structure */}
            <Route path="/fee-collection" element={<FeeCollectionList />} />
            <Route path="/fee-collection/new" element={<FeeCollectionDetail />} />
            <Route path="/fee-collection/:id" element={<FeeCollectionDetail />} />

            {/* Statistics routes */}
            <Route path="/statistics" element={<StatisticsOverview />} />

            {/* Account routes (ADMIN only) */}
            <Route path="/tai-khoan" element={<AccountList />} />
            <Route path="/tai-khoan/new" element={<CreateAccount />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

/* ========== CODE CŨ (ĐÃ COMMENT) ==========
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./features/auth/contexts/AuthContext";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import RegisterTest from "./features/auth/pages/RegisterTest";
import Dashboard from "./features/auth/pages/Dashboard";
import { useContext } from "react";
import App from "./App";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function MainApp() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-test" element={<RegisterTest />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
*/

/**
 * Main App component with routing
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UpiAnalyzer } from './pages/UpiAnalyzer';
import { Dashboard } from './pages/Dashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/analyzer" replace />} />
          <Route path="/analyzer" element={<UpiAnalyzer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/analyzer" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

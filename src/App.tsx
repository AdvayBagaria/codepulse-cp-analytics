import React from 'react';
import { AppProvider } from './context/AppContext';
import DashboardShell from './components/DashboardShell';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <DashboardShell />
      </AppProvider>
    </ErrorBoundary>
  );
}

/**
 * Main App component
 * Orchestrates the hotel reservation system UI
 */

import React from 'react';
import { HotelGrid, BookingControls, StatusPanel } from './components';
import { useHotelReservation } from './hooks';
import './App.css';

function App() {
  const {
    hotelState,
    message,
    stats,
    lastAllocation,
    bookRooms,
    handleReset,
    handleRandomOccupy,
  } = useHotelReservation();

  // Get last booked rooms for highlighting
  const lastBookedRooms = lastAllocation?.success 
    ? lastAllocation.allocatedRooms 
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hotel Room Reservation System</h1>
        <p className="app-subtitle">
          Smart room allocation with optimized travel time
        </p>
      </header>

      <main className="app-main">
        <div className="control-section">
          <BookingControls
            onBook={bookRooms}
            onReset={handleReset}
            onRandomOccupy={handleRandomOccupy}
            availableRooms={stats.availableCount}
          />
          
          <StatusPanel
            stats={stats}
            message={message}
            lastTravelTime={hotelState.lastTravelTime}
          />
        </div>

        <div className="grid-section">
          <HotelGrid
            hotelState={hotelState}
            lastBookedRooms={lastBookedRooms}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-info">
          <p><strong>Travel Time Rules:</strong></p>
          <ul>
            <li>Horizontal (same floor): 1 minute per adjacent room</li>
            <li>Vertical (between floors): 2 minutes per floor</li>
          </ul>
        </div>
        <div className="footer-info">
          <p><strong>Allocation Strategy:</strong></p>
          <ul>
            <li>Prioritizes same-floor allocation</li>
            <li>Minimizes total travel time between first and last room</li>
            <li>Prefers rooms closer to entrance (lower room numbers)</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;

/**
 * StatusPanel component - displays hotel statistics and booking messages
 */

import React from 'react';
import { BookingMessage } from '../../hooks';
import './StatusPanel.css';

interface StatusPanelProps {
  stats: {
    totalRooms: number;
    availableCount: number;
    bookedCount: number;
    occupiedCount: number;
  };
  message: BookingMessage | null;
  lastTravelTime: number | null;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  stats,
  message,
  lastTravelTime,
}) => {
  return (
    <div className="status-panel">
      <div className="stats-section">
        <h3 className="stats-title">Room Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value stat-total">{stats.totalRooms}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value stat-available">{stats.availableCount}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-item">
            <span className="stat-value stat-booked">{stats.bookedCount}</span>
            <span className="stat-label">Booked</span>
          </div>
          <div className="stat-item">
            <span className="stat-value stat-occupied">{stats.occupiedCount}</span>
            <span className="stat-label">Occupied</span>
          </div>
        </div>
      </div>

      {lastTravelTime !== null && (
        <div className="travel-time-section">
          <span className="travel-label">Last Booking Travel Time:</span>
          <span className="travel-value">{lastTravelTime} minute{lastTravelTime !== 1 ? 's' : ''}</span>
        </div>
      )}

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="legend">
        <h4 className="legend-title">Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color legend-available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-booked"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-last-booked"></div>
            <span>Last Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-occupied"></div>
            <span>Occupied (Random)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * BookingControls component - handles user input for room booking
 */

import React, { useState } from 'react';
import { HOTEL_CONFIG } from '../../core';
import './BookingControls.css';

interface BookingControlsProps {
  onBook: (count: number) => void;
  onReset: () => void;
  onRandomOccupy: () => void;
  availableRooms: number;
}

export const BookingControls: React.FC<BookingControlsProps> = ({
  onBook,
  onReset,
  onRandomOccupy,
  availableRooms,
}) => {
  const [roomCount, setRoomCount] = useState<number>(1);

  const handleRoomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    // Clamp value to valid range
    if (isNaN(value)) {
      setRoomCount(HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING);
    } else {
      const clamped = Math.max(
        HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING,
        Math.min(HOTEL_CONFIG.MAX_ROOMS_PER_BOOKING, value)
      );
      setRoomCount(clamped);
    }
  };

  const handleBook = () => {
    onBook(roomCount);
  };

  const canBook = availableRooms >= roomCount;

  return (
    <div className="booking-controls">
      <div className="input-group">
        <label htmlFor="room-count" className="input-label">
          Number of Rooms
        </label>
        <input
          id="room-count"
          type="number"
          min={HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING}
          max={HOTEL_CONFIG.MAX_ROOMS_PER_BOOKING}
          value={roomCount}
          onChange={handleRoomCountChange}
          className="room-input"
        />
        <span className="input-hint">
          (1-5 rooms per booking)
        </span>
      </div>

      <div className="button-group">
        <button
          onClick={handleBook}
          disabled={!canBook}
          className="btn btn-primary"
          title={canBook ? 'Book rooms' : 'Not enough rooms available'}
        >
          Book {roomCount} Room{roomCount > 1 ? 's' : ''}
        </button>

        <button
          onClick={onRandomOccupy}
          className="btn btn-secondary"
          title="Randomly mark ~30% of rooms as occupied"
        >
          Random Occupy
        </button>

        <button
          onClick={onReset}
          className="btn btn-danger"
          title="Reset all rooms to available"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

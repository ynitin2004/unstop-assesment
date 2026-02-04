/**
 * BookingControls component - handles user input for room booking
 */

import React, { useState } from 'react';
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
    const value = Number(e.target.value);
    setRoomCount(value);
  };

  // Ensure room count is valid for booking
  const validRoomCount = Math.max(1, Math.min(5, roomCount || 1));

  const handleBook = () => {
    onBook(validRoomCount);
  };

  const canBook = availableRooms >= validRoomCount;

  return (
    <div className="booking-controls">
      <div className="input-group">
        <label htmlFor="room-count" className="input-label">
          Number of Rooms
        </label>
        <input
          id="room-count"
          type="number"
          min={1}
          max={5}
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
          Book {validRoomCount} Room{validRoomCount > 1 ? 's' : ''}
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

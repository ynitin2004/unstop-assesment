/**
 * HotelGrid component - displays the entire hotel floor layout
 * Shows floors from top (10) to bottom (1) for visual clarity
 */

import React from 'react';
import { Floor } from '../Floor';
import { HotelState, HOTEL_CONFIG } from '../../core';
import './HotelGrid.css';

interface HotelGridProps {
  hotelState: HotelState;
  lastBookedRooms: number[];
}

export const HotelGrid: React.FC<HotelGridProps> = ({
  hotelState,
  lastBookedRooms,
}) => {
  // Display floors from top to bottom (10 to 1)
  const floors = Array.from(
    { length: HOTEL_CONFIG.TOTAL_FLOORS },
    (_, i) => HOTEL_CONFIG.TOTAL_FLOORS - i
  );

  return (
    <div className="hotel-grid">
      <div className="hotel-header">
        <h2>Hotel Room Layout</h2>
        <p className="hotel-subtitle">Floors displayed from top (10) to bottom (1)</p>
      </div>
      
      <div className="hotel-floors">
        {floors.map((floorNumber) => (
          <Floor
            key={floorNumber}
            floorNumber={floorNumber}
            hotelState={hotelState}
            lastBookedRooms={lastBookedRooms}
          />
        ))}
      </div>
      
      <div className="hotel-footer">
        <span className="entrance-label">↑ Entrance / Stairs / Lift</span>
      </div>
    </div>
  );
};

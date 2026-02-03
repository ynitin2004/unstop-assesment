/**
 * Floor component - displays a row of rooms for a single floor
 */

import React from 'react';
import { Room } from '../Room';
import { HotelState, getRoomsOnFloor } from '../../core';
import './Floor.css';

interface FloorProps {
  floorNumber: number;
  hotelState: HotelState;
  lastBookedRooms: number[];
}

export const Floor: React.FC<FloorProps> = ({
  floorNumber,
  hotelState,
  lastBookedRooms,
}) => {
  const roomNumbers = getRoomsOnFloor(floorNumber);
  const lastBookedSet = new Set(lastBookedRooms);

  return (
    <div className="floor">
      <div className="floor-label">
        <span className="floor-number">F{floorNumber}</span>
      </div>
      <div className="floor-rooms">
        {roomNumbers.map((roomNumber) => {
          const room = hotelState.rooms.get(roomNumber);
          if (!room) return null;

          return (
            <Room
              key={roomNumber}
              roomNumber={roomNumber}
              status={room.status}
              isLastBooked={lastBookedSet.has(roomNumber)}
            />
          );
        })}
      </div>
    </div>
  );
};

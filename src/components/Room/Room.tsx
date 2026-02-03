/**
 * Room component - displays a single room cell with status coloring
 */

import React from 'react';
import { RoomStatus } from '../../core';
import './Room.css';

interface RoomProps {
  roomNumber: number;
  status: RoomStatus;
  isLastBooked: boolean;
}

/**
 * Get CSS class based on room status
 */
function getStatusClass(status: RoomStatus, isLastBooked: boolean): string {
  if (isLastBooked) {
    return 'room room-last-booked';
  }
  
  switch (status) {
    case 'available':
      return 'room room-available';
    case 'booked':
      return 'room room-booked';
    case 'occupied':
      return 'room room-occupied';
    default:
      return 'room';
  }
}

/**
 * Get tooltip text based on status
 */
function getTooltip(roomNumber: number, status: RoomStatus): string {
  const statusLabels: Record<RoomStatus, string> = {
    available: 'Available',
    booked: 'Booked',
    occupied: 'Occupied (Random)',
  };
  
  return `Room ${roomNumber} - ${statusLabels[status]}`;
}

export const Room: React.FC<RoomProps> = ({ roomNumber, status, isLastBooked }) => {
  return (
    <div
      className={getStatusClass(status, isLastBooked)}
      title={getTooltip(roomNumber, status)}
    >
      <span className="room-number">{roomNumber}</span>
    </div>
  );
};

/**
 * Custom hook for managing hotel reservation state
 * Separates UI state management from business logic
 */

import { useState, useCallback } from 'react';
import {
  HotelState,
  createInitialHotelState,
  processBooking,
  resetHotel,
  randomlyOccupyRooms,
  getHotelStats,
  AllocationResult,
} from '../core';

export interface BookingMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface UseHotelReservationReturn {
  hotelState: HotelState;
  message: BookingMessage | null;
  stats: ReturnType<typeof getHotelStats>;
  lastAllocation: AllocationResult | null;
  bookRooms: (count: number) => void;
  handleReset: () => void;
  handleRandomOccupy: () => void;
  clearMessage: () => void;
}

/**
 * Hook that manages hotel state and provides booking operations
 */
export function useHotelReservation(): UseHotelReservationReturn {
  const [hotelState, setHotelState] = useState<HotelState>(() => createInitialHotelState());
  const [message, setMessage] = useState<BookingMessage | null>(null);
  const [lastAllocation, setLastAllocation] = useState<AllocationResult | null>(null);

  /**
   * Attempt to book specified number of rooms
   */
  const bookRooms = useCallback((count: number) => {
    const { newState, result } = processBooking(hotelState, count);

    if (result.success) {
      setHotelState(newState);
      setLastAllocation(result);
      setMessage({
        type: 'success',
        text: `Successfully booked ${result.allocatedRooms.length} room(s): ${result.allocatedRooms.join(', ')}. Travel time: ${result.travelTime} minute(s). Selected to minimize total travel time based on entrance proximity.`,
      });
    } else {
      setLastAllocation(null);
      setMessage({
        type: 'error',
        text: result.errorMessage || 'Booking failed',
      });
    }
  }, [hotelState]);

  /**
   * Reset hotel to initial state
   */
  const handleReset = useCallback(() => {
    setHotelState(resetHotel());
    setLastAllocation(null);
    setMessage({
      type: 'info',
      text: 'Hotel reset. All rooms are now available.',
    });
  }, []);

  /**
   * Randomly mark some rooms as occupied
   */
  const handleRandomOccupy = useCallback(() => {
    const occupancyRate = 0.3; // 30% random occupancy
    const newState = randomlyOccupyRooms(hotelState, occupancyRate);
    setHotelState(newState);
    setLastAllocation(null);
    
    const stats = getHotelStats(newState);
    setMessage({
      type: 'info',
      text: `Randomly occupied ${stats.occupiedCount} rooms. ${stats.availableCount} rooms available.`,
    });
  }, [hotelState]);

  /**
   * Clear current message
   */
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const stats = getHotelStats(hotelState);

  return {
    hotelState,
    message,
    stats,
    lastAllocation,
    bookRooms,
    handleReset,
    handleRandomOccupy,
    clearMessage,
  };
}

/**
 * Hotel state management
 * Provides functions to manage room availability and bookings
 */

import { Room, RoomStatus, HotelState } from './types';
import { generateAllRoomNumbers } from './constants';
import { extractFloor, extractPosition } from './roomUtils';
import { allocateRooms, AllocationResult } from './allocation';

/**
 * Create initial hotel state with all rooms available
 */
export function createInitialHotelState(): HotelState {
  const rooms = new Map<number, Room>();
  const allRoomNumbers = generateAllRoomNumbers();
  
  for (const roomNumber of allRoomNumbers) {
    rooms.set(roomNumber, {
      roomNumber,
      floor: extractFloor(roomNumber),
      position: extractPosition(roomNumber),
      status: 'available',
    });
  }
  
  return {
    rooms,
    lastBooking: null,
    lastTravelTime: null,
  };
}

/**
 * Get list of available room numbers from hotel state
 */
export function getAvailableRooms(state: HotelState): number[] {
  const available: number[] = [];
  
  for (const [roomNumber, room] of state.rooms) {
    if (room.status === 'available') {
      available.push(roomNumber);
    }
  }
  
  return available.sort((a, b) => a - b);
}

/**
 * Get list of booked room numbers from hotel state
 */
export function getBookedRooms(state: HotelState): number[] {
  const booked: number[] = [];
  
  for (const [roomNumber, room] of state.rooms) {
    if (room.status === 'booked') {
      booked.push(roomNumber);
    }
  }
  
  return booked.sort((a, b) => a - b);
}

/**
 * Get list of randomly occupied room numbers
 */
export function getOccupiedRooms(state: HotelState): number[] {
  const occupied: number[] = [];
  
  for (const [roomNumber, room] of state.rooms) {
    if (room.status === 'occupied') {
      occupied.push(roomNumber);
    }
  }
  
  return occupied.sort((a, b) => a - b);
}

/**
 * Create new state with rooms marked as a specific status
 * Pure function - does not mutate input
 */
export function updateRoomStatus(
  state: HotelState,
  roomNumbers: number[],
  newStatus: RoomStatus
): HotelState {
  const newRooms = new Map(state.rooms);
  
  for (const roomNumber of roomNumbers) {
    const existingRoom = newRooms.get(roomNumber);
    
    if (existingRoom) {
      newRooms.set(roomNumber, {
        ...existingRoom,
        status: newStatus,
      });
    }
  }
  
  return {
    ...state,
    rooms: newRooms,
  };
}

/**
 * Process a booking request
 * Returns new state and allocation result
 */
export function processBooking(
  state: HotelState,
  numberOfRooms: number
): { newState: HotelState; result: AllocationResult } {
  const availableRooms = getAvailableRooms(state);
  const result = allocateRooms(numberOfRooms, availableRooms);
  
  if (!result.success) {
    return { newState: state, result };
  }
  
  // Mark allocated rooms as booked
  const newState = updateRoomStatus(state, result.allocatedRooms, 'booked');
  
  return {
    newState: {
      ...newState,
      lastBooking: result.allocatedRooms,
      lastTravelTime: result.travelTime,
    },
    result,
  };
}

/**
 * Reset hotel to initial state (all rooms available)
 */
export function resetHotel(): HotelState {
  return createInitialHotelState();
}

/**
 * Randomly occupy some rooms
 * Useful for testing different scenarios
 */
export function randomlyOccupyRooms(
  state: HotelState,
  occupancyRate: number = 0.3
): HotelState {
  // Clear all previous statuses first
  let newState = resetHotel();
  
  // Get all room numbers
  const allRooms = generateAllRoomNumbers();
  
  // Randomly mark rooms as occupied based on rate
  const roomsToOccupy: number[] = [];
  
  for (const room of allRooms) {
    if (Math.random() < occupancyRate) {
      roomsToOccupy.push(room);
    }
  }
  
  newState = updateRoomStatus(newState, roomsToOccupy, 'occupied');
  
  return {
    ...newState,
    lastBooking: null,
    lastTravelTime: null,
  };
}

/**
 * Get statistics about current hotel state
 */
export function getHotelStats(state: HotelState): {
  totalRooms: number;
  availableCount: number;
  bookedCount: number;
  occupiedCount: number;
} {
  let availableCount = 0;
  let bookedCount = 0;
  let occupiedCount = 0;
  
  for (const [, room] of state.rooms) {
    switch (room.status) {
      case 'available':
        availableCount++;
        break;
      case 'booked':
        bookedCount++;
        break;
      case 'occupied':
        occupiedCount++;
        break;
    }
  }
  
  return {
    totalRooms: state.rooms.size,
    availableCount,
    bookedCount,
    occupiedCount,
  };
}

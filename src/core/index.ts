/**
 * Core module exports
 * Centralizes all exports from the core business logic
 */

// Constants
export {
  HOTEL_CONFIG,
  TRAVEL_TIME,
  generateAllRoomNumbers,
  getRoomsCountForFloor,
  getTotalRoomCount,
} from './constants';

// Room utilities
export {
  extractFloor,
  extractPosition,
  isValidRoomNumber,
  createRoomNumber,
  getRoomsOnFloor,
  sortRoomNumbers,
} from './roomUtils';

// Travel time calculations
export {
  calculateHorizontalTime,
  calculateVerticalTime,
  calculateTravelTime,
  calculateTotalTravelTimeForRooms,
  calculateGroupSpan,
} from './travelTime';

export type { TravelTimeResult } from './travelTime';

// Allocation algorithm
export {
  allocateRooms,
  canAllocate,
} from './allocation';

export type { AllocationResult } from './allocation';

// Types
export type {
  Room,
  RoomStatus,
  HotelState,
  BookingRequest,
  BookingResponse,
} from './types';

// Hotel state management
export {
  createInitialHotelState,
  getAvailableRooms,
  getBookedRooms,
  getOccupiedRooms,
  updateRoomStatus,
  processBooking,
  resetHotel,
  randomlyOccupyRooms,
  getHotelStats,
} from './hotelState';

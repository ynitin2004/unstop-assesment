/**
 * Type definitions for the Hotel Reservation System
 */

/**
 * Possible states of a room
 */
export type RoomStatus = 'available' | 'booked' | 'occupied';

/**
 * Room representation with status
 */
export interface Room {
  roomNumber: number;
  floor: number;
  position: number;
  status: RoomStatus;
}

/**
 * Hotel state containing all room information
 */
export interface HotelState {
  rooms: Map<number, Room>;
  lastBooking: number[] | null;
  lastTravelTime: number | null;
}

/**
 * Booking request from user
 */
export interface BookingRequest {
  numberOfRooms: number;
}

/**
 * Booking response to user
 */
export interface BookingResponse {
  success: boolean;
  bookedRooms: number[];
  travelTime: number;
  message: string;
}

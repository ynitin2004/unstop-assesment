/**
 * Travel time calculation utilities
 * 
 * Travel rules:
 * - Horizontal (same floor): 1 minute per adjacent room
 * - Vertical (between floors): 2 minutes per floor
 * - Cross-floor travel = vertical + horizontal time
 */

import { TRAVEL_TIME } from './constants';
import { extractFloor, extractPosition, isValidRoomNumber } from './roomUtils';

/**
 * Result type for travel time calculations
 */
export interface TravelTimeResult {
  totalMinutes: number;
  verticalMinutes: number;
  horizontalMinutes: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculate horizontal travel time between two positions on the same floor
 * Returns number of minutes based on room position difference
 */
export function calculateHorizontalTime(position1: number, position2: number): number {
  const distance = Math.abs(position1 - position2);
  return distance * TRAVEL_TIME.HORIZONTAL_PER_ROOM;
}

/**
 * Calculate vertical travel time between two floors
 * Returns number of minutes based on floor difference
 */
export function calculateVerticalTime(floor1: number, floor2: number): number {
  const floorDifference = Math.abs(floor1 - floor2);
  return floorDifference * TRAVEL_TIME.VERTICAL_PER_FLOOR;
}

/**
 * Calculate total travel time between two rooms
 * Handles validation and returns detailed breakdown
 */
export function calculateTravelTime(room1: number, room2: number): TravelTimeResult {
  // Validate both room numbers
  if (!isValidRoomNumber(room1)) {
    return {
      totalMinutes: 0,
      verticalMinutes: 0,
      horizontalMinutes: 0,
      isValid: false,
      errorMessage: `Invalid room number: ${room1}`,
    };
  }
  
  if (!isValidRoomNumber(room2)) {
    return {
      totalMinutes: 0,
      verticalMinutes: 0,
      horizontalMinutes: 0,
      isValid: false,
      errorMessage: `Invalid room number: ${room2}`,
    };
  }
  
  // Same room = no travel time
  if (room1 === room2) {
    return {
      totalMinutes: 0,
      verticalMinutes: 0,
      horizontalMinutes: 0,
      isValid: true,
    };
  }
  
  const floor1 = extractFloor(room1);
  const floor2 = extractFloor(room2);
  const position1 = extractPosition(room1);
  const position2 = extractPosition(room2);
  
  const verticalMinutes = calculateVerticalTime(floor1, floor2);
  const horizontalMinutes = calculateHorizontalTime(position1, position2);
  
  return {
    totalMinutes: verticalMinutes + horizontalMinutes,
    verticalMinutes,
    horizontalMinutes,
    isValid: true,
  };
}

/**
 * Calculate total travel time for a sequence of rooms
 * This represents the time to visit all rooms in order (first to last)
 * 
 * For booking purposes, we typically care about the span from first to last room
 */
export function calculateTotalTravelTimeForRooms(rooms: number[]): TravelTimeResult {
  if (rooms.length === 0) {
    return {
      totalMinutes: 0,
      verticalMinutes: 0,
      horizontalMinutes: 0,
      isValid: true,
    };
  }
  
  if (rooms.length === 1) {
    if (!isValidRoomNumber(rooms[0])) {
      return {
        totalMinutes: 0,
        verticalMinutes: 0,
        horizontalMinutes: 0,
        isValid: false,
        errorMessage: `Invalid room number: ${rooms[0]}`,
      };
    }
    return {
      totalMinutes: 0,
      verticalMinutes: 0,
      horizontalMinutes: 0,
      isValid: true,
    };
  }
  
  // Validate all rooms first
  for (const room of rooms) {
    if (!isValidRoomNumber(room)) {
      return {
        totalMinutes: 0,
        verticalMinutes: 0,
        horizontalMinutes: 0,
        isValid: false,
        errorMessage: `Invalid room number: ${room}`,
      };
    }
  }
  
  // Sort rooms to get logical first and last
  const sortedRooms = [...rooms].sort((a, b) => a - b);
  const firstRoom = sortedRooms[0];
  const lastRoom = sortedRooms[sortedRooms.length - 1];
  
  // Travel time is from first booked room to last booked room
  return calculateTravelTime(firstRoom, lastRoom);
}

/**
 * Calculate the span (travel time) from the minimum to maximum room in a group
 * This is useful for comparing different room allocation options
 */
export function calculateGroupSpan(rooms: number[]): number {
  if (rooms.length <= 1) {
    return 0;
  }
  
  const result = calculateTotalTravelTimeForRooms(rooms);
  return result.isValid ? result.totalMinutes : Infinity;
}

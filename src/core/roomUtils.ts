/**
 * Room utility functions for extracting floor/position and validation
 */

import { HOTEL_CONFIG, getRoomsCountForFloor } from './constants';

/**
 * Extract floor number from room number
 * Room 101 → Floor 1, Room 1005 → Floor 10
 */
export function extractFloor(roomNumber: number): number {
  return Math.floor(roomNumber / 100);
}

/**
 * Extract position (1-indexed) on the floor from room number
 * Room 101 → Position 1, Room 205 → Position 5
 */
export function extractPosition(roomNumber: number): number {
  return roomNumber % 100;
}

/**
 * Check if a room number is valid within hotel constraints
 */
export function isValidRoomNumber(roomNumber: number): boolean {
  // Must be a positive integer
  if (!Number.isInteger(roomNumber) || roomNumber < 100) {
    return false;
  }
  
  const floor = extractFloor(roomNumber);
  const position = extractPosition(roomNumber);
  
  // Floor must be within hotel range
  if (floor < 1 || floor > HOTEL_CONFIG.TOTAL_FLOORS) {
    return false;
  }
  
  // Position must be within valid range for that floor
  const maxRoomsOnFloor = getRoomsCountForFloor(floor);
  if (position < 1 || position > maxRoomsOnFloor) {
    return false;
  }
  
  return true;
}

/**
 * Create room number from floor and position
 */
export function createRoomNumber(floor: number, position: number): number {
  return floor * 100 + position;
}

/**
 * Get all room numbers on a specific floor
 */
export function getRoomsOnFloor(floor: number): number[] {
  const roomCount = getRoomsCountForFloor(floor);
  const rooms: number[] = [];
  
  for (let pos = 1; pos <= roomCount; pos++) {
    rooms.push(createRoomNumber(floor, pos));
  }
  
  return rooms;
}

/**
 * Sort room numbers by floor first, then by position
 */
export function sortRoomNumbers(rooms: number[]): number[] {
  return [...rooms].sort((a, b) => {
    const floorA = extractFloor(a);
    const floorB = extractFloor(b);
    
    if (floorA !== floorB) {
      return floorA - floorB;
    }
    
    return extractPosition(a) - extractPosition(b);
  });
}

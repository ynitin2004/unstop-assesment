/**
 * Hotel configuration constants
 * 
 * The hotel has a unique structure:
 * - 10 floors total
 * - Floors 1-9 have 10 rooms each (e.g., 101-110, 201-210)
 * - Floor 10 has only 7 rooms (1001-1007)
 * - Room numbering: floor number * 100 + position (1-indexed)
 */

export const HOTEL_CONFIG = {
  // Total number of floors in the hotel
  TOTAL_FLOORS: 10,
  
  // Standard rooms per floor (floors 1-9)
  STANDARD_ROOMS_PER_FLOOR: 10,
  
  // Top floor (10) has fewer rooms
  TOP_FLOOR_ROOMS: 7,
  
  // Top floor number
  TOP_FLOOR: 10,
  
  // Booking constraints
  MIN_ROOMS_PER_BOOKING: 1,
  MAX_ROOMS_PER_BOOKING: 5,
} as const;

// Travel time constants (in minutes)
export const TRAVEL_TIME = {
  // Time to move horizontally between adjacent rooms on same floor
  HORIZONTAL_PER_ROOM: 1,
  
  // Time to move vertically between adjacent floors
  VERTICAL_PER_FLOOR: 2,
} as const;

/**
 * Generate all valid room numbers in the hotel
 * Returns sorted array of room numbers
 */
export function generateAllRoomNumbers(): number[] {
  const rooms: number[] = [];
  
  for (let floor = 1; floor <= HOTEL_CONFIG.TOTAL_FLOORS; floor++) {
    const roomsOnFloor = getRoomsCountForFloor(floor);
    
    for (let position = 1; position <= roomsOnFloor; position++) {
      rooms.push(floor * 100 + position);
    }
  }
  
  return rooms;
}

/**
 * Get number of rooms on a specific floor
 */
export function getRoomsCountForFloor(floor: number): number {
  if (floor < 1 || floor > HOTEL_CONFIG.TOTAL_FLOORS) {
    return 0;
  }
  
  return floor === HOTEL_CONFIG.TOP_FLOOR
    ? HOTEL_CONFIG.TOP_FLOOR_ROOMS
    : HOTEL_CONFIG.STANDARD_ROOMS_PER_FLOOR;
}

/**
 * Get total room count in the hotel
 * Floors 1-9: 10 rooms each = 90 rooms
 * Floor 10: 7 rooms
 * Total: 97 rooms
 */
export function getTotalRoomCount(): number {
  return (HOTEL_CONFIG.TOTAL_FLOORS - 1) * HOTEL_CONFIG.STANDARD_ROOMS_PER_FLOOR 
    + HOTEL_CONFIG.TOP_FLOOR_ROOMS;
}

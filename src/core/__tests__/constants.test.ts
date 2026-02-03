/**
 * Unit tests for hotel constants and configuration
 */

import {
  HOTEL_CONFIG,
  TRAVEL_TIME,
  generateAllRoomNumbers,
  getRoomsCountForFloor,
  getTotalRoomCount,
} from '../constants';

describe('Hotel Configuration Constants', () => {
  test('should have correct total floors', () => {
    expect(HOTEL_CONFIG.TOTAL_FLOORS).toBe(10);
  });

  test('should have 10 rooms per standard floor', () => {
    expect(HOTEL_CONFIG.STANDARD_ROOMS_PER_FLOOR).toBe(10);
  });

  test('should have 7 rooms on top floor', () => {
    expect(HOTEL_CONFIG.TOP_FLOOR_ROOMS).toBe(7);
  });

  test('should allow booking between 1 and 5 rooms', () => {
    expect(HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING).toBe(1);
    expect(HOTEL_CONFIG.MAX_ROOMS_PER_BOOKING).toBe(5);
  });
});

describe('Travel Time Constants', () => {
  test('should take 1 minute per horizontal room', () => {
    expect(TRAVEL_TIME.HORIZONTAL_PER_ROOM).toBe(1);
  });

  test('should take 2 minutes per vertical floor', () => {
    expect(TRAVEL_TIME.VERTICAL_PER_FLOOR).toBe(2);
  });
});

describe('getRoomsCountForFloor', () => {
  test('should return 10 rooms for floors 1-9', () => {
    for (let floor = 1; floor <= 9; floor++) {
      expect(getRoomsCountForFloor(floor)).toBe(10);
    }
  });

  test('should return 7 rooms for floor 10', () => {
    expect(getRoomsCountForFloor(10)).toBe(7);
  });

  test('should return 0 for invalid floors', () => {
    expect(getRoomsCountForFloor(0)).toBe(0);
    expect(getRoomsCountForFloor(-1)).toBe(0);
    expect(getRoomsCountForFloor(11)).toBe(0);
    expect(getRoomsCountForFloor(100)).toBe(0);
  });
});

describe('getTotalRoomCount', () => {
  test('should return correct total (97 rooms)', () => {
    // 9 floors × 10 rooms + 1 floor × 7 rooms = 90 + 7 = 97
    expect(getTotalRoomCount()).toBe(97);
  });
});

describe('generateAllRoomNumbers', () => {
  test('should generate exactly 97 room numbers', () => {
    const rooms = generateAllRoomNumbers();
    expect(rooms.length).toBe(97);
  });

  test('should generate correct room numbers for floor 1', () => {
    const rooms = generateAllRoomNumbers();
    const floor1Rooms = rooms.filter(r => r >= 101 && r <= 110);
    
    expect(floor1Rooms).toEqual([101, 102, 103, 104, 105, 106, 107, 108, 109, 110]);
  });

  test('should generate correct room numbers for floor 10', () => {
    const rooms = generateAllRoomNumbers();
    const floor10Rooms = rooms.filter(r => r >= 1001 && r <= 1010);
    
    // Floor 10 should only have rooms 1001-1007
    expect(floor10Rooms).toEqual([1001, 1002, 1003, 1004, 1005, 1006, 1007]);
  });

  test('should return rooms in sorted order', () => {
    const rooms = generateAllRoomNumbers();
    const sorted = [...rooms].sort((a, b) => a - b);
    
    expect(rooms).toEqual(sorted);
  });

  test('should start with room 101 and end with room 1007', () => {
    const rooms = generateAllRoomNumbers();
    
    expect(rooms[0]).toBe(101);
    expect(rooms[rooms.length - 1]).toBe(1007);
  });
});

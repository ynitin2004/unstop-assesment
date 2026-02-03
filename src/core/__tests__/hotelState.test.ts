/**
 * Unit tests for hotel state management
 */

import {
  createInitialHotelState,
  getAvailableRooms,
  getBookedRooms,
  getOccupiedRooms,
  updateRoomStatus,
  processBooking,
  resetHotel,
  randomlyOccupyRooms,
  getHotelStats,
} from '../hotelState';
import { getTotalRoomCount } from '../constants';

describe('createInitialHotelState', () => {
  test('should create state with all 97 rooms', () => {
    const state = createInitialHotelState();
    
    expect(state.rooms.size).toBe(97);
  });

  test('should have all rooms available initially', () => {
    const state = createInitialHotelState();
    
    for (const [, room] of state.rooms) {
      expect(room.status).toBe('available');
    }
  });

  test('should have no last booking initially', () => {
    const state = createInitialHotelState();
    
    expect(state.lastBooking).toBeNull();
    expect(state.lastTravelTime).toBeNull();
  });

  test('should correctly set floor and position for each room', () => {
    const state = createInitialHotelState();
    
    const room101 = state.rooms.get(101);
    expect(room101?.floor).toBe(1);
    expect(room101?.position).toBe(1);
    
    const room510 = state.rooms.get(510);
    expect(room510?.floor).toBe(5);
    expect(room510?.position).toBe(10);
    
    const room1007 = state.rooms.get(1007);
    expect(room1007?.floor).toBe(10);
    expect(room1007?.position).toBe(7);
  });
});

describe('getAvailableRooms', () => {
  test('should return all rooms when none are booked', () => {
    const state = createInitialHotelState();
    const available = getAvailableRooms(state);
    
    expect(available.length).toBe(97);
  });

  test('should return sorted room numbers', () => {
    const state = createInitialHotelState();
    const available = getAvailableRooms(state);
    
    const sorted = [...available].sort((a, b) => a - b);
    expect(available).toEqual(sorted);
  });

  test('should exclude booked rooms', () => {
    let state = createInitialHotelState();
    state = updateRoomStatus(state, [101, 102, 103], 'booked');
    
    const available = getAvailableRooms(state);
    
    expect(available.length).toBe(94);
    expect(available).not.toContain(101);
    expect(available).not.toContain(102);
    expect(available).not.toContain(103);
  });
});

describe('getBookedRooms', () => {
  test('should return empty array when no rooms booked', () => {
    const state = createInitialHotelState();
    const booked = getBookedRooms(state);
    
    expect(booked).toEqual([]);
  });

  test('should return booked rooms in sorted order', () => {
    let state = createInitialHotelState();
    state = updateRoomStatus(state, [305, 101, 210], 'booked');
    
    const booked = getBookedRooms(state);
    
    expect(booked).toEqual([101, 210, 305]);
  });
});

describe('getOccupiedRooms', () => {
  test('should return empty array when no rooms occupied', () => {
    const state = createInitialHotelState();
    const occupied = getOccupiedRooms(state);
    
    expect(occupied).toEqual([]);
  });

  test('should return occupied rooms', () => {
    let state = createInitialHotelState();
    state = updateRoomStatus(state, [501, 502], 'occupied');
    
    const occupied = getOccupiedRooms(state);
    
    expect(occupied).toEqual([501, 502]);
  });
});

describe('updateRoomStatus', () => {
  test('should not mutate original state', () => {
    const originalState = createInitialHotelState();
    const originalRoom101 = originalState.rooms.get(101);
    
    updateRoomStatus(originalState, [101], 'booked');
    
    expect(originalState.rooms.get(101)?.status).toBe('available');
  });

  test('should return new state with updated rooms', () => {
    const state = createInitialHotelState();
    const newState = updateRoomStatus(state, [101, 102], 'booked');
    
    expect(newState.rooms.get(101)?.status).toBe('booked');
    expect(newState.rooms.get(102)?.status).toBe('booked');
    expect(newState.rooms.get(103)?.status).toBe('available');
  });

  test('should handle empty room array', () => {
    const state = createInitialHotelState();
    const newState = updateRoomStatus(state, [], 'booked');
    
    expect(getAvailableRooms(newState).length).toBe(97);
  });

  test('should ignore non-existent room numbers', () => {
    const state = createInitialHotelState();
    const newState = updateRoomStatus(state, [9999], 'booked');
    
    expect(newState.rooms.get(9999)).toBeUndefined();
  });
});

describe('processBooking', () => {
  test('should successfully book rooms and update state', () => {
    const state = createInitialHotelState();
    const { newState, result } = processBooking(state, 3);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(3);
    
    // Rooms should be marked as booked in new state
    for (const room of result.allocatedRooms) {
      expect(newState.rooms.get(room)?.status).toBe('booked');
    }
  });

  test('should update lastBooking and lastTravelTime', () => {
    const state = createInitialHotelState();
    const { newState, result } = processBooking(state, 2);
    
    expect(newState.lastBooking).toEqual(result.allocatedRooms);
    expect(newState.lastTravelTime).toBe(result.travelTime);
  });

  test('should fail gracefully for invalid requests', () => {
    const state = createInitialHotelState();
    const { newState, result } = processBooking(state, 10);
    
    expect(result.success).toBe(false);
    expect(newState).toBe(state); // State unchanged
  });

  test('should not modify original state on success', () => {
    const originalState = createInitialHotelState();
    const originalAvailable = getAvailableRooms(originalState).length;
    
    processBooking(originalState, 3);
    
    expect(getAvailableRooms(originalState).length).toBe(originalAvailable);
  });
});

describe('resetHotel', () => {
  test('should return fresh state with all rooms available', () => {
    let state = createInitialHotelState();
    state = updateRoomStatus(state, [101, 102, 103], 'booked');
    state = updateRoomStatus(state, [201, 202], 'occupied');
    
    const resetState = resetHotel();
    
    expect(getAvailableRooms(resetState).length).toBe(97);
    expect(getBookedRooms(resetState).length).toBe(0);
    expect(getOccupiedRooms(resetState).length).toBe(0);
  });
});

describe('randomlyOccupyRooms', () => {
  test('should mark some rooms as occupied', () => {
    const state = createInitialHotelState();
    const newState = randomlyOccupyRooms(state, 0.5);
    
    const occupied = getOccupiedRooms(newState);
    
    // With 50% rate, should have roughly half occupied
    // Allow wide tolerance due to randomness
    expect(occupied.length).toBeGreaterThan(0);
    expect(occupied.length).toBeLessThan(97);
  });

  test('should clear last booking after random occupation', () => {
    let state = createInitialHotelState();
    const { newState: bookedState } = processBooking(state, 3);
    
    const randomState = randomlyOccupyRooms(bookedState, 0.3);
    
    expect(randomState.lastBooking).toBeNull();
    expect(randomState.lastTravelTime).toBeNull();
  });

  test('should handle 0% occupancy rate', () => {
    const state = createInitialHotelState();
    const newState = randomlyOccupyRooms(state, 0);
    
    expect(getOccupiedRooms(newState).length).toBe(0);
  });
});

describe('getHotelStats', () => {
  test('should return correct initial stats', () => {
    const state = createInitialHotelState();
    const stats = getHotelStats(state);
    
    expect(stats.totalRooms).toBe(97);
    expect(stats.availableCount).toBe(97);
    expect(stats.bookedCount).toBe(0);
    expect(stats.occupiedCount).toBe(0);
  });

  test('should reflect room status changes', () => {
    let state = createInitialHotelState();
    state = updateRoomStatus(state, [101, 102, 103], 'booked');
    state = updateRoomStatus(state, [201, 202], 'occupied');
    
    const stats = getHotelStats(state);
    
    expect(stats.totalRooms).toBe(97);
    expect(stats.availableCount).toBe(92);
    expect(stats.bookedCount).toBe(3);
    expect(stats.occupiedCount).toBe(2);
  });
});

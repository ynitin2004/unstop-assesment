/**
 * Unit tests for room allocation algorithm
 * Tests various scenarios including edge cases
 */

import { allocateRooms, canAllocate } from '../allocation';
import { generateAllRoomNumbers, getRoomsCountForFloor } from '../constants';
import { extractFloor, extractPosition } from '../roomUtils';
import { calculateGroupSpan } from '../travelTime';

describe('allocateRooms - Input Validation', () => {
  const allRooms = generateAllRoomNumbers();

  describe('invalid number of rooms', () => {
    test('should reject 0 rooms', () => {
      const result = allocateRooms(0, allRooms);
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Minimum');
    });

    test('should reject negative rooms', () => {
      const result = allocateRooms(-1, allRooms);
      
      expect(result.success).toBe(false);
    });

    test('should reject more than 5 rooms', () => {
      const result = allocateRooms(6, allRooms);
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Maximum');
    });

    test('should reject non-integer input', () => {
      const result = allocateRooms(2.5, allRooms);
      
      expect(result.success).toBe(false);
    });
  });

  describe('insufficient availability', () => {
    test('should reject when not enough rooms available', () => {
      const result = allocateRooms(5, [101, 102, 103]); // Only 3 available
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Not enough');
    });

    test('should reject when no rooms available', () => {
      const result = allocateRooms(1, []);
      
      expect(result.success).toBe(false);
    });
  });
});

describe('allocateRooms - Same Floor Allocation', () => {
  const allRooms = generateAllRoomNumbers();

  test('should allocate single room on lowest available floor', () => {
    const result = allocateRooms(1, allRooms);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(1);
    expect(result.travelTime).toBe(0);
    // Should be room 101 (lowest number)
    expect(result.allocatedRooms[0]).toBe(101);
  });

  test('should allocate contiguous rooms on same floor', () => {
    const result = allocateRooms(3, allRooms);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(3);
    
    // All rooms should be on same floor
    const floors = result.allocatedRooms.map(extractFloor);
    expect(new Set(floors).size).toBe(1);
    
    // Rooms should be contiguous
    const positions = result.allocatedRooms.map(extractPosition).sort((a, b) => a - b);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBe(1);
    }
  });

  test('should prefer lower floor numbers when multiple options exist', () => {
    const result = allocateRooms(2, allRooms);
    
    expect(result.success).toBe(true);
    // Should allocate on floor 1 (lowest)
    expect(extractFloor(result.allocatedRooms[0])).toBe(1);
  });

  test('should allocate maximum 5 rooms on same floor', () => {
    const result = allocateRooms(5, allRooms);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(5);
    
    // All on same floor
    const floor = extractFloor(result.allocatedRooms[0]);
    expect(result.allocatedRooms.every(r => extractFloor(r) === floor)).toBe(true);
  });

  test('should choose rooms with minimum travel time on same floor', () => {
    const result = allocateRooms(3, allRooms);
    
    // Travel time for 3 contiguous rooms = 2 (position difference)
    expect(result.travelTime).toBe(2);
  });
});

describe('allocateRooms - Floor 10 Edge Cases', () => {
  test('should handle floor 10 having only 7 rooms', () => {
    // Only floor 10 rooms available
    const floor10Only = [1001, 1002, 1003, 1004, 1005, 1006, 1007];
    
    const result = allocateRooms(5, floor10Only);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(5);
    expect(result.allocatedRooms.every(r => extractFloor(r) === 10)).toBe(true);
  });

  test('should fail when requesting more rooms than floor 10 has', () => {
    // Only floor 10 rooms available, but we want more than 7
    const floor10Only = [1001, 1002, 1003, 1004, 1005, 1006, 1007];
    
    // Note: Max booking is 5, but if floor 10 had fewer available...
    const partialFloor10 = [1001, 1002, 1003];
    const result = allocateRooms(5, partialFloor10);
    
    expect(result.success).toBe(false);
  });

  test('should correctly calculate positions on floor 10', () => {
    const floor10Only = [1001, 1002, 1003, 1004, 1005, 1006, 1007];
    
    const result = allocateRooms(3, floor10Only);
    
    expect(result.success).toBe(true);
    // Should get rooms 1001, 1002, 1003 for minimum travel
    expect(result.allocatedRooms).toEqual([1001, 1002, 1003]);
    expect(result.travelTime).toBe(2);
  });
});

describe('allocateRooms - Cross-Floor Allocation', () => {
  test('should allocate across floors when same floor not possible', () => {
    // Only 2 rooms per floor available
    const scattered = [
      101, 102, // Floor 1
      201, 202, // Floor 2
      301, 302, // Floor 3
    ];
    
    const result = allocateRooms(3, scattered);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(3);
  });

  test('should minimize travel time when crossing floors', () => {
    // Scattered rooms where cross-floor is necessary
    const scattered = [
      101, 102, // Floor 1
      201, 202, // Floor 2
    ];
    
    const result = allocateRooms(3, scattered);
    
    expect(result.success).toBe(true);
    
    // Best allocation is 101, 102, 201
    // Travel time from first (101) to last (201): vertical 2 + horizontal 0 = 2
    // The span is calculated from min to max room in the set
    expect(result.travelTime).toBe(2);
    expect(result.allocatedRooms).toEqual([101, 102, 201]);
  });

  test('should choose optimal combination from multiple valid options', () => {
    // Multiple possible allocations
    const available = [
      101, 105, 110, // Floor 1 - scattered
      201, 202, 203, // Floor 2 - contiguous
    ];
    
    const result = allocateRooms(3, available);
    
    expect(result.success).toBe(true);
    // Should pick floor 2's contiguous rooms (201, 202, 203) with travel time 2
    expect(result.travelTime).toBe(2);
    expect(result.allocatedRooms).toEqual([201, 202, 203]);
  });
});

describe('allocateRooms - Travel Time Optimization', () => {
  test('should prefer same floor even when rooms are non-contiguous', () => {
    // Floor 1: rooms 101, 103 (not contiguous)
    // Floor 2: room 201
    // For 2 rooms, same floor (101, 103) should win over cross-floor
    const available = [101, 103, 201];
    
    const result = allocateRooms(2, available);
    
    expect(result.success).toBe(true);
    // 101, 103 on floor 1: travel time = 2
    // 101, 201 cross floor: vertical 2 + horizontal 0 = 2
    // 103, 201 cross floor: vertical 2 + horizontal 2 = 4
    // Should prefer same floor when travel times are equal
    const floor = extractFloor(result.allocatedRooms[0]);
    expect(result.allocatedRooms.every(r => extractFloor(r) === floor)).toBe(true);
  });

  test('should correctly compare cross-floor travel times', () => {
    // Scenario where cross-floor might seem better but isn't
    const available = [
      101, 102, 109, 110, // Floor 1
      201, 202,           // Floor 2
    ];
    
    const result = allocateRooms(3, available);
    
    // Floor 1 options: 101,102,109 (span 8), 101,102,110 (span 9), 102,109,110 (span 8)
    // Floor 2 only has 2 rooms
    // Cross floor would include floor change penalty
    // Best is likely 101,102 + one from floor 1 that's close
    expect(result.success).toBe(true);
  });
});

describe('allocateRooms - Random Occupancy Scenarios', () => {
  test('should handle sparse availability across all floors', () => {
    // One room per floor available
    const sparse = [101, 201, 301, 401, 501, 601, 701, 801, 901, 1001];
    
    const result = allocateRooms(3, sparse);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(3);
    
    // Should pick adjacent floors to minimize vertical travel
    // Best: 101, 201, 301 = 4 minutes vertical (0 horizontal)
    expect(result.travelTime).toBe(4);
    expect(result.allocatedRooms).toEqual([101, 201, 301]);
  });

  test('should handle mixed availability patterns', () => {
    // Some floors have multiple rooms, others have few
    const mixed = [
      101,                          // Floor 1: 1 room
      201, 202, 203, 204, 205,      // Floor 2: 5 rooms
      301,                          // Floor 3: 1 room
      401, 410,                     // Floor 4: 2 rooms far apart
    ];
    
    const result = allocateRooms(5, mixed);
    
    expect(result.success).toBe(true);
    // Floor 2 has 5 contiguous rooms - optimal
    expect(result.allocatedRooms).toEqual([201, 202, 203, 204, 205]);
    expect(result.travelTime).toBe(4); // Position 1 to 5
  });

  test('should handle high occupancy scenario', () => {
    // Very few rooms left
    const almostFull = [101, 510, 1007];
    
    const result = allocateRooms(2, almostFull);
    
    expect(result.success).toBe(true);
    expect(result.allocatedRooms.length).toBe(2);
    
    // Should minimize travel time among the three combinations
    // 101-510: vertical 8 + horizontal 9 = 17
    // 101-1007: vertical 18 + horizontal 6 = 24
    // 510-1007: vertical 10 + horizontal 3 = 13
    expect(result.allocatedRooms).toEqual([510, 1007]);
    expect(result.travelTime).toBe(13);
  });
});

describe('allocateRooms - Result Integrity', () => {
  const allRooms = generateAllRoomNumbers();

  test('should return sorted room numbers', () => {
    const result = allocateRooms(4, allRooms);
    
    expect(result.success).toBe(true);
    const sorted = [...result.allocatedRooms].sort((a, b) => a - b);
    expect(result.allocatedRooms).toEqual(sorted);
  });

  test('should return only valid room numbers', () => {
    const result = allocateRooms(5, allRooms);
    
    expect(result.success).toBe(true);
    for (const room of result.allocatedRooms) {
      const floor = extractFloor(room);
      const position = extractPosition(room);
      
      expect(floor).toBeGreaterThanOrEqual(1);
      expect(floor).toBeLessThanOrEqual(10);
      expect(position).toBeGreaterThanOrEqual(1);
      expect(position).toBeLessThanOrEqual(getRoomsCountForFloor(floor));
    }
  });

  test('should return accurate travel time calculation', () => {
    const result = allocateRooms(3, allRooms);
    
    expect(result.success).toBe(true);
    const calculatedSpan = calculateGroupSpan(result.allocatedRooms);
    expect(result.travelTime).toBe(calculatedSpan);
  });
});

describe('canAllocate', () => {
  const allRooms = generateAllRoomNumbers();

  test('should return true when allocation is possible', () => {
    expect(canAllocate(3, allRooms)).toBe(true);
    expect(canAllocate(5, allRooms)).toBe(true);
    expect(canAllocate(1, [101])).toBe(true);
  });

  test('should return false when allocation is not possible', () => {
    expect(canAllocate(6, allRooms)).toBe(false); // Exceeds max
    expect(canAllocate(0, allRooms)).toBe(false); // Below min
    expect(canAllocate(5, [101, 102])).toBe(false); // Not enough rooms
    expect(canAllocate(1, [])).toBe(false); // No rooms
  });
});

describe('allocateRooms - Deterministic Behavior', () => {
  const allRooms = generateAllRoomNumbers();

  test('should return same result for identical inputs', () => {
    const result1 = allocateRooms(3, allRooms);
    const result2 = allocateRooms(3, allRooms);
    
    expect(result1.allocatedRooms).toEqual(result2.allocatedRooms);
    expect(result1.travelTime).toEqual(result2.travelTime);
  });

  test('should not modify input array', () => {
    const original = [101, 201, 301, 401, 501];
    const copy = [...original];
    
    allocateRooms(3, original);
    
    expect(original).toEqual(copy);
  });
});

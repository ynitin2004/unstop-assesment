/**
 * Unit tests for travel time calculation functions
 */

import {
  calculateHorizontalTime,
  calculateVerticalTime,
  calculateTravelTime,
  calculateTotalTravelTimeForRooms,
  calculateGroupSpan,
} from '../travelTime';

describe('calculateHorizontalTime', () => {
  test('should return 0 for same position', () => {
    expect(calculateHorizontalTime(1, 1)).toBe(0);
    expect(calculateHorizontalTime(5, 5)).toBe(0);
  });

  test('should calculate time for adjacent rooms', () => {
    expect(calculateHorizontalTime(1, 2)).toBe(1);
    expect(calculateHorizontalTime(5, 6)).toBe(1);
  });

  test('should calculate time for distant rooms', () => {
    expect(calculateHorizontalTime(1, 10)).toBe(9);
    expect(calculateHorizontalTime(3, 8)).toBe(5);
  });

  test('should handle reverse direction', () => {
    expect(calculateHorizontalTime(10, 1)).toBe(9);
    expect(calculateHorizontalTime(8, 3)).toBe(5);
  });
});

describe('calculateVerticalTime', () => {
  test('should return 0 for same floor', () => {
    expect(calculateVerticalTime(1, 1)).toBe(0);
    expect(calculateVerticalTime(5, 5)).toBe(0);
  });

  test('should calculate time for adjacent floors', () => {
    // 2 minutes per floor
    expect(calculateVerticalTime(1, 2)).toBe(2);
    expect(calculateVerticalTime(5, 6)).toBe(2);
  });

  test('should calculate time for distant floors', () => {
    // Floor 1 to Floor 10 = 9 floors × 2 minutes = 18 minutes
    expect(calculateVerticalTime(1, 10)).toBe(18);
    expect(calculateVerticalTime(3, 7)).toBe(8);
  });

  test('should handle reverse direction', () => {
    expect(calculateVerticalTime(10, 1)).toBe(18);
    expect(calculateVerticalTime(7, 3)).toBe(8);
  });
});

describe('calculateTravelTime', () => {
  describe('valid room inputs', () => {
    test('should return 0 for same room', () => {
      const result = calculateTravelTime(101, 101);
      
      expect(result.isValid).toBe(true);
      expect(result.totalMinutes).toBe(0);
      expect(result.horizontalMinutes).toBe(0);
      expect(result.verticalMinutes).toBe(0);
    });

    test('should calculate horizontal-only travel on same floor', () => {
      const result = calculateTravelTime(101, 105);
      
      expect(result.isValid).toBe(true);
      expect(result.totalMinutes).toBe(4);
      expect(result.horizontalMinutes).toBe(4);
      expect(result.verticalMinutes).toBe(0);
    });

    test('should calculate vertical-only travel for same position different floors', () => {
      const result = calculateTravelTime(101, 301);
      
      expect(result.isValid).toBe(true);
      expect(result.totalMinutes).toBe(4); // 2 floors × 2 minutes
      expect(result.horizontalMinutes).toBe(0);
      expect(result.verticalMinutes).toBe(4);
    });

    test('should calculate combined travel for cross-floor diagonal', () => {
      // Room 101 to Room 305
      // Vertical: 2 floors × 2 = 4 minutes
      // Horizontal: 4 positions × 1 = 4 minutes
      // Total: 8 minutes
      const result = calculateTravelTime(101, 305);
      
      expect(result.isValid).toBe(true);
      expect(result.totalMinutes).toBe(8);
      expect(result.horizontalMinutes).toBe(4);
      expect(result.verticalMinutes).toBe(4);
    });

    test('should handle floor 10 rooms correctly', () => {
      const result = calculateTravelTime(901, 1007);
      
      // Vertical: 1 floor × 2 = 2 minutes
      // Horizontal: 6 positions × 1 = 6 minutes
      // Total: 8 minutes
      expect(result.isValid).toBe(true);
      expect(result.totalMinutes).toBe(8);
    });
  });

  describe('invalid room inputs', () => {
    test('should reject invalid first room', () => {
      const result = calculateTravelTime(99, 101);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('99');
    });

    test('should reject invalid second room', () => {
      const result = calculateTravelTime(101, 1008);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('1008');
    });

    test('should reject non-existent floor 11', () => {
      const result = calculateTravelTime(101, 1101);
      
      expect(result.isValid).toBe(false);
    });
  });
});

describe('calculateTotalTravelTimeForRooms', () => {
  test('should return 0 for empty array', () => {
    const result = calculateTotalTravelTimeForRooms([]);
    
    expect(result.isValid).toBe(true);
    expect(result.totalMinutes).toBe(0);
  });

  test('should return 0 for single room', () => {
    const result = calculateTotalTravelTimeForRooms([101]);
    
    expect(result.isValid).toBe(true);
    expect(result.totalMinutes).toBe(0);
  });

  test('should calculate time from first to last room in sorted order', () => {
    // Rooms 101, 102, 103 on same floor
    const result = calculateTotalTravelTimeForRooms([101, 102, 103]);
    
    expect(result.isValid).toBe(true);
    expect(result.totalMinutes).toBe(2); // Position 1 to 3 = 2 minutes
  });

  test('should handle unsorted input by sorting internally', () => {
    const result = calculateTotalTravelTimeForRooms([103, 101, 102]);
    
    expect(result.isValid).toBe(true);
    expect(result.totalMinutes).toBe(2);
  });

  test('should calculate cross-floor travel correctly', () => {
    // Rooms 101 and 201
    const result = calculateTotalTravelTimeForRooms([101, 201]);
    
    expect(result.isValid).toBe(true);
    expect(result.totalMinutes).toBe(2); // Same position, 1 floor = 2 minutes
  });

  test('should reject if any room is invalid', () => {
    const result = calculateTotalTravelTimeForRooms([101, 1008, 201]);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('1008');
  });
});

describe('calculateGroupSpan', () => {
  test('should return 0 for empty or single room', () => {
    expect(calculateGroupSpan([])).toBe(0);
    expect(calculateGroupSpan([101])).toBe(0);
  });

  test('should return total travel time for valid rooms', () => {
    expect(calculateGroupSpan([101, 102, 103])).toBe(2);
    expect(calculateGroupSpan([101, 110])).toBe(9);
  });

  test('should return Infinity for invalid rooms', () => {
    expect(calculateGroupSpan([101, 1008])).toBe(Infinity);
  });
});

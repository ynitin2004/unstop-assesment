/**
 * Unit tests for room utility functions
 */

import {
  extractFloor,
  extractPosition,
  isValidRoomNumber,
  createRoomNumber,
  getRoomsOnFloor,
  sortRoomNumbers,
} from '../roomUtils';

describe('extractFloor', () => {
  test('should extract floor from single-digit floor rooms', () => {
    expect(extractFloor(101)).toBe(1);
    expect(extractFloor(210)).toBe(2);
    expect(extractFloor(505)).toBe(5);
    expect(extractFloor(901)).toBe(9);
  });

  test('should extract floor from double-digit floor rooms', () => {
    expect(extractFloor(1001)).toBe(10);
    expect(extractFloor(1007)).toBe(10);
  });
});

describe('extractPosition', () => {
  test('should extract position from room number', () => {
    expect(extractPosition(101)).toBe(1);
    expect(extractPosition(105)).toBe(5);
    expect(extractPosition(110)).toBe(10);
    expect(extractPosition(1007)).toBe(7);
  });
});

describe('isValidRoomNumber', () => {
  describe('valid room numbers', () => {
    test('should accept rooms on floor 1', () => {
      for (let pos = 1; pos <= 10; pos++) {
        expect(isValidRoomNumber(100 + pos)).toBe(true);
      }
    });

    test('should accept rooms on floors 2-9', () => {
      expect(isValidRoomNumber(201)).toBe(true);
      expect(isValidRoomNumber(510)).toBe(true);
      expect(isValidRoomNumber(903)).toBe(true);
    });

    test('should accept rooms on floor 10 (1001-1007 only)', () => {
      for (let pos = 1; pos <= 7; pos++) {
        expect(isValidRoomNumber(1000 + pos)).toBe(true);
      }
    });
  });

  describe('invalid room numbers', () => {
    test('should reject non-integer inputs', () => {
      expect(isValidRoomNumber(101.5)).toBe(false);
      expect(isValidRoomNumber(NaN)).toBe(false);
    });

    test('should reject rooms below floor 1', () => {
      expect(isValidRoomNumber(1)).toBe(false);
      expect(isValidRoomNumber(99)).toBe(false);
    });

    test('should reject position 0 on any floor', () => {
      expect(isValidRoomNumber(100)).toBe(false);
      expect(isValidRoomNumber(500)).toBe(false);
      expect(isValidRoomNumber(1000)).toBe(false);
    });

    test('should reject positions > 10 on floors 1-9', () => {
      expect(isValidRoomNumber(111)).toBe(false);
      expect(isValidRoomNumber(520)).toBe(false);
    });

    test('should reject positions > 7 on floor 10', () => {
      expect(isValidRoomNumber(1008)).toBe(false);
      expect(isValidRoomNumber(1009)).toBe(false);
      expect(isValidRoomNumber(1010)).toBe(false);
    });

    test('should reject rooms above floor 10', () => {
      expect(isValidRoomNumber(1101)).toBe(false);
      expect(isValidRoomNumber(2001)).toBe(false);
    });

    test('should reject negative room numbers', () => {
      expect(isValidRoomNumber(-101)).toBe(false);
    });
  });
});

describe('createRoomNumber', () => {
  test('should create correct room numbers from floor and position', () => {
    expect(createRoomNumber(1, 1)).toBe(101);
    expect(createRoomNumber(1, 10)).toBe(110);
    expect(createRoomNumber(5, 5)).toBe(505);
    expect(createRoomNumber(10, 7)).toBe(1007);
  });
});

describe('getRoomsOnFloor', () => {
  test('should return all 10 rooms for floors 1-9', () => {
    const floor3Rooms = getRoomsOnFloor(3);
    expect(floor3Rooms).toEqual([301, 302, 303, 304, 305, 306, 307, 308, 309, 310]);
  });

  test('should return only 7 rooms for floor 10', () => {
    const floor10Rooms = getRoomsOnFloor(10);
    expect(floor10Rooms).toEqual([1001, 1002, 1003, 1004, 1005, 1006, 1007]);
  });

  test('should return empty array for invalid floors', () => {
    expect(getRoomsOnFloor(0)).toEqual([]);
    expect(getRoomsOnFloor(11)).toEqual([]);
  });
});

describe('sortRoomNumbers', () => {
  test('should sort rooms by floor first, then position', () => {
    const unsorted = [305, 101, 1003, 102, 305, 201];
    const sorted = sortRoomNumbers(unsorted);
    
    expect(sorted).toEqual([101, 102, 201, 305, 305, 1003]);
  });

  test('should not mutate original array', () => {
    const original = [305, 101, 201];
    const originalCopy = [...original];
    
    sortRoomNumbers(original);
    
    expect(original).toEqual(originalCopy);
  });

  test('should handle empty array', () => {
    expect(sortRoomNumbers([])).toEqual([]);
  });

  test('should handle single room', () => {
    expect(sortRoomNumbers([505])).toEqual([505]);
  });
});

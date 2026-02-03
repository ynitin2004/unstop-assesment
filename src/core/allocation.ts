/**
 * Room allocation algorithm
 * 
 * Strategy:
 * 1. Try to find contiguous rooms on a single floor (best case)
 * 2. If not possible, find the combination across floors that minimizes travel time
 * 
 * The algorithm prioritizes:
 * - Same floor allocation (horizontal movement is cheaper)
 * - Lower total travel time between first and last room
 * - Room proximity to stairs/lift (lower room numbers preferred as tiebreaker)
 */

import { HOTEL_CONFIG, getRoomsCountForFloor } from './constants';
import { extractFloor, extractPosition, createRoomNumber, sortRoomNumbers } from './roomUtils';
import { calculateGroupSpan } from './travelTime';

/**
 * Allocation result returned by the booking algorithm
 */
export interface AllocationResult {
  success: boolean;
  allocatedRooms: number[];
  travelTime: number;
  errorMessage?: string;
}

/**
 * Validate booking request parameters
 */
function validateBookingRequest(
  requestedRooms: number,
  availableRooms: number[]
): { isValid: boolean; error?: string } {
  // Check if requested rooms is a valid number
  if (!Number.isInteger(requestedRooms)) {
    return { isValid: false, error: 'Number of rooms must be an integer' };
  }
  
  // Check minimum constraint
  if (requestedRooms < HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING) {
    return { 
      isValid: false, 
      error: `Minimum ${HOTEL_CONFIG.MIN_ROOMS_PER_BOOKING} room(s) required per booking` 
    };
  }
  
  // Check maximum constraint
  if (requestedRooms > HOTEL_CONFIG.MAX_ROOMS_PER_BOOKING) {
    return { 
      isValid: false, 
      error: `Maximum ${HOTEL_CONFIG.MAX_ROOMS_PER_BOOKING} rooms allowed per booking` 
    };
  }
  
  // Check availability
  if (availableRooms.length < requestedRooms) {
    return { 
      isValid: false, 
      error: `Not enough rooms available. Requested: ${requestedRooms}, Available: ${availableRooms.length}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Group available rooms by floor for efficient lookup
 */
function groupRoomsByFloor(rooms: number[]): Map<number, number[]> {
  const floorMap = new Map<number, number[]>();
  
  for (const room of rooms) {
    const floor = extractFloor(room);
    
    if (!floorMap.has(floor)) {
      floorMap.set(floor, []);
    }
    
    floorMap.get(floor)!.push(room);
  }
  
  // Sort rooms within each floor by position
  for (const [floor, roomList] of floorMap) {
    roomList.sort((a, b) => extractPosition(a) - extractPosition(b));
  }
  
  return floorMap;
}

/**
 * Find best contiguous block of rooms on a single floor
 * Returns the block with minimum span (rooms closest together)
 */
function findBestContiguousBlock(
  floorRooms: number[],
  count: number
): number[] | null {
  if (floorRooms.length < count) {
    return null;
  }
  
  // Sort by position to find contiguous groups
  const sorted = [...floorRooms].sort((a, b) => 
    extractPosition(a) - extractPosition(b)
  );
  
  let bestBlock: number[] | null = null;
  let bestSpan = Infinity;
  
  // Sliding window to find contiguous blocks
  for (let i = 0; i <= sorted.length - count; i++) {
    const block = sorted.slice(i, i + count);
    
    // Check if truly contiguous (consecutive positions)
    let isContiguous = true;
    for (let j = 1; j < block.length; j++) {
      if (extractPosition(block[j]) - extractPosition(block[j - 1]) !== 1) {
        isContiguous = false;
        break;
      }
    }
    
    if (isContiguous) {
      const span = calculateGroupSpan(block);
      
      // Prefer lower room numbers as tiebreaker (closer to entrance)
      if (span < bestSpan || (span === bestSpan && bestBlock && block[0] < bestBlock[0])) {
        bestSpan = span;
        bestBlock = block;
      }
    }
  }
  
  return bestBlock;
}

/**
 * Find best non-contiguous block on a single floor
 * When contiguous isn't available, pick rooms with minimum spread
 */
function findBestSameFloorBlock(
  floorRooms: number[],
  count: number
): number[] | null {
  if (floorRooms.length < count) {
    return null;
  }
  
  // First try to find contiguous rooms
  const contiguous = findBestContiguousBlock(floorRooms, count);
  if (contiguous) {
    return contiguous;
  }
  
  // If no contiguous block, find the combination with minimum span
  const sorted = [...floorRooms].sort((a, b) => 
    extractPosition(a) - extractPosition(b)
  );
  
  let bestCombination: number[] | null = null;
  let bestSpan = Infinity;
  
  // Generate combinations using sliding window approach
  // For small counts (max 5), this is efficient
  for (let i = 0; i <= sorted.length - count; i++) {
    const combination = sorted.slice(i, i + count);
    const span = calculateGroupSpan(combination);
    
    if (span < bestSpan || (span === bestSpan && bestCombination && combination[0] < bestCombination[0])) {
      bestSpan = span;
      bestCombination = combination;
    }
  }
  
  return bestCombination;
}

/**
 * Generate all possible combinations of selecting 'count' items from 'items'
 * Uses iterative approach for clarity
 */
function generateCombinations<T>(items: T[], count: number): T[][] {
  if (count === 0) return [[]];
  if (items.length < count) return [];
  if (items.length === count) return [items];
  
  const results: T[][] = [];
  
  // Recursive helper with indices to avoid duplicates
  function combine(start: number, current: T[]): void {
    if (current.length === count) {
      results.push([...current]);
      return;
    }
    
    // Pruning: not enough elements remaining
    const remaining = items.length - start;
    const needed = count - current.length;
    if (remaining < needed) return;
    
    for (let i = start; i < items.length; i++) {
      current.push(items[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  
  combine(0, []);
  return results;
}

/**
 * Find best allocation across multiple floors
 * This is used when single-floor allocation isn't possible
 */
function findBestCrossFloorAllocation(
  availableRooms: number[],
  count: number
): number[] | null {
  // For cross-floor, we need to check combinations
  // Since max is 5 rooms, this is manageable
  
  if (availableRooms.length < count) {
    return null;
  }
  
  // Sort all rooms for consistent ordering
  const sorted = sortRoomNumbers(availableRooms);
  
  let bestAllocation: number[] | null = null;
  let bestTravelTime = Infinity;
  
  // Generate and evaluate all combinations
  const combinations = generateCombinations(sorted, count);
  
  for (const combo of combinations) {
    const travelTime = calculateGroupSpan(combo);
    
    // Check if this is better
    // Tiebreaker: prefer lower starting room number
    if (travelTime < bestTravelTime) {
      bestTravelTime = travelTime;
      bestAllocation = combo;
    } else if (travelTime === bestTravelTime && bestAllocation) {
      // Tiebreaker: prefer allocation starting from lower floor/position
      if (combo[0] < bestAllocation[0]) {
        bestAllocation = combo;
      }
    }
  }
  
  return bestAllocation;
}

/**
 * Main allocation function
 * 
 * Algorithm:
 * 1. Validate the request
 * 2. Try to find rooms on a single floor (prioritized)
 * 3. If single floor not possible, find optimal cross-floor allocation
 * 4. Return the best allocation with travel time
 */
export function allocateRooms(
  requestedRooms: number,
  availableRooms: number[]
): AllocationResult {
  // Step 1: Validate the request
  const validation = validateBookingRequest(requestedRooms, availableRooms);
  
  if (!validation.isValid) {
    return {
      success: false,
      allocatedRooms: [],
      travelTime: 0,
      errorMessage: validation.error,
    };
  }
  
  // Step 2: Group rooms by floor
  const roomsByFloor = groupRoomsByFloor(availableRooms);
  
  // Step 3: Try to find best single-floor allocation
  let bestSingleFloorAllocation: number[] | null = null;
  let bestSingleFloorTravelTime = Infinity;
  let bestFloor = 0;
  
  for (let floor = 1; floor <= HOTEL_CONFIG.TOTAL_FLOORS; floor++) {
    const floorRooms = roomsByFloor.get(floor) || [];
    
    if (floorRooms.length >= requestedRooms) {
      const allocation = findBestSameFloorBlock(floorRooms, requestedRooms);
      
      if (allocation) {
        const travelTime = calculateGroupSpan(allocation);
        
        // Same floor always has horizontal-only travel
        // Prefer lower floors as tiebreaker
        if (travelTime < bestSingleFloorTravelTime || 
            (travelTime === bestSingleFloorTravelTime && floor < bestFloor)) {
          bestSingleFloorTravelTime = travelTime;
          bestSingleFloorAllocation = allocation;
          bestFloor = floor;
        }
      }
    }
  }
  
  // Step 4: If single floor allocation found, compare with cross-floor
  // Single floor is always preferred if it exists with same or better travel time
  if (bestSingleFloorAllocation) {
    return {
      success: true,
      allocatedRooms: sortRoomNumbers(bestSingleFloorAllocation),
      travelTime: bestSingleFloorTravelTime,
    };
  }
  
  // Step 5: No single floor option, find best cross-floor allocation
  const crossFloorAllocation = findBestCrossFloorAllocation(availableRooms, requestedRooms);
  
  if (crossFloorAllocation) {
    return {
      success: true,
      allocatedRooms: sortRoomNumbers(crossFloorAllocation),
      travelTime: calculateGroupSpan(crossFloorAllocation),
    };
  }
  
  // Should not reach here if validation passed
  return {
    success: false,
    allocatedRooms: [],
    travelTime: 0,
    errorMessage: 'Unable to allocate rooms',
  };
}

/**
 * Check if requested rooms can be allocated
 * Useful for UI to show availability before booking
 */
export function canAllocate(
  requestedRooms: number,
  availableRooms: number[]
): boolean {
  const result = allocateRooms(requestedRooms, availableRooms);
  return result.success;
}

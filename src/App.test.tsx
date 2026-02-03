import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Hotel Reservation App', () => {
  test('renders application header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Hotel Room Reservation System/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders booking controls', () => {
    render(<App />);
    expect(screen.getByText(/Number of Rooms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Book/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Occupy/i })).toBeInTheDocument();
  });

  test('renders room statistics', () => {
    render(<App />);
    // Both Total and Available show 97 initially, so use getAllByText
    const elements97 = screen.getAllByText('97');
    expect(elements97.length).toBeGreaterThanOrEqual(1);
    // "Available" and "Booked" appear in both stats and legend, use getAllByText
    expect(screen.getAllByText('Available').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Booked').length).toBeGreaterThanOrEqual(1);
  });

  test('renders hotel grid with floors', () => {
    render(<App />);
    // Check for floor labels
    expect(screen.getByText('F1')).toBeInTheDocument();
    expect(screen.getByText('F10')).toBeInTheDocument();
  });

  test('booking button updates based on input', () => {
    render(<App />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '3' } });
    
    expect(screen.getByRole('button', { name: /Book 3 Rooms/i })).toBeInTheDocument();
  });
});

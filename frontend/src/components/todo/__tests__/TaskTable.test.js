import React from 'react';
import { screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import axios from 'axios';
import TaskTable from '../TaskTable';
import { renderWithProviders, mockAuth, mockTasks } from '../../../utils/test-utils';

jest.mock('axios');

const renderTaskTable = () => {
  axios.get.mockResolvedValue({ data: mockTasks });
  return renderWithProviders(<TaskTable />);
};

describe('TaskTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task table with correct headers', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('renders tasks with correct data', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 2')).toBeInTheDocument();
    });
  });

  it('handles task input change correctly', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });

    const taskInput = screen.getByDisplayValue('Test Task 1');
    await act(async () => {
      fireEvent.change(taskInput, { target: { value: 'Updated Task 1' } });
    });
    expect(taskInput).toHaveValue('Updated Task 1');
  });

  it('handles date change correctly', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });

    const dateInput = screen.getByDisplayValue('2024-03-20');
    await act(async () => {
      fireEvent.change(dateInput, { target: { value: '2024-03-22' } });
    });
    expect(dateInput).toHaveValue('2024-03-22');
  });

  it('renders checkboxes for each task and reflects completed state', async () => {
    // --- Mock Data ---
    axios.get.mockResolvedValue({ data: [
      { id: 1, task: 'Test Task 1', dueDate: '2024-03-20', completed: false },
      { id: 2, task: 'Test Task 2', dueDate: '2024-03-21', completed: true }
    ] });
  
    // --- Render & Wait ---
    renderWithProviders(<TaskTable />);
    await waitFor(() => {
      // Wait for a specific piece of data to appear to ensure rendering is complete
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });
  
    // --- Assertions ---
    // Test the first task's row specifically
    const row1 = screen.getByDisplayValue('Test Task 1').closest('tr');
    const checkbox1 = within(row1).getByRole('checkbox');
    expect(checkbox1).not.toBeChecked();
  
    // Test the second task's row specifically
    const row2 = screen.getByDisplayValue('Test Task 2').closest('tr');
    const checkbox2 = within(row2).getByRole('checkbox');
    expect(checkbox2).toBeChecked();
  });
  
  it('toggles checkbox and calls axios.put with updated completed value', async () => {
    // --- Mock Data ---
    axios.get.mockResolvedValue({ data: [
      { id: 1, task: 'Test Task 1', dueDate: '2024-03-20', completed: false }
    ] });
    axios.put.mockResolvedValue({ data: { id: 1, task: 'Test Task 1', dueDate: '2024-03-20', completed: true } });
  
    // --- Render & Wait ---
    renderWithProviders(<TaskTable />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });
  
    // --- Find Elements in the Correct Row ---
    const taskInput = screen.getByDisplayValue('Test Task 1');
    const row = taskInput.closest('tr');
    const checkbox = within(row).getByRole('checkbox');
    
    // --- Initial State Assertion ---
    expect(checkbox).not.toBeChecked();
  
    // --- Fire Event ---
    await act(async () => {
      fireEvent.click(checkbox);
    });
  
    // --- Final State Assertions ---
    expect(checkbox).toBeChecked();
    
    // Assert that axios.put was called with the correct INDEX, not the ID.
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/0'), // Correctly expects the array index '0'
      expect.objectContaining({ completed: true }),
      expect.any(Object)
    );
  });
}); 
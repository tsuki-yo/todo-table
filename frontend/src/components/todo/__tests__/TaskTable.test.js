import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('handles task input change correctly', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const taskInput = screen.getByDisplayValue('Test Task 1');
    fireEvent.change(taskInput, { target: { value: 'Updated Task 1' } });
    expect(taskInput).toHaveValue('Updated Task 1');
  });

  it('handles date change correctly', async () => {
    renderTaskTable();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getAllByRole('date')[0]).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[1];
    fireEvent.click(editButton);

    const dateInput = screen.getAllByRole('date')[1];
    fireEvent.change(dateInput, { target: { value: '2024-03-22' } });
    expect(dateInput).toHaveValue('2024-03-22');
  });
}); 
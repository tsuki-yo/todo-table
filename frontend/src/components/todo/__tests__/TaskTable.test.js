import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTable from '../TaskTable';

const mockTasks = [
  {
    id: 1,
    task: 'Test Task 1',
    dueDate: '2024-03-20'
  },
  {
    id: 2,
    task: 'Test Task 2',
    dueDate: '2024-03-21'
  }
];

const renderTaskTable = () => {
  return render(<TaskTable tasks={mockTasks} />);
};

describe('TaskTable', () => {
  it('renders task table with correct headers', () => {
    renderTaskTable();
    
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('renders tasks with correct data', () => {
    renderTaskTable();
    
    expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task 2')).toBeInTheDocument();
  });

  it('handles task input change correctly', () => {
    renderTaskTable();
    
    const taskInput = screen.getByDisplayValue('Test Task 1');
    fireEvent.change(taskInput, { target: { value: 'Updated Task 1' } });
    expect(taskInput).toHaveValue('Updated Task 1');
  });

  it('handles date change correctly', () => {
    renderTaskTable();
    
    const dateInput = screen.getAllByRole('textbox')[1];
    fireEvent.change(dateInput, { target: { value: '2024-03-22' } });
    expect(dateInput).toHaveValue('2024-03-22');
  });
}); 
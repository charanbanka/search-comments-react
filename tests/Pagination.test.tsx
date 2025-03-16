import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import Pagination from '../src/components/pagination'; // Adjust the import path as needed

describe('Pagination Component', () => {
  const mockOnNextPage = vi.fn();

  // Helper function to render the component with default props
  const renderPagination = (props = {}) => {
    return render(
      <Pagination
        totalCount={110} // 11 pages with 10 items per page
        itemsPerPage={10}
        currentPage={1}
        onNextPage={mockOnNextPage}
        {...props}
      />
    );
  };

  beforeEach(() => {
    mockOnNextPage.mockClear();
  });

  // Test 1: Renders correctly with initial props
  it('renders Prev, Next, and page numbers correctly on page 1', () => {
    renderPagination({ currentPage: 1 });

    expect(screen.getByText('Prev')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
    expect(screen.getByText('1')).toHaveClass('active');
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  // Test 2: Renders middle page correctly
  it('renders page numbers with ellipses for a middle page', () => {
    renderPagination({ currentPage: 6 });

    expect(screen.getByText('Prev')).not.toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toHaveClass('active');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  // Test 3: Renders last page correctly
  it('renders page numbers for the last page', () => {
    renderPagination({ currentPage: 11 });

    expect(screen.getByText('Prev')).not.toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('11')).toHaveClass('active');
  });

  // Test 4: Renders all pages when totalPages <= 5
  it('renders all pages when total pages are 5 or fewer', () => {
    renderPagination({ totalCount: 50, itemsPerPage: 10, currentPage: 3 }); // 5 pages

    expect(screen.getByText('Prev')).not.toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('active');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  // Test 5: Calls onNextPage when clicking Next
  it('calls onNextPage with next page when Next is clicked', () => {
    renderPagination({ currentPage: 1 });

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnNextPage).toHaveBeenCalledWith(2);
    expect(mockOnNextPage).toHaveBeenCalledTimes(1);
  });

  // Test 6: Calls onNextPage when clicking Prev
  it('calls onNextPage with previous page when Prev is clicked', () => {
    renderPagination({ currentPage: 2 });

    fireEvent.click(screen.getByText('Prev'));
    expect(mockOnNextPage).toHaveBeenCalledWith(1);
    expect(mockOnNextPage).toHaveBeenCalledTimes(1);
  });

  // Test 7: Does not call onNextPage when Prev is disabled
  it('does not call onNextPage when Prev is clicked on page 1', () => {
    renderPagination({ currentPage: 1 });

    fireEvent.click(screen.getByText('Prev'));
    expect(mockOnNextPage).not.toHaveBeenCalled();
  });

  // Test 8: Does not call onNextPage when Next is disabled
  it('does not call onNextPage when Next is clicked on last page', () => {
    renderPagination({ currentPage: 11 });

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnNextPage).not.toHaveBeenCalled();
  });

  // Test 9: Calls onNextPage when clicking a page number
  it('calls onNextPage when a page number is clicked', () => {
    renderPagination({ currentPage: 1 });

    fireEvent.click(screen.getByText('2'));
    expect(mockOnNextPage).toHaveBeenCalledWith(2);
    expect(mockOnNextPage).toHaveBeenCalledTimes(1);
  });

  // Test 10: Handles edge case with single page
  it('renders only one page and disables both buttons when totalCount <= itemsPerPage', () => {
    renderPagination({ totalCount: 5, itemsPerPage: 10, currentPage: 1 });

    expect(screen.getByText('Prev')).toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText('1')).toHaveClass('active');
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});
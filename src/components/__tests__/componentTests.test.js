import React from 'react';
import { render } from '@testing-library/react';
import { toHaveStyle } from '@testing-library/jest-dom';
import ObContainer from '../ObContainer';
import OrderRow from '../OrderRow';
import OrderList from '../OrderList';

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
        });
  });

test('render without crashing', () => {
  const container = render(<ObContainer />);
  const bookElement = container.getByTestId("order-book");
  expect(bookElement).toBeInTheDocument();
});

test('row renders all children styled correctly', () => {
    const obRow = render(<OrderRow isMobile={false} price={49000} size={2500} total={5000} visualizerPercentage={42} orderType="ask" />);
    const priceElement = obRow.getByText(/49,000.00/i);
    const visualizerElement = obRow.getByTestId("visualizer");
    expect(priceElement).toHaveStyle("color: rgb(255, 90, 90)");
    expect(visualizerElement).toHaveStyle("background: rgb(255, 90, 90)");
    expect(visualizerElement).toHaveStyle("width: 42%");
});


test('list renders all rows', () => {
    const testAsks = [[49000.50, 100, 100, 10],[49100.00, 100, 200, 20],[49300.10, 100, 300, 30],[49300.10, 100, 400, 60]];
    const obList = render(<OrderList isMobile={false} orders={testAsks} orderType="ask" />);
    const listRows = obList.getAllByTestId("order-row");    
    expect(listRows.length).toBe(4);
});
  
  

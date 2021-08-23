import React from 'react';
import { render } from '@testing-library/react';
import { toHaveStyle } from '@testing-library/jest-dom';
import ObContainer from '../ObContainer';
import OrderRow from '../OrderRow';

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
  render(<ObContainer />);
});

test('row renders all children styled correctly', () => {
    const obRow = render(<OrderRow isMobile={false} price={49000} size={2500} total={5000} visualizerPercentage={42} orderType="ask" />);
    const priceElement = obRow.getByText(/49,000.00/i);
    const visualizerElement = obRow.getByTestId("visualizer");
    expect(priceElement).toHaveStyle("color: rgb(255, 90, 90)");
    expect(visualizerElement).toHaveStyle("background: rgb(255, 90, 90)");
    expect(visualizerElement).toHaveStyle("width: 42%");
  });
  

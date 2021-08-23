
import {calculateOrderTotals, groupOrdersByVal, round} from '../helperFunctions';
import '@testing-library/jest-dom'



test('rounding', async () => {  
 let ethRoundDefault=round(3326.15, 0.05).toFixed(2);
 let ethRound1=round(3326.15, 0.1).toFixed(2);
 let ethRound25=round(3326.15, 0.25).toFixed(2);

 let xbtRoundDefault=round(49671.50, 0.5).toFixed(2);
 let xbtRound1=round(49671.50, 1).toFixed(2);
 let xbtRound25=round(49671.50, 2.5).toFixed(2);
 
  expect(ethRoundDefault).toBe(3326.15.toFixed(2));
  expect(ethRound1).toBe(3326.10.toFixed(2));
  expect(ethRound25).toBe(3326.00.toFixed(2));

  expect(xbtRoundDefault).toBe(49671.50.toFixed(2));
  expect(xbtRound1).toBe(49671.00.toFixed(2));
  expect(xbtRound25).toBe(49670.00.toFixed(2));
})


test('groupOrdersByVal', async () => {  

  let testAsks = [[49000, 1, 0, 0],[49100, 2, 0, 0],[49300, 3, 0, 0]];
  let testBids = [[41000, 4, 0, 0],[42000, 5, 0, 0],[43000, 6, 0, 0]];

  let calcualtedTotals = calculateOrderTotals(testAsks, testBids);

  expect(testAsks[0][2]).toBe(1);
  expect(testAsks[1][2]).toBe(3);
  expect(testAsks[2][2]).toBe(6);
  expect(testBids[0][2]).toBe(4);
  expect(testBids[1][2]).toBe(9);
  expect(testBids[2][2]).toBe(15);
  expect(calcualtedTotals).toBe(15);
 })


 test('calculateOrderTotals', async () => {  

  let testAsks = [[49000.50, 1, 0, 0],[49100.00, 2, 0, 0],[49300.10, 3, 0, 0]];
  let testBids = [[41000.75, 4, 0, 0],[42000.95, 5, 0, 0],[43000.15, 6, 0, 0]];

  let groupedVals = groupOrdersByVal(testAsks, testBids, 2.5);

  let asks = groupedVals.asks;
  let bids = groupedVals.bids;

  expect(asks[0][0]).toBe(49000);
  expect(asks[1][0]).toBe(49100);
  expect(asks[2][0]).toBe(49300);
  expect(bids[0][0]).toBe(41000);
  expect(bids[1][0]).toBe(42000);
  expect(bids[2][0]).toBe(43000);
 })
import { TOrderList } from "../types/types";

//get nearest (round down) group level for a given price
const round = (priceVal: number, groupVal: number) => {
    return (Math.floor(priceVal / groupVal) * groupVal);
}

//iterate bids/asks and group based on groupvalue
const groupOrdersByVal = (asks: TOrderList, bids: TOrderList, groupVal: number) => {
    asks.forEach((ask: number[]) => {

        let currPrice = ask[0];
        let roundedPrice = round(currPrice, groupVal);

        //is our new price already there?
        let existingIdx = asks.findIndex((ask) => ask.includes(roundedPrice));
        let currentIdx = asks.indexOf(ask);

        //already have a grouping there
        if (existingIdx >= 0) {
            //if we're not already at the index
            if (existingIdx !== currentIdx) {
                //add size to the existing one
                asks[existingIdx][1] += ask[1];
                //mark for deletion
                asks[currentIdx].push(-1);
            }
            //else already there, dont need to do anything
        }
        //we don't already have a grouping at this level, make one where we are
        else {
            asks[currentIdx][0] = roundedPrice;
        }
    });

    bids.forEach((bid: number[]) => {

        let currPrice = bid[0];
        let roundedPrice = round(currPrice, groupVal);

        //is our new price already there?
        let existingIdx = bids.findIndex((bid) => bid.includes(roundedPrice));
        let currentIdx = bids.indexOf(bid);

        //already have a grouping there
        if (existingIdx >= 0) {
            //if we're not already at the index
            if (existingIdx !== currentIdx) {
                //add size to the existing one
                bids[existingIdx][1] += bid[1];
                //mark for deletion
                bids[currentIdx].push(-1);
            }

            //else already there, dont need to do anything
        }
        //we don't already have a grouping at this level, make one where we are
        else {
            bids[currentIdx][0] = roundedPrice;
        }
    });

    asks = asks.filter((ask) => !ask.includes(-1));
    bids = bids.filter((bid) => !bid.includes(-1));

    let trimLen = Math.min(asks.length, bids.length, 25);

    asks = asks.slice(0, trimLen);
    bids = bids.slice(0, trimLen);

    return {
        asks: asks,
        bids: bids
    }
}

//add up totals
const calculateOrderTotals = (asks: TOrderList, bids: TOrderList) => {
    let askTotal: number = 0;
    let bidTotal: number = 0;

    asks.forEach((order, index) => {
        askTotal += order[1];
        order[2] = askTotal;
    });

    bids.forEach((order, index) => {
        bidTotal += order[1];
        order[2] = bidTotal;
    });

    return Math.max(askTotal, bidTotal);
}

//take in list of updates and apply them to a given bid/ask list
const updateOrderList = (orderList: TOrderList, updateList: TOrderList) => {
    updateList.forEach((askUpdate: number[]) => {
        //have it already
        let existingEntries = orderList.findIndex((order) => order.includes(askUpdate[0]));

        if (existingEntries >= 0) {
            //delete it
            if (askUpdate[1] === 0) {
                orderList.splice(existingEntries, 1);
            }
            //replace it
            else {
                orderList[existingEntries] = [...askUpdate, -1, -1];
            }
        }
        //new entry, add it
        else {
            if (askUpdate[1] !== 0) {
                orderList.push([...askUpdate, -1, -1]);
            }
        }
    });
}

export { calculateOrderTotals, groupOrdersByVal, round, updateOrderList }
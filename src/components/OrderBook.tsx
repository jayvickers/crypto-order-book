/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { IWssFeedUpdate, IWSSSubscribeEvent, TDataFeed, TOrder, IOrderState, TOrderList, TTickerType } from "../types/types";
import { ethTicker, ethGroupVals, xbtGroupVals, xbtTicker } from '../helpers/consts';
import { calculateOrderTotals, groupOrdersByVal, updateOrderList } from '../helpers/helperFunctions';
import { useMediaQuery } from '../hooks/useMediaQuery';

import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderList from '../components/OrderList';
import '../styles/shared-styles.css';
import rafSchedule from 'raf-schd';

interface IOrderListProps {
  sock: WebSocket;
}

const OrderBook: React.FC<IOrderListProps> = (props: IOrderListProps) => {
  const [group, setGroup] = useState<number>(-1);
  const [ticker, setTicker] = useState(xbtTicker);
  const [orders, setOrders] = useState<IOrderState>({ asks: [], bids: [] });
  const isMobile = useMediaQuery('(max-width: 600px)');
  let updateTime = useRef<Date>(new Date());
  let spread = useRef<string>("");
  const bookDepth = useRef<number>(isMobile ? 16 : 20);


  //calculate totals and visualizer widths for each row
  const fillVisualizersAndTotals = (asks: TOrderList, bids: TOrderList) => {
    const largestTotal: number = calculateOrderTotals(asks, bids);
    calculateVisualizers(asks, largestTotal);
    calculateVisualizers(bids, largestTotal);
  }

  //update bids/asks based on selected group level
  const updateGroup = (groupVal: number) => {
    setOrders((prevOrders: IOrderState) => {
      const groupedOrders: IOrderState = groupOrdersByVal([...prevOrders.asks], [...prevOrders.bids], groupVal);
      fillVisualizersAndTotals(groupedOrders.asks, groupedOrders.bids);
      spread.current = calculateSpread(groupedOrders.asks, groupedOrders.bids);
      return groupedOrders;
    })
  }

  //update bids/asks based on wss feed delta updates
  const updateOrders = (dataAsks: TOrderList, dataBids: TOrderList) => {
    setOrders((prevOrders: IOrderState) => {
      let newAsks: TOrderList = [...prevOrders.asks];
      let newBids: TOrderList = [...prevOrders.bids];

      updateOrderList(newAsks, dataAsks);
      updateOrderList(newBids, dataBids);

      //sort for display
      newAsks.sort((a: number[], b: number[]) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        else return 0;
      });

      newBids.sort((a: number[], b: number[]) => {
        if (a[0] < b[0]) return 1;
        if (a[0] > b[0]) return -1;
        else return 0;
      });

      const trimLen: number = Math.min(newAsks.length, newBids.length, bookDepth.current);

      newAsks = newAsks.slice(0, trimLen);
      newBids = newBids.slice(0, trimLen);

      fillVisualizersAndTotals(newAsks, newBids);
      spread.current = calculateSpread(newAsks, newBids);

      //avoid grouping if we dont have to
      //if group is null that means we havent changed it yet and its filtering by default
      let groupedVals: IOrderState = {
        asks: newAsks,
        bids: newBids
      }

      if (group !== -1) {
        groupedVals = groupOrdersByVal(groupedVals.asks, groupedVals.bids, group);
      }

      const groupedOrderState: IOrderState = {
        asks: groupedVals.asks,
        bids: groupedVals.bids
      }

      return groupedOrderState;
    })
  }

  //calculate spread value - difference between highest bid and ask.
  //returned as a display percentage
  const calculateSpread = (asks: TOrderList, bids: TOrderList) => {
    const highestBid: number = bids[0][0];
    const highestAsk: number = asks[0][0];
    const spread: string = Math.abs(highestBid - highestAsk).toFixed(1);
    const spreadPercent: string = ((parseInt(spread) / highestAsk) * 100).toFixed(2);
    return `${spread} (${spreadPercent}%)`;
  }

  //calculate width of each visualizer as a percentage of the largest total on the book currently
  const calculateVisualizers = (orderList: TOrderList, largest: number) => {
    orderList.forEach((value: number[]) => {
      const totalPerc: number = value[2] / largest;
      value[3] = totalPerc * 100;
    });
  }

  //Use a datetime to help with throttling updates
  useEffect(() => {
    updateTime.current = new Date();
  }, [orders])

  useEffect(() => {
    bookDepth.current = isMobile ? 16 : 25;
  }, [isMobile])

  //initialize websocket and define its functional behavior
  useEffect(() => {
    props.sock.onopen = () => {
      const subscription: IWSSSubscribeEvent = {
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };

      try {
        props.sock.send(JSON.stringify(subscription));
      } catch (error) {
        console.log("error while attempting to subscribe");
      }
    };

    props.sock.onmessage = (message: MessageEvent) => {
      const data: IWssFeedUpdate = JSON.parse(message.data);
      const dataFeed: TDataFeed = data.feed;
      //initial hydration from snapshot
      if (dataFeed === "book_ui_1_snapshot") {

        let initialAsks: TOrderList = [];
        let askTotal: number = 0;

        //hydrate asks
        data.asks.slice(0, bookDepth.current).forEach((order) => {
          const rowOrder: TOrder = order;
          askTotal += rowOrder[1];
          initialAsks.push([...rowOrder, askTotal]);
        });

        let bidTotal: number = 0;
        let initialBids: TOrderList = [];

        //hydrate bids
        data.bids.slice(0, bookDepth.current).forEach((order) => {
          const rowOrder: TOrder = order;
          bidTotal += rowOrder[1];
          initialBids.push([...rowOrder, bidTotal]);
        });

        fillVisualizersAndTotals(initialAsks, initialBids);
        spread.current = calculateSpread(initialAsks, initialBids);

        const newstate: IOrderState = {
          asks: initialAsks,
          bids: initialBids
        }

        setOrders(newstate);

        updateTime.current = new Date();
      }

      //update messages from feed
      else if (dataFeed === "book_ui_1") {
        if (data.asks || data.bids) {
          const currentTime: Date = new Date();
          //150ms throttle on writing updates
          if (currentTime.getTime() - updateTime.current.getTime() > 100) {
            //additional throttling with requestanimationframe intended for lower end devices
            const schedule = rafSchedule(updateOrders);
            schedule(data.asks, data.bids);
          }
        }
      }
    };

    props.sock.onclose = (message: CloseEvent) => {
      console.log("Closed wss feed successfully");
    };

    props.sock.onerror = (error: Event) => {
      console.log("Error from wss feed: " + error);
      console.log("Writing error to logs...");
      console.log("Attempting to unsubscribe and halt wss feed");
      //halt feed
      const unsubscribe = {
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };
      props.sock.send(JSON.stringify(unsubscribe));
    };

  }, [ticker, group])

  /******************/
  /* EVENT HANDLERS */
  /******************/

  const handleToggleFeed = () => {
    //halt feed
    try {
      const unsubscribe = {
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };
      props.sock.send(JSON.stringify(unsubscribe));

      const newticker: TTickerType = ticker === xbtTicker ? ethTicker : xbtTicker;

      //restart feed with new subscription
      const subscription = {
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [newticker],
      };
      props.sock.send(JSON.stringify(subscription));

      setTicker(newticker);
      setGroup(-1);
    } catch (error) {
      console.log("error restarting feed");
    }

  }


  //ErrorBoundary doesn't catch errors within event handlers
  const handleKillFeed = (isKilled: boolean) => {
    if (!isKilled) {
      //restart
      console.log("resuming feed...");
      const subscription: IWSSSubscribeEvent = {
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };
      try {
        props.sock.send(JSON.stringify(subscription));
      } catch (error) {
        console.log("error while attempting to subscribe");
      }
    }
    else {
      try {
        throw new Error("ouch");
      } catch (error) {
        console.log("Caught unexpected error");
        console.log("Writing error to logs...");
        console.log("Attempting to unsubscribe and halt wss feed");
        const unsubscribe: IWSSSubscribeEvent = {
          event: "unsubscribe",
          feed: "book_ui_1",
          product_ids: [ticker],
        };
        props.sock.send(JSON.stringify(unsubscribe));
      }
    }
  }

  const handleGroupChange = (groupVal: number) => {
    updateGroup(groupVal);
    setGroup(groupVal);
  }

  const orderBookContainerStyles: React.CSSProperties = {
    display: "grid",
    ...(isMobile ? { gridTemplateRows: "1fr auto 1fr" } : { gridTemplateColumns: "1fr 1fr" }),
    height: isMobile ? "920px" : "710px",
    overflow: "hidden"

  }

  return (
    <main>
      <Header groupVals={ticker === xbtTicker ? xbtGroupVals : ethGroupVals} handleGroupChange={handleGroupChange} showSpread={!isMobile} spread={spread.current} />
      <div style={orderBookContainerStyles}>
        <OrderList isMobile={isMobile} orders={orders.asks} orderType="ask" />
        {isMobile &&
          <div className="spread">
            <span>{`Spread: ${spread.current}`}</span>
          </div>}
        <OrderList isMobile={isMobile} orders={orders.bids} orderType="bid" />
      </div>
      <Footer handleToggleFeed={handleToggleFeed} handleKillFeed={handleKillFeed} />
    </main>
  );
}

export default OrderBook;

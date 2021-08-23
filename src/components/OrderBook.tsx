import React, { useEffect, useRef, useState } from 'react';
import { IWssFeedUpdate, TGrouping, TOrder, IOrderState, TOrderList } from "../types/types";
import { EthTicker, XbtTicker } from '../helpers/consts';
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
  const [error, setError] = useState("");
  const [group, setGroup] = useState<number>(0.5);
  const [ticker, setTicker] = useState(XbtTicker);
  const [orders, setOrders] = useState<IOrderState>({ asks: [], bids: [] });
  const isMobile = useMediaQuery('(max-width: 600px)');
  let updateTime = useRef(new Date());
  let spread = useRef("");

  const xbtGroupVals: TGrouping = [0.5, 1, 2.5];
  const ethGroupVals: TGrouping = [0.05, 0.1, 0.25];


  //calculate totals and visualizer widths for each row
  const fillVisualizersAndTotals = (asks: TOrderList, bids: TOrderList) => {
    let largestTotal = calculateOrderTotals(asks, bids);
    calculateVisualizers(asks, largestTotal);
    calculateVisualizers(bids, largestTotal);
  }

  //update bids/asks based on selected group level
  const updateGroup = (groupVal: number) => {
    setOrders((prevOrders) => {
      const groupedOrders = groupOrdersByVal([...prevOrders.asks], [...prevOrders.bids], groupVal);
      fillVisualizersAndTotals(groupedOrders.asks, groupedOrders.bids);
      spread.current = calculateSpread(groupedOrders.asks, groupedOrders.bids);
      return groupedOrders;
    })
  }

  //update bids/asks based on wss feed delta updates
  const updateOrders = (dataAsks: TOrderList, dataBids: TOrderList) => {
    setOrders((prevOrders) => {
      let newAsks = [...prevOrders.asks];
      let newBids = [...prevOrders.bids];

      updateOrderList(newAsks, dataAsks);
      updateOrderList(newBids, dataBids);

      //sort for display
      newAsks.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        else return 0;
      });

      newBids.sort((a, b) => {
        if (a[0] < b[0]) return 1;
        if (a[0] > b[0]) return -1;
        else return 0;
      });

      let trimLen = Math.min(newAsks.length, newBids.length, 25);

      newAsks = newAsks.slice(0, trimLen);
      newBids = newBids.slice(0, trimLen);

      fillVisualizersAndTotals(newAsks, newBids);
      spread.current = calculateSpread(newAsks, newBids);

      return {
        asks: newAsks,
        bids: newBids
      }
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
      const totalPerc = value[2] / largest;
      value[3] = totalPerc * 100;
    });

  }

  //Use a datetime to help with throttling updates
  useEffect(() => {
    updateTime.current = new Date();
  }, [orders])

  //initialize websocket and define its functional behavior
  useEffect(() => {
    props.sock.onopen = () => {
      const subscription = {
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };

      props.sock.send(JSON.stringify(subscription));
    };

    props.sock.onmessage = (message: MessageEvent) => {
      const data: IWssFeedUpdate = JSON.parse(message.data);
      //initial hydration from snapshot
      if (data.feed === "book_ui_1_snapshot" && data.product_id === ticker) {

        // set default groupings
        if (ticker === XbtTicker) {
          setGroup(xbtGroupVals[0]);
        }
        else {
          setGroup(ethGroupVals[0]);
        }

        let initialAsks: TOrderList = [];
        let askTotal: number = 0;

        //hydrate asks
        data.asks.forEach((order) => {
          const rowOrder: TOrder = order;
          askTotal += rowOrder[1];
          initialAsks.push([...rowOrder, askTotal]);
        });

        let bidTotal: number = 0;
        let initialBids: TOrderList = [];

        //hydrate bids
        data.bids.forEach((order) => {
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

        setOrders(newstate)

        updateTime.current = new Date();
      }

      //update messages from feed
      else if (data.feed === "book_ui_1" && data.product_id === ticker) {
        //TODO: grouping

        if (data.asks || data.bids) {
          let currentTime = new Date();
          //150ms throttle on writing updates
          if (currentTime.getTime() - updateTime.current.getTime() > 150) {
            //additional throttling with requestanimationframe intented for lower end devices
            const schedule = rafSchedule(updateOrders);
            schedule(data.asks, data.bids);
          }
        }
      }

    };
    props.sock.onclose = (message: CloseEvent) => {
      console.log("Closed wss feed: " + message);
    };

    props.sock.onerror = (error: Event) => {
      console.log("Error from wss feed: " + error);
      //halt feed
      const unsubscribe = {
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };
      props.sock.send(JSON.stringify(unsubscribe));
    };

    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      props.sock.close();
    }, 5000);

  }, [ticker])

  /* EVENT HANDLERS */

  const handleToggleFeed = () => {
    //halt feed
    const unsubscribe = {
      event: "unsubscribe",
      feed: "book_ui_1",
      product_ids: [ticker],
    };
    props.sock.send(JSON.stringify(unsubscribe));

    let newticker = ticker === XbtTicker ? EthTicker : XbtTicker;

    //restart feed with new subscription
    const subscription = {
      event: "subscribe",
      feed: "book_ui_1",
      product_ids: [newticker],
    };
    props.sock.send(JSON.stringify(subscription));

    setTicker(newticker);
  }


  const handleKillFeed = () => {
    //halt feed
    const unsubscribe = {
      event: "unsubscribe",
      feed: "book_ui_1",
      product_ids: [ticker],
    };
    props.sock.send(JSON.stringify(unsubscribe));
    //throw an error
    try {
      throw new Error("ouch");

    } catch (error) {
      setError("ouch");
    }
  }

  const handleGroupChange = (groupVal: number) => {
    updateGroup(groupVal);
    setGroup(groupVal);
  }

  const orderBookContainerStyles: React.CSSProperties = {
    display: "grid",
    ...(isMobile ? { gridTemplateRows: "1fr auto 1fr" } : { gridTemplateColumns: "1fr 1fr" }),
  }

  const errorStyles: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "90%",
    backgroundColor: "red",
    zIndex: 2,
    fontSize: "2rem",
    opacity: ".9",
    color: "white"
  }

  return (
    <main>
      {error && <div style={errorStyles}>feed is broken</div>}
      <Header groupVals={ticker === XbtTicker ? xbtGroupVals : ethGroupVals} handleGroupChange={handleGroupChange} showSpread={!isMobile} spread={spread.current} />
      <div style={orderBookContainerStyles}>
        <OrderList isMobile={isMobile} orders={orders.asks} orderType="ask" />
        {isMobile &&
          <div className="spread">
            Spread: <span>{spread.current}</span>
          </div>}
        <OrderList isMobile={isMobile} orders={orders.bids} orderType="bid" />
      </div>
      <Footer handleToggleFeed={handleToggleFeed} handleKillFeed={handleKillFeed} />
    </main>
  );
}

export default OrderBook;

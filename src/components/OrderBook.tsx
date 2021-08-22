import React, { useEffect, useState } from 'react';
import { ISnapShot, TOrder, TOrderList } from "../types/types";
import { useMediaQuery } from '../hooks/useMediaQuery';

import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderList from '../components/OrderList';
import '../styles/shared-styles.css';
import rafSchedule from 'raf-schd';

const OrderBook = () => {
  const [ticker, setTicker] = useState('PI_XBTUSD');
  //TODO: test perf vs 2d array and map
  const [asks, setAsks] = useState<TOrderList>(new Map());
  const [bids, setBids] = useState<TOrderList>(new Map());
  const isMobile = useMediaQuery('(max-width: 600px)');

  //TODO: type out the state <map>
  const updateOrders = (asks: number[][], bids: number[][]) => {

  }

  const calculateSpread = () => {
    const highestBid: number = bids.keys().next().value;
    const highestAsk: number = asks.keys().next().value;
    const spread: string = Math.abs(highestBid - highestAsk).toFixed(1);
    const spreadPercent: string = ((parseInt(spread) / highestAsk) * 100).toFixed(2);
    return `${spread} (${spreadPercent}%)`;
  }

  const calculateVisualizers = (map: TOrderList, largest: number) => {
    map.forEach((value: number[], key: number) => {
      const totalPerc = value[1] / largest;
      value.push(totalPerc * 100);
      //map.set(key, value);
    });

  }


  useEffect(() => {
    const feed = new WebSocket("wss://www.cryptofacilities.com/ws/v1");

    feed.onopen = () => {
      const subscription = {
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };

      feed.send(JSON.stringify(subscription));
    };

    feed.onmessage = (message: MessageEvent) => {

      //TODO: cleanup
      const data: ISnapShot = JSON.parse(message.data);

      //TODO: validatoin here?
      //TODO: trim to 16?
      if (data.feed === "book_ui_1_snapshot") {
        //updateOrders(data.asks, data.bids);
        console.log(data);
        //TODO: export to function
        let askMap: TOrderList = new Map();
        let askTotal: number = 0;
        data.asks.forEach((order) => {
          const rowOrder: TOrder = order;
          askTotal += rowOrder[1];
          askMap.set(rowOrder[0], [rowOrder[1], askTotal]);
        });
        let bidTotal: number = 0;
        let bidMap: TOrderList = new Map();
        data.bids.forEach((order) => {
          const rowOrder: TOrder = order;
          bidTotal += rowOrder[1];
          bidMap.set(rowOrder[0], [rowOrder[1], bidTotal]);
        });


        calculateVisualizers(askMap, Math.max(askTotal, bidTotal));
        calculateVisualizers(bidMap, Math.max(askTotal, bidTotal));
        setAsks(askMap);
        setBids(bidMap);

      }
      else if (data.feed === "book_ui_1") {

        //TODO: grouping
        //TODO: calculate TOTAL
        /* Total - the summed amount of contracts derived from open orders that reside in the
book at this level and above. To calculate the total of a given level we take the size of the
current level and sum the sizes leading to this price level in the order book. The total is
also used to calculate the depth visualizer (colored bars behind the levels), the depth of
each level is calculated by taking that level's total as a percentage of the highest total in
the book.
 */

        //console.log(data);
        // const schedule = rafSchedule(test);
        // schedule(data.asks);
        // schedule(data.bids);


      }

    };
    feed.onclose = () => {
      console.log("Feed was closed!");
      // const unsubscribe = {
      //   event: "unsubscribe",
      //   feed: "book_ui_1",
      //   product_ids: [ticker],
      // };
      // feed.send(JSON.stringify(unsubscribe));
    };
    feed.onerror = (error) => {
      console.log("Error happened!");
      // this.feed.close();
      const unsubscribe = {
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [ticker],
      };
      feed.send(JSON.stringify(unsubscribe));
      // throw error;
    };


    const timer: ReturnType<typeof setTimeout> = setTimeout(() => { feed.close(); console.log("FORCE") }, 1000);

  }, [ticker])

  // var myWorker = new Worker('service-worker.js');

  // myWorker.postMessage(["testset"]);

  // myWorker.onmessage = function (e) {
  //   console.log(e.data);
  // }


  const orderBookContainerStyles: React.CSSProperties = {
    display: "grid",
    ...(isMobile ? { gridTemplateRows: "1fr auto 1fr" } : { gridTemplateColumns: "1fr 1fr" }),
    //  ...(isMobile ? { padding: "0 2rem 0 0" } : { padding: "0 4rem 0 0" }),
  }

  //TODO: see about setting up listcontext here
  //TODO: make ismobile prop more

  const spread: string = calculateSpread();

  return (
    <main>
      <Header showSpread={!isMobile} spread={spread} />
      <div style={orderBookContainerStyles}>
        <OrderList isMobile={isMobile} orders={asks} orderType="ask" />
        {isMobile && <div className="spread">Spread: <span>{spread}</span></div>}
        <OrderList isMobile={isMobile} orders={bids} orderType="bid" />
      </div>
      <Footer />
    </main>
  );
}

export default OrderBook;

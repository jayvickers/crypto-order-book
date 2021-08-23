export type TOrder = number[];

export interface IWssFeedUpdate {
    product_id: string;
    numLevels: number;
    feed: string;
    bids: number[][];
    asks: number[][];
}

export interface IOrderUpdate {
    product_id: string;
    feed: string;
    bids: number[][];
    asks: number[][];
}

export interface IOrderState {
    asks: number[][];
    bids: number[][];
}

export type TGrouping = number[];

export type TOrderList = number[][];

export type TOrderType = "ask" | "bid";

export type TTickerType = "PI_XBTUSD" | "PI_ETHUSD";

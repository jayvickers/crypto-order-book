//TODO: cleanup and change names

//row type

export type TOrder = [number, number];

export interface IWssFeedUpdate {
    product_id: string;
    numLevels: number;
    feed: string;
    bids: [[number, number]];
    asks: [[number, number]];
}

export interface IOrderUpdate {
    product_id: string;
    feed: string;
    bids: [[number, number]];
    asks: [[number, number]];
}

export interface IOrderState {
    asks: number[][];
    bids: number[][];
}

export type TGrouping = number[];

export type TOrderList = number[][];

export type TOrderType = "ask" | "bid";

export type TTickerType = "PI_XBTUSD" | "PI_ETHUSD";

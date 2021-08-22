//TODO: cleanup and change names

//row type

export type TOrder = [number, number];

export interface ISnapShot {
    product_id: string;
    numLevels: number;
    feed: string;
    bids: [[number, number]];
    asks: [[number, number]];
}

export type TOrderList = Map<number, number[]>;

export type TOrderType = "ask" | "bid";

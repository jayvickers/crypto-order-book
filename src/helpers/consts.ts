import { TGrouping, TTickerType } from "../types/types";

const xbtTicker: TTickerType = "PI_XBTUSD";
const ethTicker: TTickerType = "PI_ETHUSD";

const xbtTickerDefault: number = 0.5;
const ethTickerDefault: number = 0.05;

const xbtGroupVals: TGrouping = ["0.50", "1.0", "2.5"];
const ethGroupVals: TGrouping = ["0.05", "0.1", "0.25"];


export { ethTicker, ethTickerDefault, ethGroupVals, xbtGroupVals, xbtTicker, xbtTickerDefault };

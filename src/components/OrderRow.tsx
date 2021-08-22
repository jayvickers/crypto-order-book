import React from 'react'
import { TOrderType } from "../types/types";

interface IOrderRowProps {
    isMobile: boolean,
    price: number,
    size: number,
    total: number,
    visualizerPercentage: number,
    orderType: TOrderType
}
const OrderRow: React.FC<IOrderRowProps> = (props: IOrderRowProps) => {

    const bgColor: string = props.orderType === "bid" ? "rgb(37, 207, 146)" : "rgb(255, 90, 90)"

    const numberWithCommas = (num: string | number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const priceColor: React.CSSProperties = {
        color: bgColor
    };

    const visualizerStyles: React.CSSProperties = {
        position: "absolute",
        height: "100%",
        ...(props.isMobile ? { left: "0" } : props.orderType === "bid" ? { left: "0" } : { right: "0" }),
        width: `${props.visualizerPercentage}%`,
        background: bgColor,
        opacity: "0.2"
    }

    return (
        <div className={`row-container --${props.orderType}`} >
            <div style={visualizerStyles} />
            <span style={priceColor} className="price-col">
                {numberWithCommas(props.price.toFixed(2))}
            </span>
            <span className="size-col">
                {numberWithCommas(props.size)}
            </span>
            <span className="total-col">
                {numberWithCommas(props.total)}
            </span>
        </div >
    )
}


export default OrderRow
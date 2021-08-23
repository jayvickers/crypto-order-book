import React from 'react';
import { TOrderList, TOrderType } from "../types/types";

import OrderRow from '../components/OrderRow';

interface IOrderListProps {
    isMobile: boolean,
    orders: TOrderList,
    orderType: TOrderType
}

const OrderList: React.FC<IOrderListProps> = (props: IOrderListProps) => {
    const borderStyles: React.CSSProperties = {
        borderTop: "1px solid rgb(135, 142, 158)",
        borderBottom: "0.5px solid rgb(135 142 158 / 35%)"
    }
    let newOrders = [...props.orders];
    if (props.isMobile && props.orderType === "ask") {
        newOrders.sort((a, b) => {
            if (a[0] < b[0]) return 1;
            if (a[0] > b[0]) return -1;
            else return 0;
        })
    }

    const showHeader: boolean = props.orderType === "bid" ? !props.isMobile : true;
    return (
        <section className={`order-section --${props.orderType}`}>
            {showHeader &&
                <div style={borderStyles}>
                    <div className={`row-container --${props.orderType}`}>
                        <span className="price-col --header">PRICE</span>
                        <span className="size-col --header">SIZE</span>
                        <span className="total-col --header">TOTAL</span>
                    </div>
                </div>
            }
            <ul >
                {newOrders.map((order: number[], index: number) => {
                    return (
                        <li key={(order[0] * index)}>
                            <OrderRow isMobile={props.isMobile} price={order[0]} size={order[1]} total={order[2]} orderType={props.orderType} visualizerPercentage={order[3]} />
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
//only re-render if the bids/asks are actually changing rows
export default React.memo(OrderList, (prevProps, nextProps) => {
    let prevOrders = prevProps.orders;
    let nextOrders = nextProps.orders;

    const diffsnew = nextOrders.filter((order) => !prevOrders.some((order2) => order[0] === order2[0] && order[1] === order2[1]));
    const diffsold = prevOrders.filter((order) => !nextOrders.some((order2) => order[0] === order2[0] && order[1] === order2[1]));

    if (nextProps.isMobile !== prevProps.isMobile) {
        return false;
    }
    return diffsnew.length === 0 && diffsold.length === 0;

});
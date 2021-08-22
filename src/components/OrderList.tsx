import React from 'react';
import { TOrderList, TOrderType } from "../types/types";

import OrderRow from '../components/OrderRow';

interface IOrderListProps {
    isMobile: boolean,
    orders: TOrderList,
    orderType: TOrderType
}

const OrderList: React.FC<IOrderListProps> = (props: IOrderListProps) => {

    const listStyles: React.CSSProperties = {
        ...(props.isMobile ? { padding: "0 2rem 0 0" } : props.orderType === "bid" ? { padding: "0 4rem 0 0" } : {})
    }
    const borderStyles: React.CSSProperties = {
        borderTop: "1px solid rgb(135, 142, 158)",
        borderBottom: "0.5px solid rgb(135 142 158 / 35%)"
    }

    //TODO: type
    let listArr = props.isMobile && props.orderType === "ask" ? Array.from(props.orders).reverse() : Array.from(props.orders);
    const showHeader: boolean = props.orderType === "bid" ? !props.isMobile : true;
    return (
        <section>
            {showHeader &&
                <div style={borderStyles}>
                    <div className={`grid-container --${props.orderType}`}>
                        <span className="price-col --header">PRICE</span>
                        <span className="size-col --header">SIZE</span>
                        <span className="total-col --header">TOTAL</span>
                    </div>
                </div>
            }
            <ul style={listStyles}>
                {listArr.map((order, index) => {
                    //TODO: see about typing the params here
                    //TODO: figure out key
                    return (
                        <li key={(order[0] * index)}>
                            <OrderRow isMobile={props.isMobile} price={order[0]} size={order[1][0]} total={order[1][1]} orderType={props.orderType} visualizerPercentage={order[1][2]} />
                        </li>
                    )
                })}
            </ul>

        </section>
    )
}

export default OrderList;
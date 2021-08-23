import React, { useRef } from 'react';
import OrderBook from '../components/OrderBook';
import ErrorBoundary from './ErrorCatcher';


const ObContainer: React.FC = (props) => {
    const webSocket = useRef(new WebSocket("wss://www.cryptofacilities.com/ws/v1"));

    return (
        <ErrorBoundary>
            <OrderBook sock={webSocket.current} />
        </ErrorBoundary >
    )
}


export default ObContainer
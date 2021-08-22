import React from 'react';

interface IHeaderProps {
    showSpread: boolean,
    spread: string
}

const Header: React.FC<IHeaderProps> = (props: IHeaderProps) => {

    const headerStyles: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        padding: ".5rem 1rem"
    }

    const selectStyles: React.CSSProperties = {
        borderRadius: "4px",
        background: "rgb(135, 142, 158)",
        color: "white",
        cursor: "pointer"
    }

    return (
        <header style={headerStyles}>
            <span>Order Book</span>
            {props.showSpread && <div className="spread">Spread: <span>{props.spread}</span></div>}
            <select style={selectStyles} value={"A"}>
                <option value="A">Apple</option>
                <option value="B">Banana</option>
                <option value="C">Cranberry</option>
            </select>
        </header>
    )

}

export default Header;
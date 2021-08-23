import React, { useState } from 'react';
import { TGrouping } from "../types/types";
interface IHeaderProps {
    groupVals: TGrouping,
    handleGroupChange: (val: number) => void;
    showSpread: boolean,
    spread: string
}

const Header: React.FC<IHeaderProps> = (props: IHeaderProps) => {
    const [groupVal, setGroupVal] = useState(props.groupVals[0]);

    const updateGroupVal = (val: string) => {
        const numVal: number = parseFloat(val)
        setGroupVal(numVal);
        props.handleGroupChange(numVal);
    }

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
            {props.showSpread &&
                <div className="spread">
                    <span>{`Spread: ${props.spread}`}</span>
                </div>
            }
            <select onChange={(e) => updateGroupVal(e.target.value)} style={selectStyles} value={groupVal}>
                {props.groupVals.map((groupVal, index) => {
                    return (<option key={index} value={groupVal}>{`Group ${groupVal}`}</option>);
                })}
            </select>
        </header>
    )

}

export default Header;
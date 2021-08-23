import React, { useState } from 'react';

interface IHeaderProps {
    handleKillFeed: (isKilled: boolean) => void
    handleToggleFeed: () => void
}

const Footer: React.FC<IHeaderProps> = (props: IHeaderProps) => {
    const [forceKill, setForceKill] = useState<boolean>(false);
    const footerContainerStyles: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
        margin: "1rem 0 0.5rem 0"
    }

    const toggleButtonStyles = {
        marginRight: "1rem",
        background: "rgb(87, 65, 217)"
    }

    const killButtonStyles = {
        background: "rgb(185, 29, 29)"
    }

    const killFeedOnChange = () => {
        props.handleKillFeed(!forceKill);
        setForceKill(!forceKill);
    }

    return (
        <footer style={footerContainerStyles}>
            <button onClick={props.handleToggleFeed} style={toggleButtonStyles}>
                Toggle Feed
            </button>
            <button onClick={killFeedOnChange} style={killButtonStyles}>
                Kill Feed
            </button>
        </footer>
    )

}

export default Footer;
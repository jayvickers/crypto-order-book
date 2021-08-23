import React from 'react';

interface IHeaderProps {
    handleKillFeed: () => void
    handleToggleFeed: () => void
}

const Footer: React.FC<IHeaderProps> = (props: IHeaderProps) => {
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

    return (
        <footer style={footerContainerStyles}>
            <button onClick={props.handleToggleFeed} style={toggleButtonStyles}>
                Toggle Feed
            </button>
            <button onClick={props.handleKillFeed} style={killButtonStyles}>
                Kill Feed
            </button>
        </footer>
    )

}


export default Footer;
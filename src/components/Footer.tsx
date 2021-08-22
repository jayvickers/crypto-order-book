import React from 'react';

const Footer: React.FC = () => {

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
            <button style={toggleButtonStyles}>
                Toggle Feed
            </button>
            <button style={killButtonStyles}>
                Kill Feed
            </button>
        </footer>
    )

}


export default Footer;
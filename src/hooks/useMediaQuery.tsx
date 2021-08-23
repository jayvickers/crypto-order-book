import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
    const mediaMatch = window.matchMedia(query);
    const [matches, setMatches] = useState(mediaMatch.matches);

    useEffect(() => {
        mediaMatch.addEventListener("change", (e) => {
            if (e.matches) {
                setMatches(true);
            } else {
                setMatches(false);
            }
        })
    });
    return matches;
};
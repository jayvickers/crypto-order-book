import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
    const mediaMatch = window.matchMedia(query);
    const [matches, setMatches] = useState(mediaMatch.matches);

    useEffect(() => {
        // const handler = (e:any) => setMatches(e.matches);
        mediaMatch.addEventListener("change", (e) => {
            if (e.matches) {
                /* the viewport is 600 pixels wide or less */
                setMatches(true);
            } else {
                /* the viewport is more than than 600 pixels wide */
                setMatches(false);
            }
        })

        //return () => mediaMatch.removeEventListener("change");
    });
    return matches;
};
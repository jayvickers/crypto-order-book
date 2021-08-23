# Order Book submission
**production link:** https://jacob-8232021.vercel.app/
## Considerations
### Performance
- monitoring through `Lighthouse` analytics scores and React `profiler` 
- re-render prevention through `useEffect` dependency management and `useMemo`
- ui repaint throttling and `requestanimationframe` scheduling for device specific throttling

### Security
- JSON consumed with `JSON.parse()`
- all consumed JSON data escaped with data binding to avoid injection and XSS
- security sweeps with `Snyk`(https://snyk.io/) and built in `npm audit` tools

**I am using** `react-scripts` **to easily enable out of the box rapid testing and hotloading. This is not a package I would use in a real production environment due to security concerns**

### Styling
- Assumptions: no clarification provided on hover states, focus states, or animations/transitions
- with above assumptions I decided to use primarily Inline styles for speed and ease of use. If more complex styles were required I may have used style sheets with a CSS post processor like LESS or SCSS.
- some media queries are used for mobile to desktop adjustments

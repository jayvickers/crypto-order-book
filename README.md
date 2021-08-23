# Order Book submission

**production link:**

## Considerations
### Performance
- re-render prevention through `useEffect` dependency management and `useMemo`
- ui repaint throttling and `requestanimationframe` scheduling for device specific throttling

### Security
- JSON consumed with `JSON.parse()`
- all consumed JSON data escaped with data binding to avoid injection and XSS
- security sweeps with `Snyk`(https://snyk.io/) and built in `npm audit` tools

**I am using** `react-scripts` **to easily enable out of the box rapid testing and hotloading. This is not a package I would use in a real production environment due to security concerns**

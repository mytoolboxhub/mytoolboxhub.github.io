# MyToolboxHub

24 browser-local tools at https://mytoolboxhub.github.io/ with tested examples and three practical walkthroughs.

## Development and validation

Use Node 24 (minimum 22.19), then run:

```sh
npm ci
npm run check
npm test
npm run build
node scripts/check-site.mjs
node scripts/test-converter.mjs
```

`npm run dev` starts development; `npm run preview` serves the production build. GitHub Pages publishes pushes to `main` only after source checks, tool tests, build, and generated-page checks pass.

Tool algorithms live in `src/tools`; page instructions in `src/lib/tool-guides.ts`; walkthroughs in `src/lib/walkthroughs.ts`. Preserve tool URLs when editing the registry.

## Advertising setup

`ads.txt` and the account-provided verification meta tag identify publisher `pub-1771884902241881`. The site currently uses verification metadata only, with no ad-serving script or ad placements. The Google European consent message is configured in AdSense. Before activating ad serving, update privacy disclosures, verify consent and withdrawal controls on the live site, and keep ads clear of tool controls.

AdSense approval is an external decision. Passing these checks or publishing the website does not establish approval.

# Problem 2 — Token swap

A React, TypeScript and Vite app with three pages:

- **Problem 1:** code and animated sum playgrounds.
- **Problem 2:** choose tokens, enter an amount and preview a swap.
- **Problem 3:** compare the original and refactored React code in split or unified view.

## Run

From this folder, using Node.js 24 or newer:

```sh
npm ci
npm run dev
```

Use `npm test`, `npm run lint` and `npm run build` to check the app.

## Swap details

Prices come from CoinGecko; token icons come from Switcheo. If live prices fail, the app uses the challenge's historical sample and labels it clearly. If neither source works, the user can retry.

Quotes include a 0.3% demo fee. Swaps are simulated: enter any 4 digits, wait for the animation, then see a success toast. The form returns after 10 seconds, or you can go back immediately. No wallet connection or real transfers.

For Vercel, use the repository root, since the app also reads files from Problems 1 and 3.

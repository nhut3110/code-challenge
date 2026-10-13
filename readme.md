# Frontend Code Challenge — Vo Minh Nhut

My solutions to the [99Tech Code Challenge](https://github.com/99techteam/code-challenge).

- [Problem 1](src/problem1): three ways to sum numbers from 1 to n.
- [Problem 2](src/problem2): a token swap form and a website to try all three problems.
- [Problem 3](src/problem3): a React refactor with explanations of the changes.

[Live demo](https://code-challenge-mu-seven.vercel.app)

## Run locally

Use Node.js 24 or newer. From the repository root:

```sh
npm --prefix src/problem2 ci
npm run dev
```

Open the local URL shown in the terminal. Use the navigation to switch between problems.

## Checks

```sh
npm test
npm run lint
npm run build
```

To deploy on Vercel, select the repository root. The included configuration handles the build and page routes.

# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## THE NUMBER GAME — frontend (JSX)
1. `cp .env.example .env` et renseigner les URL du backend Django.
2. `bun install` puis `bun run dev`.
Contrat API/WebSocket : `docs/API.md`. Tokens : access en mémoire/session, refresh en cookie HttpOnly si le backend le permet (sinon localStorage, moins sûr face au XSS).

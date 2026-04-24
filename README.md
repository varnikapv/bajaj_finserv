

# Hierarchify

This repository contains my solution for the SRM Full Stack Engineering Challenge. I decided to build the frontend and backend in the same repository as a unified full-stack application (using Vite + React for the frontend and Express for the node backend). This makes development and deployment a lot smoother.

## Tech Stack
*   **Backend:** Node.js, Express.js
*   **Frontend:** React (Vite configuration), Tailwind CSS for styling
*   **Language:** TypeScript throughout the entire stack

## Development Setup

If you want to run this locally:

1.  Clone the repository and install the dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
    This single command spins up the backend on port 3000 and uses Vite as a development middleware so both run seamlessly. You can view the app at `http://localhost:3000`.

## Production & Deployment

To deploy this, you can just host it as a Node.js web service on any platform (Render, Railway, Heroku, etc.).

*   **Build string:** `npm run build`
*   **Start string:** `npm run start`

**Note for submission:** Since both the Express API and the React frontend are served from the exact same domain in production, you can submit the **same link** for both the Backend and Frontend fields in the form! 
*   **Frontend URL:** `https://your-deployed-domain.com`
*   **API Base URL:** `https://your-deployed-domain.com` (the evaluator will hit `/bfhl` automatically).

## Features & Implementation Details

*   **Core Logic:** The `/bfhl` POST route processes the arrays of edges. I implemented cycle detection by identifying independent groups and verifying roots.
*   **Edge Cases Handled:** Cycles are accurately isolated (returning `has_cycle: true` without an invalid nested tree), diamond multi-parent edge cases are resolved gracefully by keeping the first encountered relationship, and generic edge validation avoids throwing 500 errors on bad inputs.
*   **UI/UX:** Instead of a generic table, I built a custom tree-viewer for the hierarchies to make it easier to read deeply nested structures. The UI handles errors gracefully instead of breaking.

## Commit Message Example

If you need a human-like initial commit note for your repo, feel free to use:
```
init: setup fullstack app for srm challenge

- add express server and /bfhl processing logic
- set up cycle detection and graph construction
- create react UI with tree viewer and tailwind styling
- combine vite and express for easy unified deployment
```

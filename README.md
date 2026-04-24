

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** React, Vite, Tailwind CSS
- **Language:** TypeScript

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs both frontend and backend combined):
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Deployment

The application is structured as a full-stack project where the Express server also serves the React frontend in production. **You can deploy this as a single application and use the same base domain for both the frontend and backend submission links.**

When deploying to platforms like **Render**, **Railway**, **Vercel**, or **Heroku**:
- **Build Command:** `npm run build`
- **Start Command:** `npm run start`

**For the submission form:**
- **Hosted API base URL:** `https://<your-deployed-domain>` (the evaluator script will append `/bfhl` to this base URL)
- **Hosted frontend URL:** `https://<your-deployed-domain>`

## Features Implemented
- **POST `/bfhl` API Endpoint:** Accurately processes arrays of node strings, detects cyclic vs non-cyclic relationships, and constructs valid nested trees.
- **Cycle Detection:** Identifies isolated cycles using Kahn's algorithm concepts and lexicographically sorts them when finding the root.
- **Frontend App:** Modern dashboard built with React and Tailwind CSS that POSTs data to the backend and dynamically renders the nested trees and validation arrays.

## Git Commit Note for Submission
If you are initializing a Git repository to push this code, here is an example of a good initial commit message:
```bash
git init
git add .
git commit -m "feat: complete full stack implementation for SRM challenge

- Add Express backend with /bfhl POST endpoint
- Implement node parsing, cycle detection, and JSON tree construction
- Build React SPA for data visualization and interaction
- Add final Tailwind CSS dark mode styling"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

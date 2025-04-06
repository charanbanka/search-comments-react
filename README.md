# Typeahead Search Page

## Overview
This project is a React-based search page built using Vite and TypeScript (TSX). It allows users to search comments from a public JSON API with a typeahead feature and displays up to 20 relevant results. The project follows the KISS principle to ensure simplicity and maintainability.

## Tech Stack
- **Frontend:** React.js (with TypeScript, TSX)
- **Build Tool:** Vite
- **State Management:** React hooks (useState, useEffect)
- **HTTP Client:** XHR Requests
- **Testing Framework:** Vitest with React Testing Library
- **Styling:** CSS Modules

## Project Structure
```
├── src
│   ├── components
│   │   ├── Search
│   │   |   ├── Search.tsx
│   ├── customHooks
│   │   ├── useDebounce.ts
│   ├── App.tsx
│   ├── main.tsx
├── public
├── tests
|   ├── App.test.tsx
|   ├── main.test.tsx
│   ├── Search.test.tsx
│   ├── useDebounce.test.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Component Breakdown
### 1. `Search.tsx`
- Renders the input box with typeahead functionality.
- Calls API when input length exceeds 3 characters.
- Debounces user input to reduce unnecessary API calls.
- Displays up to 20 search results.
- Shows `name`, `email`, and a truncated `body` (64 characters max).

## API Integration
### Endpoint Used:
`https://jsonplaceholder.typicode.com/comments?q=<searchTerm>`
- The `q` parameter is used to send the search term.
- Response is filtered and truncated before being displayed.

## State Management
- The search query is managed using React’s `useState`.
- The API call is triggered using `useEffect`, with input debounced using a custom `useDebounce` hook.
- Search results are stored in a state variable and rendered dynamically.

## Performance Optimizations
- **Debouncing:** Limits API requests by waiting for user input to settle.
- **Lazy Rendering:** Results are only rendered when API fetch is complete.

## Development & Testing
### Run Development Server:
```
npm install
npm run dev
```

### Run Tests:
```
npm test
```
Tests include:
- Rendering and interaction tests for `Search`
- API call mocking and response handling
- Display validation for `Search`

## Production Build
- The project uses Vite for bundling and optimization.
- Generate a production build with:
```
npm run build
```

## Conclusion
This project is a lightweight, optimized, and easy-to-maintain search page that ensures a smooth user experience while following best practices in React and TypeScript development.

UI Screens

![search-comments-1](https://github.com/user-attachments/assets/ebc71077-0d37-42a3-9de4-221042710b54)

![search-comments-2](https://github.com/user-attachments/assets/f994878c-e4c1-452f-9ec0-f4e2ad300464)

![search-comments-3](https://github.com/user-attachments/assets/6447ad64-e8a2-4768-994f-d50a68ba25cc)






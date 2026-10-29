# MoneyMap

A personal finance web application for tracking income, expenses, and financial progress.

MoneyMap brings everyday financial activity into one place, helping users understand their spending and keep track of their money.

## Project Status

MoneyMap is under active development.

Session-based authentication and transaction tracking are implemented. Budgeting, savings goals, and analytics are planned for upcoming stages.

The interface is being migrated from an original HTML, CSS, and JavaScript prototype to React and TypeScript, reusing the existing design and assets.

## Features

### Authentication

- Login interface with form validation and error feedback
- User registration through the backend API
- Server-side sessions stored in PostgreSQL
- HTTP-only session cookies
- Protected application routes
- Password hashing with bcryptjs

### Transactions

- Add income and expense transactions
- Record a date, description, category, and amount
- View transactions belonging to the signed-in user
- Display transaction count, total income, total expenses, and net balance
- Store monetary amounts as integer cents
- Show loading, empty, and error states

### Interface

- Sidebar navigation with active page indicators
- Responsive login and transaction layouts
- Reusable React components
- Styles organized by page and component

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, React Router |
| Styling | CSS |
| Frontend tooling | Vite, ESLint |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, node-postgres |
| Authentication | bcryptjs, express-session, connect-pg-simple |

## Application Structure

The React frontend communicates with the Express API. The backend validates requests, manages user sessions, and reads or writes data in PostgreSQL.

Transaction access is checked on the server using the authenticated user's session.

```text
MoneyMap/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable interface components
│       ├── pages/       # Application pages
│       └── styles/      # Page and component styles
├── server/              # Express API and session handling
├── database/            # PostgreSQL schema
└── src/                 # Original frontend prototype
```

## Roadmap

- Connect the registration interface to the backend
- Add logout controls
- Edit and delete transactions
- Search and filter transactions
- Build the financial dashboard
- Manage monthly budgets by category
- Track savings goals
- Visualize financial activity with charts
- Refine accessibility and mobile layouts
- Containerize the application with Docker
- Prepare the application for deployment

## Project Purpose

MoneyMap is a hands-on full-stack development project covering component-based interfaces, TypeScript, REST APIs, session authentication, relational databases, and responsive design.

The project is developed step by step, with an emphasis on understanding the implementation and keeping the code organized.
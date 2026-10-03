# TaskFlow

A modern, full-stack MERN (MongoDB, Express, React, Node.js) project and task management SaaS application.

## Features

- **Authentication**: JWT-based registration, login, and secure sessions.
- **Projects**: Create, edit, delete, and view project progress.
- **Tasks**: Kanban-style task management with status (To Do, In Progress, Review, Done) and priorities.
- **Dashboard**: High-level overview of active projects and pending tasks.
- **Search & Filter**: Find tasks quickly across all projects.
- **Responsive UI**: Built with React, Tailwind CSS, and Lucide icons for a premium feel on all devices.

## Tech Stack

**Frontend:**
- React (TypeScript)
- Vite
- Tailwind CSS
- React Router DOM
- Axios for API requests
- React Hot Toast for notifications
- Lucide React for icons
- date-fns for date formatting

**Backend:**
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Jest & Supertest for testing

## Project Structure

```
taskflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API client and services
│   │   ├── components/     # Reusable UI, Layout, and Form components
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── pages/          # Application pages (Dashboard, Projects, Tasks, etc.)
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Main router
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, Validation, Error Handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── tests/          # Jest API tests
│   │   ├── utils/          # JWT helpers and seed script
│   │   └── server.ts       # Server entry point
│   └── package.json
│
└── README.md
```

## Installation & Setup

1. **Clone the repository** (or use the provided source code).
2. **Install dependencies**:
   
   Backend:
   ```bash
   cd server
   npm install
   ```
   
   Frontend:
   ```bash
   cd client
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the `server` directory based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **MongoDB Setup**:
   Ensure MongoDB is running locally on port 27017, or update the `MONGO_URI` to point to your MongoDB Atlas cluster.

## Development Commands

**Seed the database with sample data:**
```bash
cd server
npm run seed
```
*(This will create sample users, projects, and tasks. Test accounts: alice@taskflow.dev, bob@taskflow.dev, etc. Password for all: `password123`)*

**Run the Backend (Development mode):**
```bash
cd server
npm run dev
```

**Run the Frontend (Development mode):**
```bash
cd client
npm run dev
```

**Run Backend Tests:**
```bash
cd server
npm test
```

## Production Build & Deployment

**Backend:**
1. Build the TypeScript code: `npm run build`
2. Start the compiled code: `npm start`
*Deployable to Render, Railway, DigitalOcean, etc.*

**Frontend:**
1. Build the production bundle: `npm run build`
2. Preview the build: `npm run preview`
*Deployable to Vercel, Netlify, Cloudflare Pages, etc.*

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - Get all accessible projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details and stats
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `GET /api/tasks` - Get all tasks (supports filtering/search)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile/password

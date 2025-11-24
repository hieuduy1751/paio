# PAIO - Personal All-In-One Application

A comprehensive productivity and personal management application built with Next.js, PostgreSQL, and modern web technologies.

## Features

- 🎯 **Quest System**: Gamified daily and weekly tasks with level progression
- 💰 **Expense Management**: Track income and expenses across multiple money sources
- ⏲️ **Pomodoro Timer**: Focus sessions with statistics and history
- 🌳 **Skills Tree**: Upgrade skills to earn more experience
- 🎨 **Theme Support**: Light and dark mode
- 🔐 **JWT Authentication**: Secure user authentication with middleware

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS v4, Lucide Icons
- **State Management**: Zustand
- **Database**: PostgreSQL with Knex.js
- **Authentication**: JWT with bcrypt
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a PostgreSQL database:
   \`\`\`sql
   CREATE DATABASE paio_db;
   \`\`\`

4. Copy `.env.example` to `.env` and update the values:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

5. Run migrations:
   \`\`\`bash
   npm run migrate
   \`\`\`

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000)

## Database Migrations

- **Create a new migration**: `npm run migrate:make migration_name`
- **Run migrations**: `npm run migrate`
- **Rollback**: `npm run migrate:rollback`

## Database Schema

### Users
- User accounts with level and experience tracking

### Money Sources
- Multiple financial accounts per user

### Expenses
- Transaction history (credit/debit)

### Quests
- Daily and weekly tasks linked to skills

### Skills
- Skill categories with base experience values

### User Skills
- User-specific skill levels and multipliers

### Pomodoro Sessions
- Focus session history and statistics

### User Quests
- Quest completion tracking and experience earned

## License

MIT

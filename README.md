# Backend-VPT

Backend server for the Virtual Personal Trainer (VPT) using Supabase.

## Setup

1. Clone the repository
2. Set up a Supabase project at [supabase.com](https://supabase.com)
3. Copy your project's URL and anonymous key
4. Create the required database tables:
   - Users table
   - Experience assessment table
   - Workouts table
   - Progress tracking table

## Database Schema

The database includes the following tables:

### Users
- id (uuid, primary key)
- email (string)
- created_at (timestamp)
- experience_level (string)

### Experience Assessment
- id (uuid, primary key)
- user_id (uuid, foreign key)
- answers (jsonb)
- created_at (timestamp)
- score (integer)

### Workouts
- id (uuid, primary key)
- user_id (uuid, foreign key)
- exercises (jsonb)
- created_at (timestamp)
- completed (boolean)

## API Endpoints

All API endpoints are handled through Supabase's auto-generated REST API:

- Authentication endpoints
- User management
- Experience assessment
- Workout management
- Progress tracking

## Frontend Connection

This backend connects with the [FrontEnd-VPT](https://github.com/ItzRikk/FrontEnd-VPT) repository.
The frontend application uses Supabase client to interact with this backend.

### Connection Details
- Frontend Branch: `alex-db-connection`
- Backend Branch: `alex-connection`
- Connection Method: Supabase Client
- Authentication: JWT tokens via Supabase Auth

### Environment Variables

Required in the frontend application:
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Frontend Repository

The frontend code is available at: [FrontEnd-VPT](https://github.com/ItzRikk/FrontEnd-VPT)

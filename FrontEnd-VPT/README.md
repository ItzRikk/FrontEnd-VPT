# FrontEnd-VPT

Frontend application for the Virtual Personal Trainer (VPT) using React Native.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Features

- User Authentication
- Experience Level Assessment
- Workout Planning
- Progress Tracking

## Backend Connection

This application connects to the [Backend-VPT](https://github.com/ItzRikk/Backend-VPT) repository using Supabase.
All API calls are handled through the `src/services/supabase.js` file.

### Connection Details
- Frontend Branch: `alex-db-connection`
- Backend Branch: `alex-connection`
- Connection Method: Supabase Client
- Authentication: JWT tokens via Supabase Auth

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Application screens
├── services/       # API and backend services
├── navigation/     # Navigation configuration
└── utils/         # Helper functions
```

## Environment Variables

Required environment variables:
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key

## Backend Repository

The backend code is available at: [Backend-VPT](https://github.com/ItzRikk/Backend-VPT)

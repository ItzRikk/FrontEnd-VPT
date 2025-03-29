# Backend-VPT

Backend service for the Virtual Personal Trainer (VPT) application using Supabase.

## Setup

1. Install Supabase CLI
2. Run `supabase start` to start the local development environment
3. The database schema will be automatically applied

## Environment Variables

The following environment variables are required in the frontend application:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Authentication
- Sign Up: `POST /auth/signup`
- Sign In: `POST /auth/signin`
- Sign Out: `POST /auth/signout`

### Intake Form
- Get Questions: `GET /question`
- Submit Responses: `POST /userIntakeResponses`
- Get User Level: `GET /userProfile/:userId`

## Database Schema

- `question`: Stores intake form questions
- `answer`: Stores possible answers for questions
- `userIntakeResponses`: Stores user responses to intake form
- `userProfile`: Stores user information and experience level

## Frontend Repository

The frontend code is available at: [FrontEnd-VPT](https://github.com/ItzRikk/FrontEnd-VPT) 
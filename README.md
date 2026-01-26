# Crystal XI

A Next.js web application that allows Fantasy Premier League (FPL) managers to view and plan their team across all remaining gameweeks, displaying upcoming fixtures, home/away status, and fixture difficulty ratings (FDR) for each player.

## Features

- **Multi-Gameweek View**: See your team's fixtures across ALL remaining gameweeks (not just the next one)
- **Fixture Difficulty Ratings**: Color-coded FDR indicators (1-5 scale) for each player's upcoming fixtures
- **Home/Away Indicators**: Clear indication of whether each fixture is home or away
- **Team Sync**: Connect your FPL team ID to automatically sync your current team
- **User Authentication**: Secure user accounts with NextAuth.js
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB (MongoDB Atlas)
- **Database Client**: Mongoose
- **State Management**: React Hooks
- **UI Components**: Custom components with Headless UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)
- FPL team ID (found in your FPL team URL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Crystal FPLall"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your MongoDB Atlas connection string
   - Generate a random string for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fpl-planner?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:4000](http://localhost:4000) in your browser.

## Usage

1. **Register/Login**: Create an account or sign in
2. **Connect Your Team**: Go to the Team page and enter your FPL team ID
3. **View Planner**: Navigate to the Planner page to see your team's fixtures across all remaining gameweeks
4. **Select Gameweeks**: Use the gameweek selector to filter which gameweeks to display

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Main application pages
│   └── api/             # API routes
├── components/
│   ├── planner/         # Multi-gameweek planner components
│   ├── team/            # Team management components
│   └── layout/          # Layout components
├── lib/
│   ├── fpl-api.ts       # FPL API client
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # MongoDB connection
│   └── models/          # Mongoose models
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## API Integration

The app integrates with the official FPL API:
- `https://fantasy.premierleague.com/api/bootstrap-static/` - Players, teams, events, fixtures
- `https://fantasy.premierleague.com/api/entry/{team_id}/` - User team data
- `https://fantasy.premierleague.com/api/fixtures/` - All fixtures

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

Crystal XI is optimized for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - `NEXTAUTH_SECRET` - A random secret string
4. Deploy!

**Important:** Make sure to allow `0.0.0.0/0` in MongoDB Atlas Network Access for Vercel deployments.

## License

MIT

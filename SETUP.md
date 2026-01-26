# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory with the following:
   
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fpl-planner?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:4000
   NEXTAUTH_SECRET=your-secret-key-here
   ```
   
   **Getting MongoDB Atlas URI:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string and replace `<password>` with your database password
   
   **Generating NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Or use any random string generator.

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open the Application**
   - Navigate to [http://localhost:4000](http://localhost:4000)
   - Register a new account
   - Connect your FPL team ID
   - Start planning!

## Finding Your FPL Team ID

1. Go to [Fantasy Premier League](https://fantasy.premierleague.com/)
2. Log in to your account
3. Navigate to your team page
4. Look at the URL - it will be something like:
   ```
   https://fantasy.premierleague.com/entry/1234567/event/1
   ```
   Your team ID is the number after `/entry/` (e.g., `1234567`)

## Troubleshooting

### MongoDB Connection Issues
- Make sure your IP address is whitelisted in MongoDB Atlas
- Verify your connection string is correct
- Check that your database user has proper permissions

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set and is a random string
- Make sure `NEXTAUTH_URL` matches your current URL (http://localhost:4000 for development)

### FPL API Issues
- The FPL API is public and doesn't require authentication
- If you see CORS errors, the API routes should handle this
- Check your internet connection

## Next Steps

- Customize the UI with your preferred colors
- Add more features like transfer planning
- Deploy to Vercel or your preferred hosting platform


# Email Gmail App - Frontend

This is the frontend application for the Email Gmail App, built with React and TypeScript.

## Features

- User authentication (login/register)
- Gmail OAuth integration
- Email dashboard
- Bulk email upload functionality
- Protected routes
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Mywall-Tech/email-gmail-app-fe.git
cd email-gmail-app-fe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```
Edit `.env` with your configuration values.

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Deployment

This app is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration for:

- Build settings
- SPA routing redirects
- Security headers
- Static asset caching

### Environment Variables for Production

Make sure to set these environment variables in your Netlify dashboard:

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID
- Other environment variables as needed

## Project Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## Technologies Used

- React 18
- TypeScript
- React Router
- Context API for state management
- CSS3 for styling
- Google OAuth for authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software owned by Mywall Tech.
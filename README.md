# Kz Barry Template 

KzBarry is a base template designed to streamline the start of development projects. It reduces initial setup time and is available as a repository on Kaizen for use in production environments.

# Index  

- [Installation](#installation)
- [Vercel](#vercel)
- [Authentication](#authentication)
- [Database Setup](#database-setup)
- [API](#api)
- [Utilities and Hooks](#utilities-and-hooks)

# Installation

First, clone our template:

```bash
git clone https://github.com/kzsoftworks/kzBarry-nextjs-template.git
npm install
```

Copy `.env.example` and rename it to `.env` in the root project directory.

# Vercel

## Why Vercel?
Vercel provides an all-in-one platform that streamlines our deployment process. It offers:

- Zero-configuration deployments
- Built-in PostgreSQL database
- Environment variables management
- Logs and monitoring
- Automatic HTTPS and SSL
- Preview deployments for each PR

This allows us to focus on development while Vercel handles the infrastructure and DevOps tasks out of the box.

## Environment Variables in Vercel

1. Open Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with its value

# Authentication

Currently, we only support Auth0 authentication.

## Environment Variables (Auth0)

Required environment variables for your `.env` file:

```plaintext
AUTH0_BASE_URL
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_SECRET
AUTH0_AUDIENCE
AUTH0_DOMAIN
AUTH0_ISSUER_BASE_URL
```

## Auth0 Setup

1. Log in to your Auth0 account

2. Create a new application:
   - Go to Applications in the left panel
   - Click Create Application
   - Select Regular Web Applications
   - Choose Next.js

3. Configure settings:
   - Go to Settings tab
   - Copy required credentials to your .env:
     ```plaintext
     AUTH0_BASE_URL=http://localhost:3000
     AUTH0_DOMAIN=[Your Domain]
     AUTH0_CLIENT_ID=[Your Client ID]
     AUTH0_CLIENT_SECRET=[Your Client Secret]
     AUTH0_ISSUER_BASE_URL=https://[Your Domain]
     ```

4. Set up Application URIs:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

5. Enable at least one authentication method in Connections tab

# Database Setup

You can choose between Vercel's PostgreSQL or a local database.

## Vercel Database

1. Go to Vercel Dashboard
2. Navigate to Storage
3. Click Create Database
4. Copy the connection string to `DATABASE_URL` in your .env

## Local Database

### Windows Setup

1. Download PostgreSQL from official website
2. Run installer and follow setup wizard
3. Create database using pgAdmin 4

### macOS Setup

Using Homebrew:
```bash
brew install postgresql@15
brew services start postgresql@15
```

Create database:
```bash
psql postgres
CREATE DATABASE your_database_name;
```

# API

Our API supports both protected and public endpoints.

## Authentication
Endpoints can be protected using the `withAPIAuth` wrapper or left public. Protected endpoints validate Auth0 session automatically.

## User Synchronization
User data automatically syncs between Auth0 and our database during login and signup.

## Endpoints

### Users

```http
GET /api/users      # Protected - Get all users
POST /api/users     # Protected - Create user
POST /api/auth/sync # Public - Auth0 sync
```

## Making API Calls

Example of authenticated request:
```typescript
const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users', {
      credentials: 'include' // Required for Auth0 session
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};
```

# Utilities and Hooks

## Authentication Utilities

### withAPIAuth
Protects API endpoints with Auth0 authentication:

```typescript
import { withAPIAuth } from '@/utils/withAPIAuth';

export const GET = withAPIAuth(async () => {
  // Protected endpoint logic
});
```

## Custom Hooks

### useAppUser
Enhanced version of Auth0's useUser hook with database data:

```typescript
import { useAppUser } from '@/hooks/useAppUser';

function Profile() {
  const { user, isLoading } = useAppUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.dbData?.email}</p>
    </div>
  );
}
```
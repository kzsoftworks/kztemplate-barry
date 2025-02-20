
# Kz Barry Template 

KzBarry is a base template designed to streamline the start of development projects. It reduces initial setup time and is available as a repository on Kaizen for use in production environments.





# Index  

- [Installation](#installation)
- [Vercel](#vercel)
    - [How to add Environment variables?](#how-to-add-environment-variables?)
- [Authentication](#authentication)
- [How to Create and Connect to a Database](#how-to-create-and-connect-to-a-database)
- [API](#api)
- [Utilities and Hooks](#utilities-and-hooks)
- [Sentry](#sentry)
# Installation

First we have to clone our template

```bash
  cd git clone https://github.com/kzsoftworks/kzBarry-nextjs-template.git
  
  npm install
```
  copy `.env.example` and rename it into: `.env` on the root proyect

  Finally, we run `npm run dev`.

  Disclaimer: For this version, we need to have Auth0 working in order to make the application function properly.
# Vercel

#### Why Vercel?
Vercel provides an all-in-one platform that streamlines our deployment process. It offers:

- Zero-configuration deployments
- Built-in PostgreSQL database
- Environment variables management
- Logs and monitoring
- Automatic HTTPS and SSL
- Preview deployments for each PR

This allows us to focus on development while Vercel handles the infrastructure and DevOps tasks out of the box.



#### How to add Environment variables? 

Open Vercel Dashboard
Select your project
Go to Settings > Environment Variables
Add each variable with its value




# Authentication

At the moment, we only have Auth0 authentication. 

### Environment Variables (Auth0)

To run this project, you will need to add the following environment variables to your .env file

`AUTH0_BASE_URL`

`AUTH0_CLIENT_ID`

`AUTH0_CLIENT_SECRET`

`AUTH0_SECRET`

`AUTH0_DOMAIN`

`AUTH0_ISSUER_BASE_URL`

### How to Create and Connect the Project with Auth0

This guide will walk you through creating a project and connecting it with Auth0 for authentication.

First, we have to be logged in to an Auth0 account
    
Now we have to go to Application (on the left pannel), Create Application, select `Regular Web Applications` and finally `Next.js`
    
Go the `Settings` tab.
    
    Now we have to copy the following properties into our .env
        local environment url -> AUTH0_BASE_URL. For example: http://localhost:3000
        Domain -> AUTH0_DOMAIN
        ClientID -> AUTH0_CLIENT_ID
        Client Secret -> AUTH0_CLIENT_SECRET
        Credentials Tab -> Client Secret -> AUTH0_SECRET
        AUTH0_ISSUER_BASE_URL -> https:// + Auth0 domain 
        
        
And on the same tab `Settings` we go down into `Application URIs`.
We set Allowed Callback URLs with: Our_local_base_url/api/auth/callback. 
For example: `http://localhost:3000/api/auth/callback`
    
And on `Allowed Logout URLs and Allowed Web Origins`: Our local base url For example: `http://localhost:3000`

And finally we have to enable at least one Authentication method on tab `Connections`




# How to Create and Connect to a Database

This guide will help you understand the steps needed to create a database and establish a connection to it.

We have two choices, we can do it with Vercel as it provides an easy headless postgress database, or we can have a local postgres database.

### Vercel

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Choose "Postgres" as your database type
5. Select your preferred region
6. Click "Create"

After creation:

1. Go to the database settings
2. Copy the `POSTGRES_PRISMA_URL` value
3. Paste it in your `.env` file as `DATABASE_URL`

Your connection string will look like this:
```
DATABASE_URL="postgres://[user]:[password]@[endpoint]/[database]?sslmode=require"
```

This will create a Neon-powered PostgreSQL database that's automatically configured and optimized for your Vercel deployment.



### Local Database

#### Windows Installation
1. Download the PostgreSQL installer from the [official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow these steps:
   - Choose your installation directory
   - Select the components you want to install (at minimum, select the PostgreSQL Server and pgAdmin)
   - Choose a password for the default PostgreSQL superuser (postgres)
   - Keep the default port (5432)
   - Complete the installation

3. After installation:
   - Open pgAdmin 4 (it should have been installed with PostgreSQL)
   - Connect to the server using your password
   - Right-click on "Databases" and select "Create" > "Database"
   - Name your database and save

#### macOS Installation
1. Using Homebrew (recommended):
   ```bash
   # Install Homebrew if you haven't already
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install PostgreSQL
   brew install postgresql@15
   
   # Start PostgreSQL service
   brew services start postgresql@15
   ```

2. Create a database:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create a new database
   CREATE DATABASE your_database_name;
   ```

For local development:
- User: Usually 'postgres' (default)
- Password: The one you set during installation
- Host: localhost
- Port: 5432 (default)
- Database: Your database name

So in the ENV variable `DATABASE_URL` should be like this:
DATABASE_URL="postgres://postgres:yourpassword@localhost:5432/your_database_name"


## Database Migrations

### Prerequisites
- PostgreSQL database already set up
- Valid `DATABASE_URL` in your `.env` file

### Running Migrations

1. Push the database schema to your database:
```bash
npx prisma db push
```

2. (Optional) View your database structure using Prisma Studio:
```bash
npx prisma studio
```

### Troubleshooting

If you encounter any issues:

1. Reset the database (⚠️ This will delete all data):
```bash
npx prisma db reset
```

2. Check migration status:
```bash
npx prisma migrate status
```

### Database Schema Overview

The migrations will create the following tables:

- `users`: Stores user information including Auth0 authentication details, email, and profile data
- `roles`: Manages user roles with a many-to-many relationship to users

The schema includes automatic timestamps and unique identifiers for all records.


### Common Issues on Windows
- If pgAdmin doesn't open, try running it as administrator
- If the service doesn't start, check Windows Services (services.msc) and ensure "postgresql-x64-15" is running

### Common Issues on macOS

- If brew services start postgresql fails, try:

  ```bash
  rm /usr/local/var/postgres/postmaster.pid
  brew services restart postgresql
  ```
- If you get a "role does not exist" error, create your user role:
  ```bash
  createuser -s postgres
  ```

For additional help, consult the [PostgreSQL documentation](https://www.postgresql.org/docs/)
# API

Endpoints can be protected or public. Protected endpoints use `withAPIAuth` wrapper which validates Auth0 session, while public endpoints can be accessed without authentication.

#### User Synchronization
When users interact with Auth0 (login, signup), their Information is automatically synchronized with our database to maintain consistency between Auth0 and our system.

### Endpoints

## Users


Retrieve the logged user. Protected endpoint.
```http
GET /api/users/me
```

Retrieve all registered users. Protected endpoint.
```http
GET /api/users
```

Create a new user in the system. Protected endpoint.
```http
POST /api/users
```

Internal endpoint that handles the synchronization between Auth0 user data and our database. Public endpoint.
```http
POST /api/auth/sync
```

#### How to make an API call as we dont use accessTokens directly?

```typescript
// Example of fetching users from the API
const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users', {
      credentials: 'include' // Required for Auth0 session
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};
```

The `credentials: 'include'` option is required to send authentication cookies with the request.




## Utilities and Hooks

The template includes several utilities and hooks to streamline common tasks in your project:

### Authentication Utilities

### Custom Hooks

#### useAppUser
Enhanced version of Auth0's useUser hook that includes database user data.

```typescript
// Example usage
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

#### getServerAppUser 
Server Side version of the hook useAppUser

```typescript
// Example usage
import { getServerAppUser } from '@/utils/getServerAppUser';

function Profile() {
  const user = await getServerAppUser();
    
  return (
    <div>
      <h1>{user?.email}</h1>
      <p>{user?.dbData?.name}</p>
    </div>
  );
}
```

These utilities help maintain consistent authentication and user management across your application while reducing boilerplate code.
# Sentry

We use Sentry for error tracking and performance monitoring.

## Setup

1. Create account at [Sentry.io](https://sentry.io)
2. Create a new Next.js project in Sentry
3. Get your auth token:
   - Go to your Account Settings
   - Navigate to Auth Tokens
   - Click "Create New Token"
   - Copy the generated token
4. Get your DSN:
   - Go to Settings
   - Select Projects
   - Choose your project
   - Navigate to SDK Setup
   - Find and copy the DSN under "Client Keys (DSN)"

## Environment Variables

### Local Development

Create `.env.sentry-build-plugin` file:
```plaintext
# DO NOT commit this file to your repository!
# The SENTRY_AUTH_TOKEN variable is picked up by the Sentry Build Plugin.
# Used for uploading source maps during build time to get readable stack traces in production.
SENTRY_AUTH_TOKEN=[your-auth-token]
```

Add to your `.env`:
```plaintext
NEXT_PUBLIC_SENTRY_DSN=[your-dsn]
```

### Production Setup
For production deployments (e.g., Vercel), you can either:

1. Add `SENTRY_AUTH_TOKEN` directly in your deployment platform's environment variables:

2. Or add it to your existing `.env` file (ensure it's included in your deployment)

## Configuration

Sentry is automatically configured through `next.config.js` and `sentry.client.config.ts`/`sentry.server.config.ts`.

## Error Monitoring

Sentry will automatically capture:
- Unhandled exceptions
- API errors
- Client-side errors
- Performance metrics

## Custom Error Tracking

```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
}
```

## Example
Check out the Sentry example page at `/sentry-example-page` in your local environment.

For more details, visit [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/).
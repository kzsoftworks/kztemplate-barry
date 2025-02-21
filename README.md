# KZ Barry Template 🤖

Welcome to KZ Barry, a powerful Next.js template designed to streamline your development process. This template comes with an integrated AI assistant that will guide you through the entire setup and configuration process.

## 1. Setup with AI Assistant

### Prerequisites

#### Option 1: Recommended - Windsurf Editor

1. Download and install [Windsurf](https://www.codeium.com/windsurf), the world's first agentic IDE by Codeium
   - Built-in AI assistant support
   - Seamless template integration
   - Enhanced development experience

#### Option 2: Alternative - VS Code with Codeium

1. Install [VS Code or Codeium Extension](https://code.visualstudio.com/download)

#### Option 3: Alternative - Any Editor with an AI Agent

1. Cursor or Visual Studio Code with Github Copilot

⚠️ **Important Note for Free-Tier AI Users**: 
When using non-agentic AI assistants (free tier), it's recommended to copy and paste the content of `ASSISTANT_SETUP_GUIDE.md` directly into your conversation. This ensures more accurate and context-aware responses, avoiding potential errors or non-existent features.

### Setup Steps

1. Clone this template:

   ```bash
   git clone https://github.com/kzsoftworks/kztemplate-barry.git
   cd kztemplate-barry
   ```

2. Open the project in your chosen editor:

   **For Windsurf:**
   - Open Windsurf
   - Click 'Open Project' and select the cloned directory
   - The AI Assistant will automatically guide you through the setup

   or

   ```bash
   windsurf .
   ```

   **For VS Code:**
   ```bash
   code .
   ```
   - Open `ASSISTANT_SETUP_GUIDE.md`
   - Start the conversation with:
     ```
     "Hi! I'd like to set up this template. Can you help me get started?"
     ```

## How the AI Assistant Works

The AI Assistant is designed to provide:

💬 **Interactive Guidance**

- Real-time help with setup and configuration
- Answers to your questions about the template
- Troubleshooting assistance

🔍 **Automatic Verification**

- Checks if required tools are installed
- Validates your configuration
- Ensures best practices are followed

🛠 **Setup Automation**

- Helps run necessary commands
- Guides you through configuration
- Provides solutions to common issues

📖 **Documentation**

- Explains template features
- Provides usage examples
- Shares best practices

## Pro Tips for Using the AI Assistant

💡 **Pro tip**: The AI Assistant understands natural language, so feel free to ask questions like:

- "What do I need to install first?"
- "How do I set up Auth0?"
- "Can you help me deploy to Vercel?"
- "What should I do next?"

------------------------------------------------------------------------------------------------

## 2. Manual Setup

If you prefer to set up manually, follow these steps:

1. [Installation](#installation)
2. [Database Setup](#database-setup)
3. [Endpoints](#endpoints)
4. [User](#user-synchronization)
5. [Utilities and Hooks](#utilities-and-hooks)
6. [Sentry](#sentry)
7. [Vercel Deploy](#vercel-deployment)
8. [Help](#need-help)

## Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database
3. Update your `.env` with:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/your_database_name?schema=public"
   ```

### Option 2: Vercel with Neon

1. Create a project in [Vercel](https://vercel.com)
2. In your project settings, go to Storage
3. Click "Create Database" and select Neon
4. Copy the connection string to your `.env` file:
   ```
   DATABASE_URL="postgres://[user]:[password]@[endpoint]/[database]?sslmode=require"
   ```

### Run Migrations

Run these commands after setting up either database option:
```bash
npx prisma generate
npx prisma db push
```

### Database Schema Overview

The migrations will create the following tables:

- `users`: Stores user information including Auth0 authentication details, email, and profile data
- `roles`: Manages user roles with a many-to-many relationship to users

The schema includes automatic timestamps and unique identifiers for all records.


## Endpoints

Endpoints can be protected or public. Protected endpoints use `withAPIAuthRequired` wrapper which validates Auth0 session, while public endpoints can be accessed without authentication.

```typescript
import { authConfig } from '@/lib/auth0';

export const GET = authConfig.withApiAuthRequired(async () => {
 // Protected endpoint
});
```

## User Synchronization

When users interact with Auth0 (login, signup), their Information is automatically synchronized with our database to maintain consistency between Auth0 and our system.

### Users

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

Create `.env.sentry-build-plugin` file:
```plaintext
# DO NOT commit this file to your repository!
SENTRY_AUTH_TOKEN=[your-auth-token]
```

Add to your `.env`:
```plaintext
NEXT_PUBLIC_SENTRY_DSN=[your-dsn]
```

## Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure your environment variables:
   - Copy all variables from your `.env`
   - Update URLs to match your production domain
5. Deploy!

## Need Help?

If you have questions or run into issues:

1. Ask the AI Assistant! It's here to help
2. Check the troubleshooting section in `ASSISTANT_SETUP_GUIDE.md`
3. Contact the KZ team for additional support
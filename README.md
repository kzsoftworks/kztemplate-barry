# KZ Barry Template 🤖

Welcome to KZ Barry, a powerful Next.js template designed to streamline your development process. This template comes with an integrated AI assistant that will guide you through the entire setup and configuration process.

## Getting Started

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
   - The AI will guide you through:
     - Installing dependencies
     - Setting up authentication
     - Configuring your database
     - Deploying to production
     - And more!

   💡 **Pro tip**: The AI Assistant understands natural language, so feel free to ask questions like:

   - "What do I need to install first?"
   - "How do I set up Auth0?"
   - "Can you help me deploy to Vercel?"
   - "What should I do next?"

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

## Need Help?

If you have questions or run into issues:

1. Ask the AI Assistant! It's here to help
2. Check the troubleshooting section in `ASSISTANT_SETUP_GUIDE.md`
3. Contact the KZ team for additional support

### Database Schema Overview

The migrations will create the following tables:

- `users`: Stores user information including Auth0 authentication details, email, and profile data
- `roles`: Manages user roles with a many-to-many relationship to users

The schema includes automatic timestamps and unique identifiers for all records.

#### User Synchronization

When users interact with Auth0 (login, signup), their Information is automatically synchronized with our database to maintain consistency between Auth0 and our system.

### Endpoints

Endpoints can be protected or public. Protected endpoints use `withAPIAuth` wrapper which validates Auth0 session, while public endpoints can be accessed without authentication.

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

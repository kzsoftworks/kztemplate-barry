# KZ Template Barry - Interactive Setup Guide

This is an interactive guide for setting up the KZ Template Barry. This guide assumes you have already cloned the template repository and are currently in the project directory. Each section contains specific instructions and prompts that an AI assistant will use to help you configure and customize the template according to your needs.

## Guide Instructions for AI Assistant

As an AI assistant using this guide:

1. Assume the user has already cloned this template repository and is in the project directory
2. Always attempt to automatically verify and complete steps when possible
3. Only ask for user input when automatic verification is not possible or when user preference is required
4. Verify prerequisites in the order listed below
5. Provide clear instructions when manual user action is needed

## Template Information

- Source Repository: https://github.com/kzsoftworks/kztemplate-barry
- Branch to Use: `main`
- Stack: Next.js, TypeScript, Prisma, Auth0, Sentry

## Prerequisites

```yaml
prerequisites:
  node_js:
    required_version: 'LTS'
    verification_command: 'node --version'
    installation_guide: 'https://nodejs.org/'
    validation: 'Version should be current LTS'

  git:
    required_version: 'any'
    verification_command: 'git --version'
    installation_guide: 'https://git-scm.com/downloads'
    validation: 'Any version is acceptable, install latest if not present'

  postgresql:
    required_version: 'any'
    verification_command: 'which psql'
    installation_guide: 'Based on OS'
    validation: 'PostgreSQL must be installed locally for development'

  auth0:
    required: true
    setup_instructions:
      - "Create an Auth0 account at https://auth0.com/signup if you haven't already"
      - 'Once logged in, create a new application'
      - "Select 'Regular Web Application' type"
      - 'Choose Next.js from the technology options'
    required_data:
      - AUTH0_BASE_URL: 'Your local development URL (default: http://localhost:3000)'
      - AUTH0_CLIENT_ID: 'From Auth0 Application Settings'
      - AUTH0_CLIENT_SECRET: 'From Auth0 Application Settings'
      - AUTH0_SECRET: 'Same as AUTH0_CLIENT_SECRET'
      - AUTH0_ISSUER_BASE_URL: 'https:// + Your Auth0 domain'

  sentry:
    required: true
    verification: 'Automatic - Required for error tracking and monitoring'
    setup_guide: 'https://sentry.io/signup/'
    requirements:
      account:
        - 'Sentry.io account (free tier available)'
        - 'Organization admin access for token creation'
      permissions:
        - 'project:write scope for source map uploads'
        - 'project:read scope for error monitoring'
      system:
        - 'Node.js version compatible with @sentry/nextjs'
        - 'Webpack for source map generation'
    recommended_addons:
      - 'Performance monitoring'
      - 'Session replay'
      - 'Release tracking'
```

## Interactive Setup Process

### 1. Project Initialization

```yaml
step_id: init
automatic_checks:
  - node_version:
      command: 'node --version'
      validation: 'Compare with current LTS version'
      action_if_failed: 'Provide Node.js LTS installation instructions'

  - git_version:
      command: 'git --version'
      validation: 'Verify git is installed'
      action_if_failed: 'Provide git installation instructions'

  - postgresql:
      command: 'which psql'
      validation: 'Check if local PostgreSQL is installed'
      action_if_failed: 'Ask user if they prefer Vercel PostgreSQL'

required_input:
  repository_setup:
    description: 'Create a new repository for your project'
    steps:
      - 'Create a new empty repository on GitHub'
      - 'Share the repository URL with the assistant'
    note: 'Do not initialize with README, license, or .gitignore'

actions:
  pre_installation:
    - Verify Node.js LTS version
    - Verify git installation
    - Check PostgreSQL availability

  repository_configuration:
    description: 'Configure git remote with the new repository'
    input_required: 'Repository URL provided by user (e.g., https://github.com/username/repository)'
    steps:
      - Remove existing remote:
          command: 'git remote remove origin'
      - Convert HTTPS URL to SSH format:
          example:
            from: 'https://github.com/username/repository'
            to: 'git@github.com:username/repository.git'
      - Add new repository as origin:
          command: 'git remote add origin {converted_ssh_url}'
      - Push code to new repository:
          command: 'git push -u origin main'

  installation:
    - Install dependencies: npm install
    - Copy .env.example to .env

validation:
  repository:
    - 'Git remote is correctly configured'
    - 'Code is pushed to new repository'
    - 'Repository URL is recorded for Vercel deployment'
  environment:
    - 'Current directory contains template files'
    - 'Node modules installed'
    - '.env file exists'
    - 'Node.js version is LTS'
```

### 2. Auth0 Configuration (Required)

```yaml
step_id: auth0
automatic_setup:
  development_url:
    default: 'http://localhost:3000'
    validation: 'Must be a valid URL'

setup_steps:
  1_create_account:
    action: 'Direct user to https://auth0.com/signup'
    validation: 'User can log into Auth0 dashboard'

  2_create_application:
    instructions:
      - 'Go to Applications in the left panel'
      - "Click 'Create Application'"
      - 'Name your application (suggest using project name)'
      - "Select 'Regular Web Application'"
      - 'Choose Next.js from technology options'

  3_collect_credentials:
    required_data:
      AUTH0_BASE_URL:
        default: 'http://localhost:3000'
        location: 'Your local development URL'
      AUTH0_CLIENT_ID:
        location: 'Application Settings → Client ID'
      AUTH0_CLIENT_SECRET:
        location: 'Application Settings → Client Secret'
      AUTH0_SECRET:
        value: 'Same as AUTH0_CLIENT_SECRET'
      AUTH0_ISSUER_BASE_URL:
        template: 'https://{AUTH0_DOMAIN}'

  4_configure_callbacks:
    automatic: true
    actions:
      - 'Set Allowed Callback URLs to {AUTH0_BASE_URL}/api/auth/callback'
      - 'Set Allowed Logout URLs to {AUTH0_BASE_URL}'
      - 'Set Allowed Web Origins to {AUTH0_BASE_URL}'

  5_enable_authentication:
    instructions:
      - "Go to 'Authentication → Database' in Auth0 dashboard"
      - 'Enable Username-Password-Authentication'
      - 'Configure required settings'

validation:
  environment_variables:
    - 'All AUTH0_* variables are set in .env'
    - 'URLs follow correct format'
  application_settings:
    - 'Callback URLs are properly configured'
    - 'At least one authentication method is enabled'
```

### 3. Database Configuration

```yaml
step_id: database
required_input:
  - database_name: 'Name for your local development database'

actions:
    automatic_setup:
      - check_psql: 'which psql'
      - create_db: 'createdb [dbname]'
    database_url_format:
      template: 'postgres://{username}@localhost:5432/{project_name}_local'
      example: 'postgres://username@localhost:5432/myproject_local'
    required_data:
      - username: 'Your PostgreSQL username'
      - database_name: 'Name for your database (default: barry_local)'

  common:
    - Set DATABASE_URL in .env
    - Run database migrations: npx prisma db push

validation:
  local_setup:
    - 'PostgreSQL is installed and running (check with: pg_isready)'
    - 'Local database is created successfully'
    - 'Database connection string format is correct: postgres://{username}@localhost:5432/{database_name}'
    - 'Database is accessible (try: psql -d {database_name})'
    - 'Prisma migrations complete successfully (npx prisma db push)'
  note: 'Production database setup will be handled during Vercel deployment'
```

### 4. Error Tracking Setup (Optional)

```yaml
step_id: monitoring
automatic_checks:
  sentry_files:
    - sentry.client.config.ts
    - sentry.server.config.ts
    - sentry.edge.config.ts

setup_steps:
  1_create_account:
    action: 'Direct user to https://sentry.io/signup'
    validation: 'User can access Sentry dashboard'

  2_create_project:
    instructions:
      - "Click 'Create Project' in Sentry dashboard"
      - "Select 'Next.js' as your platform"
      - 'Name your project (use same name as your local project)'
      - 'Set alert preferences (optional)'

  3_collect_credentials:
    required_data:
      NEXT_PUBLIC_SENTRY_DSN:
        location: 'Project Settings → Client Keys (DSN)'
        description: 'Used to identify your project in Sentry'
      SENTRY_AUTH_TOKEN:
        location: 'User Settings → Auth Tokens'
        description: 'Used for source map uploads and releases'
        creation_steps:
          - 'Go to User Settings (click your profile)'
          - 'Navigate to Auth Tokens'
          - "Create new token with 'project:write' scope"

  4_configure_project:
    environment_setup:
      - 'Add Sentry variables to .env file using:'
      - 'echo "NEXT_PUBLIC_SENTRY_DSN=your_dsn\nSENTRY_AUTH_TOKEN=your_token" >> .env'
      - 'Ensure source maps are properly configured'
    sampling_rates:
      development:
        traces: 1.0
        replays_session: 0.1
        replays_on_error: 1.0
      production:
        traces: 0.1 # Adjust based on traffic
        replays_session: 0.1
        replays_on_error: 1.0

validation:
  config_files:
    - 'Verify Sentry initialization in client config'
    - 'Verify Sentry initialization in server config'
    - 'Verify Sentry initialization in edge config'
  environment:
    - 'NEXT_PUBLIC_SENTRY_DSN is set'
    - 'SENTRY_AUTH_TOKEN is set'
  functionality:
    test_routes:
      frontend:
        - 'Visit /sentry-example-page in your browser'
        - 'This page will trigger a test error automatically'
      api:
        - 'Test API error handling using:'
        - 'curl -X POST http://localhost:3000/api/sentry-example-api'
    verification:
      - 'Open your Sentry dashboard'
      - 'Verify both frontend and API errors appear'
      - 'Check error details and source maps are working'

troubleshooting:
  common_issues:
    missing_errors:
      - 'Check DSN is correctly set'
      - 'Verify sampling rates'
      - 'Check console for initialization errors'
    source_maps:
      - 'Verify SENTRY_AUTH_TOKEN permissions'
      - 'Check build configuration'
```

### 5. Vercel Deployment

```yaml
step_id: vercel_deployment
automatic_checks:
  required_files:
    - 'package.json'
    - '.env'

setup_steps:
  1_vercel_setup:
    description: 'Setting up Vercel deployment'
    prerequisites:
      - 'GitHub repository configured (from Project Initialization step)'
      - 'Vercel account created'
      - 'All environment variables ready'
    note: 'The deployment will use the GitHub repository you created earlier'

  2_deployment:
    steps:
      - 'Login to Vercel Dashboard'
      - 'Click "New Project"'
      - 'Import your GitHub repository'
      - 'Select the repository'
      - 'Configure project:'
        - 'Framework Preset: Next.js'
        - 'Root Directory: ./ (default)'
        - 'Build Command: next build (default)'

  3_environment_variables:
    description: 'Configure all environment variables in Vercel'
    auth0_setup:
      description: 'Create new Auth0 tenant for production'
      steps:
        - 'Create new Auth0 tenant (e.g., {project}-production)'
        - 'Create new Regular Web Application'
        - 'Select Next.js as the technology'
        - 'Collect the following credentials:'
          - 'Domain'
          - 'Client ID'
          - 'Client Secret'
          - 'Auth0 Secret (from Credentials tab)'
      note: 'Keep the production tenant separate from your development tenant for security'
    vercel_env_setup:
      description: 'Set up environment variables using Vercel CLI'
      instructions: 'For each command, first provide the value to paste, then run the command'
      command_sequence:
        - variable: 'AUTH0_DOMAIN'
          command: 'vercel env add AUTH0_DOMAIN production'
          instruction: 'When prompted, paste this value:'
          value_template: '{auth0_domain from previous step}'
        - variable: 'AUTH0_CLIENT_ID'
          command: 'vercel env add AUTH0_CLIENT_ID production'
          instruction: 'When prompted, paste this value:'
          value_template: '{client_id from previous step}'
        - variable: 'AUTH0_CLIENT_SECRET'
          command: 'vercel env add AUTH0_CLIENT_SECRET production'
          instruction: 'When prompted, paste this value:'
          value_template: '{client_secret from previous step}'
        - variable: 'AUTH0_SECRET'
          command: 'vercel env add AUTH0_SECRET production'
          instruction: 'When prompted, paste this value:'
          value_template: '{auth0_secret from previous step}'
        - variable: 'AUTH0_ISSUER_BASE_URL'
          command: 'vercel env add AUTH0_ISSUER_BASE_URL production'
          instruction: 'When prompted, paste this value:'
          value_template: 'https://{auth0_domain}'
        - variable: 'AUTH0_BASE_URL'
          command: 'vercel env add AUTH0_BASE_URL production'
          instruction: 'When prompted, paste this value:'
          value_template: 'https://[project-name].vercel.app'
          note: 'Use the same project name from your Vercel deployment URL. You can find this in your Vercel dashboard under the project name.'
    auth0_url_configuration:
      description: 'Update Auth0 application URLs'
      vercel_url_format: |
        After deploying to Vercel, your project will have a URL in the format:
        https://[project-name].vercel.app

        You can find this URL in your Vercel dashboard after the initial deployment.
        Example: https://barry.vercel.app
      urls_to_configure:
        callback_urls: 'https://[project-name].vercel.app/api/auth/callback'
        logout_urls: 'https://[project-name].vercel.app'
        web_origins: 'https://[project-name].vercel.app'
      note: 'Replace [project-name] with your actual project name as shown in your Vercel dashboard'
    database_setup:
      description: 'Set up Neon database for production'
      steps:
        - 'Go to Vercel project dashboard'
        - 'Click on "Storage" in sidebar'
        - 'Select "Connect Store" and choose "Neon"'
        - 'Follow setup process to create database'
        - 'Copy the provided DATABASE_URL'
      env_setup:
        - variable: 'DATABASE_URL'
          command: 'vercel env add DATABASE_URL production'
          instruction: 'When prompted, paste the Neon connection string'
          note: 'This will be your production database. Keep it separate from your development database.'

    additional_variables:
      sentry:
        - 'NEXT_PUBLIC_SENTRY_DSN'
        - 'SENTRY_AUTH_TOKEN'

  4_auth0_configuration:
    description: 'Update Auth0 configuration for production'
    steps:
      - 'Go to Auth0 Dashboard'
      - 'Update Application URIs:'
        - 'Allowed Callback URLs: https://[your-domain]/api/auth/callback'
        - 'Allowed Logout URLs: https://[your-domain]'

validation:
  deployment:
    - 'Verify deployment completes successfully'
    - 'Check application loads at production URL'
    - 'Test Auth0 login flow'
    - 'Verify Sentry error tracking'

troubleshooting:
  common_issues:
    build_failures:
      - 'Check build logs in Vercel dashboard'
      - 'Verify all environment variables are set'
    auth_errors:
      - 'Verify Auth0 callback URLs match production domain'
      - 'Check Auth0 application settings'
    database_connection:
      - 'Verify DATABASE_URL is correct'
      - 'Check database access permissions'
```

### 6. Development Environment

```yaml
step_id: dev_setup
actions:
  - Start development server: npm run dev
  - Open browser: http://localhost:3000
  - Verify all components
validation:
  - Server starts successfully (check terminal output)
  - Homepage loads correctly
  - Auth0 login button appears
  - Can log in successfully
  - Database queries work (check profile or other data-dependent pages)
  - Protected routes are accessible after login
  - No console errors in browser developer tools
```

## Completion Checklist

- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Auth0 configured (Required)
- [ ] Environment variables set
- [ ] Database connected and migrated
- [ ] Error tracking set up (if chosen)
- [ ] Development server running

## Troubleshooting Guide

```yaml
common_issues:
  auth0_setup:
    - Verify all Auth0 environment variables are set correctly
    - Check callback URLs match your development URL
    - Ensure at least one connection method is enabled
    - Confirm application type is 'Regular Web Application'

  database_connection:
    vercel:
      - Verify POSTGRES_PRISMA_URL format
      - Check Vercel project settings
    local:
      - Confirm PostgreSQL is running
      - Check database user permissions
      - Verify connection string format

  development_server:
    - Auth0 configuration issues
    - Database connection errors
    - Missing environment variables
```

Note: This guide is designed to be used with an AI assistant that will help you through each step, asking for necessary information and providing guidance based on your specific needs and responses.


# Kz Barry Template 

KzBarry is a base template designed to streamline the start of development projects. It reduces initial setup time and is available as a repository on Kaizen for use in production environments.


## Index  

- [Installation](#installation)
- [Authentication](#authentication)
- [How to Create and Connect to a Database](#how-to-create-and-connect-to-a-database)
- [](#)
## Installation

First we have to clone our template

```bash
  cd git clone https://github.com/kzsoftworks/kzBarry-nextjs-template.git
  
  npm install

  copy `.env.example` and rename it into: `.env` on the root proyect
```

## Authentication

At the moment, we only have Auth0 authentication. 

### Environment Variables (Auth0)

To run this project, you will need to add the following environment variables to your .env file

`AUTH0_CLIENT_ID`

`AUTH0_CLIENT_SECRET`

`AUTH0_SECRET`

`AUTH0_DOMAIN`

## How to Create and Connect the Project with Auth0

This guide will walk you through creating a project and connecting it with Auth0 for authentication.

First, we have to be logged in to an Auth0 account
    
Now we have to go to Application (on the left pannel, Create Application, select `Regular Web Applications` and finally `Next.js`)
    
Go the `Settings` panel.
    
    Now we have to copy the following properties into our .env
        Domain -> AUTH0_DOMAIN
        ClientID -> AUTH0_CLIENT_ID
        Client Secret -> AUTH0_CLIENT_SECRET
        APP_BASE_URL -> local URL. For example: http://localhost:3000
        Credentials > Client Secret -> AUTH0_SECRET
        
And on the same tab `Settings` we go down into `Application URIs`.
We set Allowed Callback URLs with: Our_local_base_url/api/auth/callback. 
For example: `http://localhost:3001/api/auth/callback`
    
And on `Allowed Logout URLs and Allowed Web Origins`: Our local base url For example: `http://localhost:3001`

And finally we have to enable at least one Authentication method on tab `Connections`




# How to Create and Connect to a Database

This guide will help you understand the steps needed to create a database and establish a connection to it with Vercel (postgres database)

We need to go to Vercel, then navigate to Storage and click the Create Database button. After that, we enter the database and copy the `psql` code into our .env file under the `DATABASE_URL` variable.

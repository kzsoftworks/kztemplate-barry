/// <reference types="node" />

declare namespace NodeJS {
  export interface ProcessEnv {
    APP_BASE_URL: string
    
    AUTH0_DOMAIN: string
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    AUTH0_SECRET: string

    // Roles assigned to the members of an organization
    AUTH0_ADMIN_ROLE_ID: string
    AUTH0_MEMBER_ROLE_ID: string

    // The default connection ID users will use to create an account with during onboarding
    DEFAULT_CONNECTION_ID: string

    // The namespace used to prefix custom claims
    CUSTOM_CLAIMS_NAMESPACE: string
  }
}

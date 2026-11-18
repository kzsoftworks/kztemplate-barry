import { describe, expect, it } from 'vitest';
import { getSiteUrl } from './site-url';

describe('getSiteUrl', () => {
  it('falls back to localhost', () => {
    expect(getSiteUrl({})).toBe('http://localhost:3000');
  });

  it('uses the explicit site URL and trims trailing slashes', () => {
    expect(
      getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://app.example.com/' })
    ).toBe('https://app.example.com');
  });

  it('points a Preview deployment at itself, not at production', () => {
    expect(
      getSiteUrl({
        VERCEL_ENV: 'preview',
        NEXT_PUBLIC_SITE_URL: 'https://app.example.com',
        VERCEL_BRANCH_URL: 'app-git-feature-team.vercel.app',
        VERCEL_URL: 'app-abc123-team.vercel.app'
      })
    ).toBe('https://app-git-feature-team.vercel.app');
  });

  it('uses the Vercel production URL when nothing explicit is set', () => {
    expect(
      getSiteUrl({
        VERCEL_ENV: 'production',
        VERCEL_PROJECT_PRODUCTION_URL: 'app.example.com',
        VERCEL_URL: 'app-abc123-team.vercel.app'
      })
    ).toBe('https://app.example.com');
  });
});

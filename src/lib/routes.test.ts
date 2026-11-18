import { describe, expect, it } from 'vitest';
import { isPublicPath, safeRedirectPath } from './routes';

describe('isPublicPath', () => {
  it.each(['/', '/login', '/sign-up', '/login/', '/auth/confirm', '/terms'])(
    'treats %s as public',
    (path) => {
      expect(isPublicPath(path)).toBe(true);
    }
  );

  it.each(['/profile', '/api/anything', '/loginx', '/settings/billing'])(
    'treats %s as private',
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    }
  );
});

describe('safeRedirectPath', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeRedirectPath('/settings?tab=1')).toBe('/settings?tab=1');
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'profile',
    '',
    null,
    undefined
  ])('rejects %s', (value) => {
    expect(safeRedirectPath(value)).toBe('/profile');
  });
});

import { describe, expect, it } from 'vitest';
import {
  checkPreviewBinding,
  projectRefFromUrl
} from '../../scripts/verify-preview-binding.mjs';

const previewEnv = {
  VERCEL_ENV: 'preview',
  NEXT_PUBLIC_SUPABASE_URL: 'https://branchref123.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  VERCEL_GIT_COMMIT_SHA: 'abc123'
};

describe('checkPreviewBinding', () => {
  it('does nothing outside Vercel Preview', () => {
    expect(checkPreviewBinding({})).toEqual({ status: 'skipped' });
    expect(checkPreviewBinding({ VERCEL_ENV: 'production' })).toEqual({
      status: 'skipped'
    });
  });

  it('fails a Preview that has no Supabase variables', () => {
    expect(() => checkPreviewBinding({ VERCEL_ENV: 'preview' })).toThrow(
      /missing NEXT_PUBLIC_SUPABASE_URL/
    );
    expect(() =>
      checkPreviewBinding({
        VERCEL_ENV: 'preview',
        NEXT_PUBLIC_SUPABASE_URL: previewEnv.NEXT_PUBLIC_SUPABASE_URL
      })
    ).toThrow(/missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it('fails a Preview bound to the production project', () => {
    expect(() =>
      checkPreviewBinding({
        ...previewEnv,
        SUPABASE_PROD_PROJECT_REF: 'branchref123'
      })
    ).toThrow(/PRODUCTION Supabase project/);
  });

  it('passes a Preview bound to its own branch, without leaking values', () => {
    const result = checkPreviewBinding({
      ...previewEnv,
      SUPABASE_PROD_PROJECT_REF: 'prodref999'
    });
    expect(result.status).toBe('ok');
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('sb_publishable_test');
    expect(serialized).not.toContain('branchref123');
    expect(serialized).toContain('"productionGuard":"checked"');
  });

  it('reports when the production guard is not configured', () => {
    const result = checkPreviewBinding(previewEnv);
    expect(result).toMatchObject({
      status: 'ok',
      report: { productionGuard: 'not-configured' }
    });
  });
});

describe('projectRefFromUrl', () => {
  it('takes the first host label', () => {
    expect(projectRefFromUrl('https://abcd1234.supabase.co')).toBe('abcd1234');
  });
});

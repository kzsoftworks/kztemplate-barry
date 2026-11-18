#!/usr/bin/env node
// Build guard for Vercel Preview deployments.
//
// A PR Preview must talk to its own Supabase preview branch. This script runs
// before `next build` and fails the build when a Preview deployment
//   1. has no Supabase variables (the integration has not synced them yet), or
//   2. points at the production Supabase project.
// Outside Vercel Preview it does nothing.
//
// It prints digests instead of values so the build log can prove which backend
// a deployment was bound to without leaking keys.

import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

function digest(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

/** Supabase project ref = first label of the project URL host. */
export function projectRefFromUrl(url) {
  return new URL(url).hostname.split('.')[0] ?? '';
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{ status: 'skipped' } | { status: 'ok', report: Record<string, unknown> }}
 * @throws {Error} when a Preview deployment is unbound or bound to production
 */
export function checkPreviewBinding(env) {
  if (env.VERCEL_ENV !== 'preview') return { status: 'skipped' };

  const required = (name) => {
    const value = env[name];
    if (!value) {
      throw new Error(
        `Preview deployment is missing ${name}. The Supabase integration ` +
          'syncs it when the pull request is opened and its preview branch is ' +
          'ready; redeploy once the branch exists.'
      );
    }
    return value;
  };

  const url = required('NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  const projectRef = projectRefFromUrl(url);
  const prodRef = env.SUPABASE_PROD_PROJECT_REF?.trim();

  if (prodRef && projectRef === prodRef) {
    throw new Error(
      'Preview deployment points at the PRODUCTION Supabase project. ' +
        'Previews must use their own Supabase preview branch.'
    );
  }

  return {
    status: 'ok',
    report: {
      vercelEnv: 'preview',
      commitSha: env.VERCEL_GIT_COMMIT_SHA ?? null,
      pullRequestId: env.VERCEL_GIT_PULL_REQUEST_ID || null,
      supabaseProjectRefDigest: digest(projectRef),
      supabasePublishableKeyDigest: digest(publishableKey),
      productionGuard: prodRef ? 'checked' : 'not-configured'
    }
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  try {
    const result = checkPreviewBinding(process.env);
    if (result.status === 'skipped') {
      console.log('preview-binding: skipped outside Vercel Preview');
    } else {
      if (result.report.productionGuard === 'not-configured') {
        console.warn(
          'preview-binding: SUPABASE_PROD_PROJECT_REF is not set, so the ' +
            'production check was not performed.'
        );
      }
      console.log(`preview-binding: ${JSON.stringify(result.report)}`);
    }
  } catch (error) {
    console.error(`preview-binding: ${error.message}`);
    process.exit(1);
  }
}

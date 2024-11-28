import { authConfig } from './lib/auth0';
import { buttonVariants } from './lib/components/ui/button';
import { SubmitButton } from './lib/components/ui/submit-button';
import { Auth0Logo } from './lib/components/ui/auth0-logo';
import { WelcomeBackCard } from './lib/components/ui/welcome-back-card';
import { SignUpForm } from './lib/components/ui/signup-form';
import { cn } from './lib/utils';

export default async function Home() {
  const session = await authConfig.getSession();

  return (
    <div className="container relative sm:grid h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {session?.user ? (
        <a
          href="/api/auth/logout"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8'
          )}
        >
          <SubmitButton>Logout</SubmitButton>
        </a>
      ) : (
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <span className="text-sm pr-3">Already joined? </span>{' '}
          <a className="text-sm underline" href="/api/auth/login">
            <SubmitButton> Log in</SubmitButton>
          </a>
        </div>
      )}

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Auth0Logo className="mr-2 size-8" />
          <span className="font-semibold">KzBarry</span>
        </div>
        <div className="relative z-20 m-auto max-w-sm text-center">
          <blockquote className="space-y-2">
            <div className="space-y-12">
              <p className="text-lg font-medium font-semibold">What is KzBarry?</p>
              <p className="text-sm">
                KzBarry consist on the creation of several templates of a tech stack that can be cloned to start a
                new project. This will significantly reduce the bootstrap time
                and enable the development team to focus most of their effort on
                business logic. It will save considerable time in releasing the
                initial prototype/MVP and allow Kaizen to decrease estimation
                time during the discovery phase of new projects, making client
                proposals more appealing.
              </p>
            </div>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex h-screen">
        {session?.user ? <WelcomeBackCard /> : <SignUpForm />}
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getServerAppUser();

  return (
    <div className="container relative sm:grid h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {session?.user ? (
        <a href="/api/auth/logout">Logout</a>
      ) : (
        <div>
          <span>Already joined? </span>
          <a href="/api/auth/login">Log in</a>
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
              <p className="text-lg font-medium font-semibold">
                What is KzBarry?
              </p>
              <p className="text-sm">
                KzBarry consist on the creation of several templates of a tech
                stack that can be cloned to start a new project. This will
                significantly reduce the bootstrap time and enable the
                development team to focus most of their effort on business
                logic. It will save considerable time in releasing the initial
                prototype/MVP and allow Kaizen to decrease estimation time
                during the discovery phase of new projects, making client
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

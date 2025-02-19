import { getServerAppUser } from '@/utils/getServerAppUser';

export default async function Home() {
  const session = await getServerAppUser();

  return (
    <div>
      {session?.user ? (
        <a href="/api/auth/logout">Logout</a>
      ) : (
        <div>
          <span>Already joined? </span>
          <a href="/api/auth/login">Log in</a>
        </div>
      )}

      <h1>KzBarry</h1>
      <h2>What is KzBarry?</h2>
      <p>
        KzBarry consist on the creation of several templates of a tech stack
        that can be cloned to start a new project. This will significantly
        reduce the bootstrap time and enable the development team to focus most
        of their effort on business logic. It will save considerable time in
        releasing the initial prototype/MVP and allow Kaizen to decrease
        estimation time during the discovery phase of new projects, making
        client proposals more appealing.
      </p>

      {session?.user ? <WelcomeBackCard /> : <SignUpForm />}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head></head>
      <body>
        <div>
          <div>
            <h1>Layout Page</h1>
          </div>
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}

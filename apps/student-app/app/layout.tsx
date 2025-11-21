import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>IvyLevel Assessment</title>
        <meta name="description" content="IvyLevel Student Assessment Platform" />
      </head>
      <body>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          {children}
        </div>
      </body>
    </html>
  );
}

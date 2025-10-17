export const metadata = {
  title: 'Job Importer Admin',
  description: 'Import history and controls',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold mb-6">Job Importer Admin</h1>
          {children}
        </div>
      </body>
    </html>
  );
}



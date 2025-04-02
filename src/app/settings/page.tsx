'use client';

import NavBar from '@/components/NavBar';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="bg-white min-h-screen">
      <NavBar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">⚙️ Innstillinger</h1>

        <div className="space-y-4">
          <Link
            href="/settings/users"
            className="block bg-blue-600 text-white px-5 py-4 rounded-lg hover:bg-blue-700 shadow transition duration-200"
          >
            👤 Administrer brukere
          </Link>

          <Link
            href="/settings/bathrooms"
            className="block bg-blue-600 text-white px-5 py-4 rounded-lg hover:bg-blue-700 shadow transition duration-200"
          >
            🚿 Administrer bad-fordeling
          </Link>

          <Link
            href="/settings/tasks"
            className="block bg-blue-600 text-white px-5 py-4 rounded-lg hover:bg-blue-700 shadow transition duration-200"
          >
            ✅ Administrer Oppgaver
          </Link>

          <Link
            href="/settings/weekly-tasks"
            className="block bg-blue-600 text-white px-5 py-4 rounded-lg hover:bg-blue-700 shadow transition duration-200"
          >
            🧽 Administrer ukesoppgaver
          </Link>
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-6">
        Laget av <span className="font-medium">Luka Grujic</span> •{' '}
        <a
          href="https://github.com/gruluk/vaskeliste"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          GitHub-repo
        </a>
      </footer>
    </div>
  );
}

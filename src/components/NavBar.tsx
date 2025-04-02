'use client';

import Link from 'next/link';

export default function NavBar() {
  return (
    <div className="sticky top-0 z-50 bg-black border-b shadow-sm px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-white hover:underline">
        Beste kollektivet ✨
      </Link>
      <Link
        href="/settings"
        className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
      >
        ⚙️
      </Link>
    </div>
  );
}

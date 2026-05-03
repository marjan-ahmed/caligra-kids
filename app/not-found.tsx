import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-sky-100 font-fredoka">
      <h1 className="text-6xl font-black text-indigo-600 mb-4">404</h1>
      <p className="text-2xl text-indigo-900/80 mb-8">Oops! We couldn&apos;t find that page.</p>
      <Link 
        href="/"
        className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}

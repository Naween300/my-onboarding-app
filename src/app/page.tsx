import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to SME Onboarding
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get your business set up in just 3 simple steps
        </p>
        <Link
          href="/onboarding"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Start Onboarding
        </Link>
      </div>
    </div>
  );
}
import { getAllCountries } from '@/lib/api';
import CountryListContainer from '@/components/shared/CountryListContainer';

export default async function Home() {
  try {
    // Fetch countries data at build time (SSG)
    const countries = await getAllCountries();

    return (
      <main className="min-h-screen bg-gray-50">
        <CountryListContainer countries={countries} />
      </main>
    );
  } catch (error) {
    // Error fallback UI
    console.error('Failed to load countries:', error);
    
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Unable to Load Countries
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            We&apos;re having trouble fetching country data. Please try again later.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }
}


import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { JobListing } from '../types';
import { getInternships } from '../services/jobService';

const InternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{ keywords: string; location: string; jobType: string }>({
    keywords: '',
    location: '',
    jobType: '', // Will default to Internship type on backend if applicable, or filter client-side
  });

  const fetchInternships = useCallback(async (filters: { keywords: string; location: string; jobType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Modify filters to ensure we only get internships, or rely on the service to do so
      const internshipFilters = { ...filters, jobType: 'Internship' };
      const fetchedInternships = await getInternships(internshipFilters);
      setInternships(fetchedInternships);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      setError("Failed to load internship listings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternships(searchFilters);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters]);

  const handleSearch = (filters: { keywords: string; location: string; jobType: string }) => {
    setSearchFilters(filters);
  };

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-sky-300">Internship Opportunities</h1>
        <p className="text-lg text-gray-400 mt-2">Kickstart your career with valuable experience.</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner message="Fetching internship listings..." />
      ) : internships.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {internships.map(internship => (
            <JobCard key={internship.id} job={internship} />
          ))}
        </div>
      ) : (
         <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-500 mx-auto mb-4">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300">No Internships Found</h3>
          <p className="text-gray-400 mt-2">
            No internship listings match your current criteria. Try broadening your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default InternshipsPage;

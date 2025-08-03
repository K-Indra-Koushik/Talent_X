
import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { JobListing } from '../types';
import { getJobs } from '../services/jobService';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{ keywords: string; location: string; jobType: string }>({
    keywords: '',
    location: '',
    jobType: '',
  });

  const fetchJobs = useCallback(async (filters: { keywords: string; location: string; jobType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedJobs = await getJobs(filters);
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load job listings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(searchFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters]); // We want to refetch when searchFilters change. fetchJobs is memoized.

  const handleSearch = (filters: { keywords: string; location: string; jobType: string }) => {
    setSearchFilters(filters);
  };

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-sky-300">Job Opportunities</h1>
        <p className="text-lg text-gray-400 mt-2">Discover your next career move.</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner message="Fetching job listings..." />
      ) : jobs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300">No Jobs Found</h3>
          <p className="text-gray-400 mt-2">
            No job listings match your current criteria. Try broadening your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobsPage;


import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import CompanyCard from '../components/CompanyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { JobListing, Company } from '../types';
import { getFeaturedJobs, getFeaturedInternships, getFeaturedCompanies } from '../services/jobService';
import { Link } from 'react-router-dom';

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const HomePage: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([]);
  const [featuredInternships, setFeaturedInternships] = useState<JobListing[]>([]);
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobs, internships, companies] = await Promise.all([
          getFeaturedJobs(3),
          getFeaturedInternships(2),
          getFeaturedCompanies(4)
        ]);
        setFeaturedJobs(jobs);
        setFeaturedInternships(internships);
        setFeaturedCompanies(companies);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (filters: { keywords: string; location: string; jobType: string }) => {
    // For HomePage, search might redirect to JobsPage with query params or store in context
    console.log("Search triggered on HomePage:", filters);
    // Potentially navigate to /jobs or /internships with filters
    // For now, just log it. A real implementation would pass these to the respective pages.
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-r from-sky-700/30 via-transparent to-indigo-700/30 rounded-xl shadow-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-indigo-300">
          Find Your Next <span className="text-sky-400">Opportunity</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Career Compass Hub connects you with top jobs, internships, and AI-powered tools to supercharge your career.
        </p>
        <div className="max-w-3xl mx-auto px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Jobs */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-sky-300">Featured Jobs</h2>
          <Link to="/jobs" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center">
            View All Jobs <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
        {loading ? <LoadingSpinner message="Loading jobs..." /> : (
          featuredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : <p className="text-gray-400">No featured jobs available at the moment.</p>
        )}
      </section>

      {/* Featured Internships */}
      <section>
         <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-sky-300">Featured Internships</h2>
          <Link to="/internships" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center">
            View All Internships <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
        {loading ? <LoadingSpinner message="Loading internships..." /> : (
          featuredInternships.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {featuredInternships.map(internship => <JobCard key={internship.id} job={internship} />)}
            </div>
          ) : <p className="text-gray-400">No featured internships available at the moment.</p>
        )}
      </section>

      {/* Featured Companies */}
      <section>
        <h2 className="text-3xl font-bold text-sky-300 mb-8">Featured Companies</h2>
        {loading ? <LoadingSpinner message="Loading companies..." /> : (
          featuredCompanies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredCompanies.map(company => <CompanyCard key={company.id} company={company} />)}
            </div>
           ) : <p className="text-gray-400">No featured companies available at the moment.</p>
        )}
      </section>
      
      {/* Call to Action for Services */}
      <section className="py-16 bg-slate-800/50 rounded-xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-sky-300 mb-4">Elevate Your Career with AI</h2>
        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
          Utilize our AI-powered services like Resume Analysis, ATS Compatibility Score, and Mock Interviews to stand out.
        </p>
        <Link 
          to="/services" 
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Explore Our Services
        </Link>
      </section>
    </div>
  );
};

export default HomePage;

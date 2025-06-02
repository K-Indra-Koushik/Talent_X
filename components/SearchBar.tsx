
import React, { useState } from 'react';
import { JobType } from '../types';
import { JOB_TYPES_OPTIONS } from '../constants';

interface SearchBarProps {
  onSearch: (filters: { keywords: string; location: string; jobType: string }) => void;
}

const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);


const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keywords, location, jobType });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-slate-800/70 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4"
    >
      <div className="flex-grow">
        <label htmlFor="keywords" className="block text-sm font-medium text-sky-300 mb-1">
          Keywords (Title, Company, Skills)
        </label>
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., Software Engineer, Google, React"
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
        />
      </div>
      <div className="flex-grow">
        <label htmlFor="location" className="block text-sm font-medium text-sky-300 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., San Francisco, Remote"
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
        />
      </div>
      <div className="flex-grow">
        <label htmlFor="jobType" className="block text-sm font-medium text-sky-300 mb-1">
          Job Type
        </label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow appearance-none bg-no-repeat bg-right pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}

        >
          <option value="">All Types</option>
          {JOB_TYPES_OPTIONS.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full md:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
        <span>Search</span>
      </button>
    </form>
  );
};

export default SearchBar;

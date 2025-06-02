
import React from 'react';
import { Company } from '../types';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-slate-800 shadow-lg rounded-lg p-6 flex flex-col items-center text-center hover:shadow-sky-500/30 transition-shadow duration-300">
      <img src={company.logoUrl} alt={`${company.name} logo`} className="w-20 h-20 rounded-full object-contain mb-4 bg-white p-2" />
      <h3 className="text-lg font-semibold text-sky-400 mb-1">{company.name}</h3>
      {company.activeListings !== undefined && (
        <p className="text-sm text-gray-400">{company.activeListings} active listings</p>
      )}
      <button className="mt-4 bg-slate-700 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
        View Company
      </button>
    </div>
  );
};

export default CompanyCard;

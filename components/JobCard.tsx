
import React from 'react';
import { JobListing, JobType } from '../types';

interface JobCardProps {
  job: JobListing;
}

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-10.5a2.25 2.25 0 01-2.25-2.25V14.15M16.5 18.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V21zm0 2.25h.008v.008h-.008v-.008zm-4.5-2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V21zm0 2.25h.008v.008h-.008v-.008zM9 18.75h.008v.008H9v-.008zm0 2.25h.008v.008H9V21zm0 2.25h.008v.008H9v-.008zm-4.5-2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V21zm0 2.25h.008v.008h-.008v-.008zM12 3.75l-3.75 3.75M12 3.75l3.75 3.75M12 3.75V11.25m1.5 5.25h-3A2.25 2.25 0 008.25 18v1.5a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25v-1.5A2.25 2.25 0 0013.5 16.5z" />
  </svg>
);

const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
</svg>
);


const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { title, company, companyLogo, location, type, postedDate, description, skills } = job;

  const getJobTypeClass = (jobType: JobType) => {
    switch (jobType) {
      case JobType.FULL_TIME: return 'bg-green-500 text-green-50';
      case JobType.PART_TIME: return 'bg-yellow-500 text-yellow-50';
      case JobType.CONTRACT: return 'bg-blue-500 text-blue-50';
      case JobType.INTERNSHIP: return 'bg-purple-500 text-purple-50';
      default: return 'bg-gray-500 text-gray-50';
    }
  };

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-6 hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {companyLogo ? (
              <img src={companyLogo} alt={`${company} logo`} className="w-12 h-12 rounded-full object-contain bg-white p-1" />
            ) : (
              <span className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-sky-400">
                <BriefcaseIcon className="w-6 h-6" />
              </span>
            )}
            <div>
              <h3 className="text-xl font-semibold text-sky-400">{title}</h3>
              <p className="text-sm text-gray-400">{company}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getJobTypeClass(type)}`}>
            {type}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <MapPinIcon className="w-4 h-4 mr-2 text-sky-500" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDaysIcon className="w-4 h-4 mr-2 text-sky-500" />
            Posted: {new Date(postedDate).toLocaleDateString()}
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4 line-clamp-3">{description}</p>
        
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-400 mb-1">Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 5).map(skill => (
                <span key={skill} className="px-2 py-1 bg-slate-700 text-xs text-sky-300 rounded-md">{skill}</span>
              ))}
              {skills.length > 5 && <span className="text-xs text-gray-400 self-center">+{skills.length - 5} more</span>}
            </div>
          </div>
        )}
      </div>

      <button className="w-full mt-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
        View Details & Apply
      </button>
    </div>
  );
};

export default JobCard;

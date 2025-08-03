
import { JobListing, JobType, Company } from '../types';

const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Innovatech Solutions',
    companyLogo: 'https://picsum.photos/seed/innovatech/100/100',
    location: 'San Francisco, CA',
    type: JobType.FULL_TIME,
    description: 'Join our dynamic team to build cutting-edge web applications using React, TypeScript, and GraphQL. Lead frontend development efforts and mentor junior engineers.',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    salaryRange: '$150,000 - $180,000',
    skills: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'TailwindCSS', 'Jest'],
  },
  {
    id: '2',
    title: 'Product Marketing Manager',
    company: 'MarketPro Inc.',
    companyLogo: 'https://picsum.photos/seed/marketpro/100/100',
    location: 'New York, NY',
    type: JobType.FULL_TIME,
    description: 'Develop and execute marketing strategies for new product launches. Conduct market research and collaborate with sales and product teams.',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    skills: ['Marketing Strategy', 'Product Launch', 'Market Research', 'SEO', 'Content Marketing'],
  },
  {
    id: '3',
    title: 'UX/UI Designer (Contract)',
    company: 'Creative Visions Agency',
    companyLogo: 'https://picsum.photos/seed/creativevisions/100/100',
    location: 'Remote',
    type: JobType.CONTRACT,
    description: 'Design intuitive and visually appealing user interfaces for web and mobile applications. Create wireframes, prototypes, and high-fidelity mockups.',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    salaryRange: '$70 - $90 / hour',
    skills: ['UX Design', 'UI Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
  },
  {
    id: '4',
    title: 'Data Science Intern',
    company: 'DataDriven Corp',
    companyLogo: 'https://picsum.photos/seed/datadriven/100/100',
    location: 'Austin, TX',
    type: JobType.INTERNSHIP,
    description: 'Work on real-world data science projects, including data cleaning, analysis, and model building. Learn from experienced data scientists.',
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Data Analysis', 'Statistics'],
  },
   {
    id: '5',
    title: 'Backend Developer (Python/Django)',
    company: 'ScaleFast Ltd.',
    companyLogo: 'https://picsum.photos/seed/scalefast/100/100',
    location: 'Remote',
    type: JobType.FULL_TIME,
    description: 'Design, develop, and maintain scalable backend services and APIs using Python and Django. Work with databases and cloud infrastructure.',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    salaryRange: '$120,000 - $150,000',
    skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    id: '6',
    title: 'Marketing Intern',
    company: 'GrowthHackers Co.',
    companyLogo: 'httpsum.photos/seed/growthhackers/100/100',
    location: 'Boston, MA (Hybrid)',
    type: JobType.INTERNSHIP,
    description: 'Assist the marketing team with social media campaigns, content creation, and market analysis. Gain hands-on experience in digital marketing.',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ['Social Media Marketing', 'Content Creation', 'Google Analytics', 'SEO Basics'],
  },
];

const MOCK_INTERNSHIPS: JobListing[] = MOCK_JOBS.filter(job => job.type === JobType.INTERNSHIP);
const MOCK_NON_INTERNSHIPS: JobListing[] = MOCK_JOBS.filter(job => job.type !== JobType.INTERNSHIP);


export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Innovatech Solutions', logoUrl: 'https://picsum.photos/seed/innovatech/100/100', activeListings: MOCK_JOBS.filter(j => j.company === 'Innovatech Solutions').length },
  { id: 'c2', name: 'MarketPro Inc.', logoUrl: 'https://picsum.photos/seed/marketpro/100/100', activeListings: MOCK_JOBS.filter(j => j.company === 'MarketPro Inc.').length },
  { id: 'c3', name: 'Creative Visions Agency', logoUrl: 'https://picsum.photos/seed/creativevisions/100/100', activeListings: MOCK_JOBS.filter(j => j.company === 'Creative Visions Agency').length },
  { id: 'c4', name: 'DataDriven Corp', logoUrl: 'https://picsum.photos/seed/datadriven/100/100', activeListings: MOCK_JOBS.filter(j => j.company === 'DataDriven Corp').length },
  { id: 'c5', name: 'ScaleFast Ltd.', logoUrl: 'https://picsum.photos/seed/scalefast/100/100', activeListings: MOCK_JOBS.filter(j => j.company === 'ScaleFast Ltd.').length },
];


const filterListings = (listings: JobListing[], filters: { keywords?: string; location?: string; jobType?: string }): JobListing[] => {
  return listings.filter(job => {
    const keywordMatch = !filters.keywords || 
      job.title.toLowerCase().includes(filters.keywords.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.keywords.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.keywords.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(filters.keywords!.toLowerCase()));
    
    const locationMatch = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const jobTypeMatch = !filters.jobType || job.type === filters.jobType;

    return keywordMatch && locationMatch && jobTypeMatch;
  });
};


export const getJobs = async (filters: { keywords?: string; location?: string; jobType?: string } = {}): Promise<JobListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return filterListings(MOCK_NON_INTERNSHIPS, filters);
};

export const getInternships = async (filters: { keywords?: string; location?: string; jobType?: string } = {}): Promise<JobListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return filterListings(MOCK_INTERNSHIPS, filters);
};

export const getAllListings = async (filters: { keywords?: string; location?: string; jobType?: string } = {}): Promise<JobListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return filterListings(MOCK_JOBS, filters);
};

export const getFeaturedJobs = async (limit: number = 3): Promise<JobListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_NON_INTERNSHIPS.slice(0, limit);
};

export const getFeaturedInternships = async (limit: number = 2): Promise<JobListing[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_INTERNSHIPS.slice(0, limit);
};

export const getFeaturedCompanies = async (limit: number = 4): Promise<Company[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_COMPANIES.slice(0, limit);
};

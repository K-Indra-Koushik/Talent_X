
export interface NavLinkItem {
  name: string;
  path: string;
  authRequired?: boolean;
  hideWhenAuth?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  // other profile info
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  TEMPORARY = 'Temporary',
  INTERNSHIP = 'Internship',
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: JobType;
  description: string;
  postedDate: string; // ISO string
  salaryRange?: string;
  skills: string[];
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  activeListings?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode; // For SVG icons
  detailsComponent?: React.ReactNode; // For interactive elements on Services page
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, token: string) => void;
  logout: () => void;
  signup: (email: string, token: string) => void; // Simplified for mock
}

export interface ResumeFile {
  id: string;
  name: string;
  uploadDate: string; // ISO string
  isPrimary: boolean;
  content?: string; // Store resume text content for AI analysis
}

export interface CodingProfile {
  platform: 'LeetCode' | 'CodeChef' | 'HackerRank' | 'GitHub';
  username: string;
  url: string;
  summary?: string; // e.g., "Solved: 150 | Contributions: 500+"
}

export interface ApplicationHistoryItem {
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string; // ISO string
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
}

// Gemini Service related types
export interface GeminiAnalysisResult {
  feedback: string;
  suggestions?: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // other types of chunks if applicable
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other metadata fields
}

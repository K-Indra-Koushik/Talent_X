
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

// Structure for detailed breakdown of ATS parameters
export interface AtsParameterScore {
  parameterName: string; // e.g., "Keyword Matching", "Experience Match"
  score?: number; // Optional: 0-100 for this parameter
  status?: string; // e.g., "Strong Match", "Partial Match", "Needs Improvement"
  feedback: string; // Markdown formatted explanation of how the parameter was evaluated
  recommendation?: string; // Markdown formatted actionable advice for this parameter
}

export interface GeminiAnalysisResult {
  feedback: string; // Main feedback, could include overall summary.
  suggestions?: string[]; // General suggestions or list of main points.
  detailedBreakdown?: AtsParameterScore[]; // For structured parameter-wise feedback from ATS Score Calculator.
  overallScore?: number; // Explicit field for overall ATS score (0-100).
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


import { NavLinkItem, JobType } from './types';

export const APP_NAME = "Talent X";

export const NAV_LINKS: NavLinkItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Jobs', path: '/jobs' },
  { name: 'Internships', path: '/internships' },
  { name: 'Services', path: '/services' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Login/Sign Up', path: '/auth', hideWhenAuth: true },
  { name: 'Profile', path: '/profile', authRequired: true },
];

export const JOB_TYPES_OPTIONS = Object.values(JobType);

export const MOCK_API_KEY = "YOUR_GEMINI_API_KEY"; // Placeholder, should be in .env

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';
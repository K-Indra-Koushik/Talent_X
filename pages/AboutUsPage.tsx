
import React from 'react';
import { APP_NAME } from '../constants';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-8 md:p-12 prose prose-invert max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-sky-300 mb-6 text-center">About {APP_NAME}</h1>
      
      <p className="text-lg text-gray-300 leading-relaxed">
        Welcome to {APP_NAME}, your dedicated partner in navigating the dynamic landscape of career opportunities. 
        Our mission is to empower job seekers and professionals by providing a comprehensive platform that combines extensive job and internship listings with cutting-edge AI-powered tools.
      </p>

      <h2 className="text-2xl font-bold text-sky-400 mt-8 mb-4">Our Vision</h2>
      <p className="text-gray-300 leading-relaxed">
        We envision a world where everyone has the resources and insights to achieve their career aspirations. 
        {APP_NAME} aims to be the bridge between talent and opportunity, making the job search process more efficient, informed, and successful.
      </p>

      <h2 className="text-2xl font-bold text-sky-400 mt-8 mb-4">What We Offer</h2>
      <ul className="list-disc list-outside space-y-2 text-gray-300 pl-5 leading-relaxed">
        <li>
          <strong>Comprehensive Listings:</strong> Access to a wide range of job and internship opportunities across various industries and locations.
        </li>
        <li>
          <strong>AI-Powered Resume Analyzer:</strong> Get detailed feedback on your resume to highlight your strengths and identify areas for improvement.
        </li>
        <li>
          <strong>Job Match Percentage:</strong> Understand how well your profile aligns with specific job descriptions, helping you tailor your applications.
        </li>
        <li>
          <strong>ATS Compatibility Score:</strong> Optimize your resume for Applicant Tracking Systems and increase your chances of getting noticed with a precise score.
        </li>
        <li>
          <strong>AI Mock Interviews:</strong> Practice your interview skills with AI-driven simulations and receive constructive feedback to build your confidence.
        </li>
        <li>
          <strong>Personalized Profile:</strong> Manage your resumes, track applications, and link your coding profiles all in one place.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-sky-400 mt-8 mb-4">Our Commitment</h2>
      <p className="text-gray-300 leading-relaxed">
        At {APP_NAME}, we are committed to providing a user-friendly, secure, and highly effective platform. We continuously strive to innovate and enhance our services to meet the evolving needs of the job market. 
        Your career success is our priority.
      </p>

      <p className="text-center mt-10 text-gray-400">
        Join {APP_NAME} today and take the next step towards your dream career!
      </p>
    </div>
  );
};

export default AboutUsPage;

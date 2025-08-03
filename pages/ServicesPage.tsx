import React, { useState, useRef } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Service as ServiceType, GeminiAnalysisResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { 
  analyzeResumeWithGemini, 
  getPercentageMatchWithGemini,
  getAtsScoreEstimateWithGemini,
  generateAiMockInterviewQuestions
} from '../services/geminiService';
import { extractTextFromFile } from '../utils/fileUtils';

// Icons for services
const DocumentMagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52c2.625.98 4.5 3.374 4.5 6.25s-1.875 5.27-4.5 6.25m-16.5 0c-2.625-.98-4.5-3.374-4.5-6.25s1.875-5.27 4.5-6.25m7.5 12.75c-1.506 0-3.017-.17-4.5-.518m7.5 0c1.506 0 3.017-.17 4.5-.518M4.5 5.47c1.01.143 2.01.317 3 .52m-.002 0A48.658 48.658 0 0112 4.5c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m0 0c-2.625.98-4.5-3.374-4.5-6.25s1.875 5.27 4.5 6.25M12 12.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);
const DocumentChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>
);
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const SERVICES_DATA: ServiceType[] = [
  { id: 'resumeAnalyzer', title: 'Resume Analyzer', description: 'Upload your resume (PDF/TXT) and get AI-powered feedback on structure, keywords, and common errors.', icon: <DocumentMagnifyingGlassIcon /> },
  { id: 'percentageMatch', title: 'Percentage Match', description: 'Upload your resume (PDF/TXT) and paste a job description to see a compatibility score.', icon: <ScaleIcon /> },
  { id: 'atsScore', title: 'ATS Score Estimator', description: 'Upload your resume (PDF/TXT) to get an estimate of its ATS compatibility and optimization tips.', icon: <DocumentChartBarIcon /> },
  { id: 'aiMockInterview', title: 'AI Mock Interview', description: 'Practice interview questions tailored to specific job roles or industries (basic question generation).', icon: <MicrophoneIcon /> },
];

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [resumeText, setResumeText] = useState(''); // For resume content (from file or pasted)
  const [jobDescriptionText, setJobDescriptionText] = useState(''); // For percentage match
  const [jobRoleText, setJobRoleText] = useState(''); // For AI mock interview
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeminiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleServiceSelect = (serviceId: string) => {
    const service = SERVICES_DATA.find(s => s.id === serviceId);
    setSelectedService(service || null);
    setResult(null);
    setError(null);
    setResumeText('');
    setJobDescriptionText('');
    setJobRoleText('');
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      try {
        const text = await extractTextFromFile(file);
        setResumeText(text);
      } catch (err) {
        console.error("Error extracting text from file:", err);
        setError(err instanceof Error ? err.message : "Failed to process file.");
        setResumeText('');
        setFileName(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    let currentInputText = '';
    if (['resumeAnalyzer', 'percentageMatch', 'atsScore'].includes(selectedService.id)) {
        currentInputText = resumeText;
    } else if (selectedService.id === 'aiMockInterview') {
        currentInputText = jobRoleText;
    }
    
    if (!currentInputText) {
      setError(`Please provide the required input for ${selectedService.title}.`);
      return;
    }
    
    if (selectedService.id === 'percentageMatch' && !jobDescriptionText) {
        setError("Please provide both resume text and job description for Percentage Match.");
        return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    let apiResult: GeminiAnalysisResult = { feedback: "Service not implemented yet." };

    try {
      switch (selectedService.id) {
        case 'resumeAnalyzer':
          apiResult = await analyzeResumeWithGemini(resumeText);
          break;
        case 'percentageMatch':
          apiResult = await getPercentageMatchWithGemini(resumeText, jobDescriptionText);
          break;
        case 'atsScore':
          apiResult = await getAtsScoreEstimateWithGemini(resumeText);
          break;
        case 'aiMockInterview':
          apiResult = await generateAiMockInterviewQuestions(jobRoleText);
          break;
        default:
          setError("Selected service is not recognized.");
          setIsLoading(false);
          return;
      }
      setResult(apiResult);
    } catch (err) {
      console.error(`Error with ${selectedService.title}:`, err);
      setError(`Failed to process your request for ${selectedService.title}. Please try again.`);
      setResult({ feedback: `Error: ${err instanceof Error ? err.message : String(err)}`});
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderServiceUI = () => {
    if (!selectedService) return null;

    const needsResumeInput = ['resumeAnalyzer', 'percentageMatch', 'atsScore'].includes(selectedService.id);

    return (
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-xl">
        <button 
          onClick={() => setSelectedService(null)} 
          className="mb-4 text-sm text-sky-400 hover:text-sky-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Services
        </button>
        <h3 className="text-2xl font-semibold text-sky-400 mb-4">{selectedService.title}</h3>
        <p className="text-gray-400 mb-4 text-sm">{selectedService.description}</p>

        {needsResumeInput && (
            <div className="mb-4">
                <label htmlFor="resume-file-input" className="block text-sm font-medium text-sky-300 mb-1">
                    Upload Resume (PDF or TXT):
                </label>
                <input
                    type="file"
                    id="resume-file-input"
                    ref={fileInputRef}
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 mb-2"
                />
                {fileName && <p className="text-xs text-gray-500 mb-2">Selected file: {fileName}</p>}
                 <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste your resume text here. File upload will populate this field."
                    rows={selectedService.id === 'percentageMatch' ? 5 : 10}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-2 focus:ring-sky-500"
                 />
            </div>
        )}

        {selectedService.id === 'percentageMatch' && (
          <div className="mb-4">
            <label htmlFor="job-desc-text" className="block text-sm font-medium text-sky-300 mb-1">
                Paste Job Description Text:
            </label>
            <textarea
                id="job-desc-text"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the Job Description Text Here..."
                rows={5}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        )}

        {selectedService.id === 'aiMockInterview' && (
            <div className="mb-4">
                <label htmlFor="job-role-text" className="block text-sm font-medium text-sky-300 mb-1">
                    Job Role / Industry:
                </label>
                <input
                    type="text"
                    id="job-role-text"
                    value={jobRoleText}
                    onChange={(e) => setJobRoleText(e.target.value)}
                    placeholder='e.g., Software Engineer, Healthcare'
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-2 focus:ring-sky-500"
                />
            </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600"
        >
          {isLoading ? 'Processing...' : `Get ${selectedService.title} Results`}
        </button>

        {isLoading && <LoadingSpinner message="Analyzing..." />}
        {error && !isLoading && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        {result && !isLoading && (
          <div className="mt-6 p-4 bg-slate-700/50 rounded-md">
            <h4 className="text-lg font-semibold text-sky-300 mb-2">Analysis Result:</h4>
            <div className="text-sm text-gray-200 whitespace-pre-wrap prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.feedback.replace(/\n/g, '<br />') }}></div>
            {result.suggestions && result.suggestions.length > 0 && (
              <>
                <h5 className="text-md font-semibold text-sky-400 mt-4 mb-2">Suggestions:</h5>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-sky-300">Career Enhancement Services</h1>
        <p className="text-lg text-gray-400 mt-2">Leverage AI to boost your job readiness.</p>
      </header>

      {!selectedService ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {SERVICES_DATA.map(service => (
            <ServiceCard key={service.id} service={service} onServiceSelect={handleServiceSelect} />
          ))}
        </div>
      ) : (
        renderServiceUI()
      )}
    </div>
  );
};

export default ServicesPage;
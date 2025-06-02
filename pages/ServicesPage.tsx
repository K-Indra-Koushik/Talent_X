
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Service as ServiceType, GeminiAnalysisResult, AtsParameterScore } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { 
  analyzeResumeWithGemini, 
  getPercentageMatchWithGemini,
  calculateAtsScoreWithGemini, 
  generateAiMockInterviewQuestions
} from '../services/geminiService';
import { extractTextFromFile } from '../utils/fileUtils';
// Removed Chat import from @google/genai as it was for voice interview
// Removed GEMINI_TEXT_MODEL as it was used with genAI Chat for voice, geminiService handles its own models


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
const DocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.88-.093 1.791-.186 2.75-.186 1.638 0 3.213.278 4.625.799M10.125 2.25a9.81 9.81 0 00-2.625.799M16.5 9.75L12 14.25 9.75 12M9 14.25l1.5-1.5M12 14.25l1.5-1.5M12 11.25h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z" />
  </svg>
);
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);
// Removed UserSoundIcon as it's no longer used

const SERVICES_DATA: ServiceType[] = [
  { id: 'resumeAnalyzer', title: 'Resume Analyzer', description: 'Upload your resume (PDF/TXT) and get AI-powered feedback on structure, keywords, and common errors.', icon: <DocumentMagnifyingGlassIcon /> },
  { id: 'percentageMatch', title: 'Percentage Match', description: 'Upload your resume (PDF/TXT) and paste a job description to see a compatibility score.', icon: <ScaleIcon /> },
  { id: 'atsScoreCalculator', title: 'ATS Score Calculator', description: 'Upload your resume to get a general ATS compatibility score (0-100), a breakdown by key parameters, and actionable improvement suggestions based on overall resume quality and ATS best practices.', icon: <DocumentCheckIcon /> },
  { id: 'aiMockInterviewQuestions', title: 'AI Mock Interview Questions', description: 'Generate interview questions tailored to specific job roles or industries for practice.', icon: <QuestionMarkCircleIcon /> },
  // Removed 'aiVoiceInterview' service
];

// Removed Web Speech API and Gemini Setup constants (SpeechRecognition, synthesis, apiKey, genAI) for voice interview

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [resumeText, setResumeText] = useState(''); 
  const [jobDescriptionText, setJobDescriptionText] = useState(''); 
  const [jobRoleText, setJobRoleText] = useState(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeminiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed state variables for Voice Interview

  const resetServiceState = () => {
    setResult(null);
    setError(null);
    setResumeText('');
    setJobDescriptionText('');
    setJobRoleText('');
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
    // Removed reset for voice interview state
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = SERVICES_DATA.find(s => s.id === serviceId);
    setSelectedService(service || null);
    resetServiceState();
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

  const handleSubmitRegularService = async () => {
    if (!selectedService) {
      setError("Please select a service.");
      return;
    }
    
    if (['resumeAnalyzer', 'percentageMatch', 'atsScoreCalculator'].includes(selectedService.id) && !resumeText) {
      setError(`Please upload or paste your resume for ${selectedService.title}.`);
      return;
    }
    if (selectedService.id === 'aiMockInterviewQuestions' && !jobRoleText) {
      setError(`Please provide the job role/industry for ${selectedService.title}.`);
      return;
    }
    // Removed jobDescriptionText check for atsScoreCalculator
    if (selectedService.id === 'percentageMatch' && !jobDescriptionText) {
        setError(`Please provide the job description for ${selectedService.title}.`);
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
        case 'atsScoreCalculator':
          apiResult = await calculateAtsScoreWithGemini(resumeText); // jobDescriptionText removed
          break;
        case 'aiMockInterviewQuestions':
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

  // --- Removed AI Voice Interview Logic ---
  
  useEffect(() => { // Cleanup on unmount or service change
    return () => {
      // Removed speech recognition/synthesis cleanup as they are no longer used
    };
  }, [selectedService]);


  // --- Render Logic ---
  const renderServiceUI = () => {
    if (!selectedService) return null;

    // Removed specific UI rendering for 'aiVoiceInterview'

    // Fallback for regular services
    const needsResumeInput = ['resumeAnalyzer', 'percentageMatch', 'atsScoreCalculator'].includes(selectedService.id);
    const needsJobDescriptionInput = selectedService.id === 'percentageMatch'; // Only percentageMatch needs it now
    const needsJobRoleInput = selectedService.id === 'aiMockInterviewQuestions';

    return (
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-xl">
        <button 
          onClick={() => handleServiceSelect('')} 
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
                    aria-label="Upload Resume File"
                />
                {fileName && <p className="text-xs text-gray-500 mb-2">Selected file: {fileName}</p>}
                 <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste your resume text here. File upload will populate this field."
                    rows={needsJobDescriptionInput || needsJobRoleInput || selectedService.id === 'atsScoreCalculator' ? 10 : 5} 
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-2 focus:ring-sky-500"
                    aria-label="Resume Text Input"
                 />
            </div>
        )}

        {needsJobDescriptionInput && ( // This section will now only show for 'percentageMatch'
          <div className="mb-4">
            <label htmlFor="job-desc-text" className="block text-sm font-medium text-sky-300 mb-1">
                Paste Job Description Text:
            </label>
            <textarea
                id="job-desc-text"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full Job Description Text Here..."
                rows={10}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-2 focus:ring-sky-500"
                aria-label="Job Description Text Input"
            />
          </div>
        )}

        {needsJobRoleInput && (
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
                    aria-label="Job Role or Industry Input"
                />
            </div>
        )}
        
        <button
          onClick={handleSubmitRegularService}
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
            
            {result.overallScore !== undefined && (
                <p className="text-2xl font-bold text-sky-400 mb-3">
                    Overall ATS Score: <span className="text-green-400">{result.overallScore}%</span>
                </p>
            )}

            <div 
                className="text-sm text-gray-200 whitespace-pre-wrap prose prose-sm prose-invert max-w-none mb-4" 
                dangerouslySetInnerHTML={{ __html: result.feedback.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br />') }}
            ></div>

            {result.detailedBreakdown && result.detailedBreakdown.length > 0 && (
              <>
                <h5 className="text-md font-semibold text-sky-400 mt-4 mb-2">Parameter Breakdown:</h5>
                <div className="space-y-4">
                  {result.detailedBreakdown.map((item: AtsParameterScore, index: number) => (
                    <div key={index} className="p-3 bg-slate-800/60 rounded-md">
                      <h6 className="font-semibold text-sky-300 flex justify-between items-center">
                        {item.parameterName}
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${item.score !== undefined && item.score >= 80 ? 'bg-green-500 text-green-50' : 
                            item.score !== undefined && item.score >= 60 ? 'bg-yellow-500 text-yellow-50' :
                            item.score !== undefined ? 'bg-red-500 text-red-50' :
                            item.status && (item.status.toLowerCase().includes('strong') || item.status.toLowerCase().includes('good') || item.status.toLowerCase().includes('excellent') || item.status.toLowerCase().includes('pass')) ? 'bg-green-500 text-green-50' :
                            item.status && (item.status.toLowerCase().includes('partial') || item.status.toLowerCase().includes('fair')) ? 'bg-yellow-500 text-yellow-50' :
                            'bg-red-500 text-red-50'}`}>
                          {item.score !== undefined ? `${item.score}/100` : item.status}
                        </span>
                      </h6>
                      <div className="text-xs text-gray-300 mt-1 prose prose-xs prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.feedback.replace(/\n/g, '<br />') }}></div>
                      {item.recommendation && (
                        <>
                          <p className="text-xs font-semibold text-sky-500 mt-2 mb-0.5">Recommendation:</p>
                          <div className="text-xs text-gray-300 prose prose-xs prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.recommendation.replace(/\n/g, '<br />') }}></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <>
                <h5 className="text-md font-semibold text-sky-400 mt-6 mb-2">General Suggestions:</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="p-3 bg-slate-800/60 rounded prose prose-sm prose-invert max-w-none">
                       <div dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br />') }} />
                    </li>
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
            <ServiceCard key={service.id} service={service} onServiceSelect={() => handleServiceSelect(service.id)} />
          ))}
        </div>
      ) : (
        renderServiceUI()
      )}
    </div>
  );
};

export default ServicesPage;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResumeFile, CodingProfile, ApplicationHistoryItem, GeminiAnalysisResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { getResumeSuggestionsWithGemini } from '../services/geminiService';
import { Navigate } from 'react-router-dom';
import { extractTextFromFile } from '../utils/fileUtils';

// Icons
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
</svg>
);
const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.055 15.055 0 01-4.5 0M12 4.5c-.831 0-1.603.093-2.326.273V3.75a.75.75 0 10-1.5 0v.991c-.723.18-1.495.457-2.174.825a.75.75 0 10.75 1.299c.34-.191.69-.359 1.05-.495V9c0 .858.24 1.65.676 2.326a5.98 5.98 0 00.676-2.326V4.5A2.25 2.25 0 0112 2.25a2.25 2.25 0 012.25 2.25v2.562c.36.136.71.304 1.051.495a.75.75 0 10.75-1.299c-.68-.368-1.45-.645-2.175-.825V3.75a.75.75 0 10-1.5 0v.723A5.972 5.972 0 0012 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);
const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5H18a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25-2.25H6.75a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25z" />
  </svg>
);


interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, icon, children }) => (
  <div className="bg-slate-800 shadow-xl rounded-lg p-6">
    <div className="flex items-center mb-4">
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7 text-sky-400 mr-3' })}
      <h2 className="text-2xl font-semibold text-sky-400">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [resumeContentForAnalysis, setResumeContentForAnalysis] = useState<string>('');
  const [fileProcessingError, setFileProcessingError] = useState<string | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  
  const [codingProfiles, setCodingProfiles] = useState<CodingProfile[]>([]);
  const [newProfilePlatform, setNewProfilePlatform] = useState<'LeetCode' | 'GitHub' | 'HackerRank' | 'CodeChef'>('GitHub');
  const [newProfileUsername, setNewProfileUsername] = useState('');
  
  const [aiSuggestions, setAiSuggestions] = useState<GeminiAnalysisResult | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [applicationHistory, setApplicationHistory] = useState<ApplicationHistoryItem[]>([]);
  
  // Mock data loading
  useEffect(() => {
    setResumes([
      { id: 'r1', name: 'Software_Engineer_Resume_v3.txt', uploadDate: new Date().toISOString(), isPrimary: true, content: "John Doe\nSoftware Engineer\nSkills: React, Node.js, TypeScript\nExperience: Tech Corp (2 years)" },
      { id: 'r2', name: 'Project_Manager_Resume_OLD.txt', uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), isPrimary: false, content: "John Doe\nProject Manager\nSkills: Agile, Scrum, JIRA" },
    ]);
    setCodingProfiles([
      { platform: 'GitHub', username: 'johndoe', url: 'https://github.com/johndoe', summary: 'Contributions: 250+' },
      { platform: 'LeetCode', username: 'johndoe_lc', url: 'https://leetcode.com/johndoe_lc', summary: 'Solved: 150 Problems' },
    ]);
    setApplicationHistory([
      { jobId: '1', jobTitle: 'Senior Frontend Engineer', company: 'Innovatech Solutions', appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Applied' },
      { jobId: 'j2', jobTitle: 'UX Designer', company: 'Creative Designs', appliedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), status: 'Interviewing' },
    ]);
  }, []);

  useEffect(() => {
    const primaryResume = resumes.find(r => r.isPrimary);
    if (primaryResume?.content) {
      setResumeContentForAnalysis(primaryResume.content);
    } else {
      setResumeContentForAnalysis(''); // Clear if no primary or no content
    }
  }, [resumes]);


  const handleInfoSave = () => {
    console.log("Saving user info:", { name, email });
    setIsEditingInfo(false);
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileProcessingError(null);
      setIsLoadingSuggestions(true); // Use general loading indicator for file processing
      try {
        const content = await extractTextFromFile(file);
        const newResume: ResumeFile = {
          id: `r${Date.now()}`, // More unique ID
          name: file.name,
          uploadDate: new Date().toISOString(),
          isPrimary: resumes.length === 0,
          content: content,
        };
        
        setResumes(prevResumes => {
            let updated = [...prevResumes, newResume];
            if(newResume.isPrimary) {
                updated = updated.map(r => r.id === newResume.id ? newResume : {...r, isPrimary: false});
            }
            return updated;
        });

      } catch (err) {
        console.error("Error processing uploaded resume:", err);
        setFileProcessingError(err instanceof Error ? err.message : "Failed to process file.");
      } finally {
        setIsLoadingSuggestions(false);
        if (resumeFileInputRef.current) {
            resumeFileInputRef.current.value = ""; // Reset file input
        }
      }
    }
  };

  const setPrimaryResume = (id: string) => {
    const updatedResumes = resumes.map(r => ({ ...r, isPrimary: r.id === id }));
    setResumes(updatedResumes);
  };
  
  const deleteResume = (id: string) => {
    setResumes(currentResumes => {
        const isDeletingPrimary = currentResumes.find(r => r.id === id)?.isPrimary;
        let newResumes = currentResumes.filter(r => r.id !== id);
        if (isDeletingPrimary && newResumes.length > 0) {
            newResumes[0].isPrimary = true; // Set first as new primary
        }
        return newResumes;
    });
  };

  const addCodingProfile = () => {
    if (newProfileUsername.trim() === '') return;
    const newProfile: CodingProfile = {
      platform: newProfilePlatform,
      username: newProfileUsername,
      url: `https://example.com/${newProfilePlatform.toLowerCase()}/${newProfileUsername}`, 
      summary: 'New Profile - Summary Pending'
    };
    setCodingProfiles([...codingProfiles, newProfile]);
    setNewProfileUsername('');
  };

  const fetchAiSuggestions = async () => {
    if (!resumeContentForAnalysis) {
      setSuggestionsError("Please select a resume with content or paste resume text into the text area to get suggestions.");
      return;
    }
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    setAiSuggestions(null);
    try {
      const result = await getResumeSuggestionsWithGemini(resumeContentForAnalysis);
      setAiSuggestions(result);
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setSuggestionsError("Failed to get AI suggestions. Please try again.");
      setAiSuggestions({ feedback: `Error: ${err instanceof Error ? err.message : String(err)}`});
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-sky-300">Your Profile Dashboard</h1>
        <p className="text-lg text-gray-400 mt-2">Manage your career journey, {name || user.email}.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ProfileSection title="Resume Management" icon={<DocumentTextIcon />}>
            <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleResumeUpload}
                ref={resumeFileInputRef} 
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
            />
            {fileProcessingError && <Alert type="error" message={fileProcessingError} onClose={() => setFileProcessingError(null)} />}
            {isLoadingSuggestions && resumes.length === 0 && <LoadingSpinner size="sm" message="Processing file..." />}

            {resumes.length > 0 ? (
              <ul className="space-y-3 mt-4">
                {resumes.map(r => (
                  <li key={r.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-md hover:bg-slate-600/70 transition-colors">
                    <div>
                      <p className="font-medium text-sky-300">{r.name} {r.isPrimary && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full ml-2">Primary</span>}</p>
                      <p className="text-xs text-gray-400">Uploaded: {new Date(r.uploadDate).toLocaleDateString()}</p>
                      {!r.content && <p className="text-xs text-yellow-400">Content not extracted or file empty.</p>}
                    </div>
                    <div className="space-x-2 flex items-center">
                      {!r.isPrimary && <button onClick={() => setPrimaryResume(r.id)} className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded">Set Primary</button>}
                      <button 
                        onClick={() => { 
                            if(r.content) {
                                alert(`Resume Preview (first 500 chars):\n\n${r.content.substring(0,500)}...`);
                            } else {
                                alert('No content to preview. Please ensure the file was processed correctly.');
                            }
                        }} 
                        className="text-xs bg-slate-500 hover:bg-slate-400 text-white px-2 py-1 rounded disabled:opacity-50"
                        disabled={!r.content}
                        >Preview
                      </button>
                      <button onClick={() => deleteResume(r.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : !isLoadingSuggestions && <p className="text-gray-400">No resumes uploaded yet.</p>}
          </ProfileSection>

          <ProfileSection title="AI Resume Suggestions" icon={<LightBulbIcon />}>
            <p className="text-sm text-gray-400">Get AI-powered suggestions to improve your resume. Current content for analysis is shown below (from primary resume or manually pasted). It may take a moment for uploaded content to appear here.</p>
            <textarea 
              value={resumeContentForAnalysis}
              onChange={(e) => setResumeContentForAnalysis(e.target.value)}
              rows={8}
              placeholder="Your primary resume content will appear here. You can also paste any resume text directly for analysis..."
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-sky-500"
            />
            <button 
              onClick={fetchAiSuggestions} 
              disabled={isLoadingSuggestions || !resumeContentForAnalysis}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600"
            >
              {isLoadingSuggestions ? 'Getting Suggestions...' : 'Get AI Suggestions'}
            </button>
            {suggestionsError && <Alert type="error" message={suggestionsError} onClose={() => setSuggestionsError(null)} />}
            {aiSuggestions && !isLoadingSuggestions && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-md">
                <h4 className="text-md font-semibold text-sky-300 mb-1">Analysis Result:</h4>
                <div className="text-sm text-gray-200 whitespace-pre-wrap prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiSuggestions.feedback.replace(/\n/g, '<br />') }}></div>
                {aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-2">
                    {aiSuggestions.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </div>
            )}
          </ProfileSection>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <ProfileSection title="Personal Information" icon={<UserCircleIcon />}>
            {isEditingInfo ? (
              <>
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-sky-300">Name</label>
                  <input type="text" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200"/>
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-sky-300">Email</label>
                  <input type="email" id="profile-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200"/>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button onClick={handleInfoSave} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md text-sm">Save</button>
                  <button onClick={() => setIsEditingInfo(false)} className="bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 rounded-md text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300"><strong>Name:</strong> {name || 'Not set'}</p>
                <p className="text-gray-300"><strong>Email:</strong> {email}</p>
                <button onClick={() => setIsEditingInfo(true)} className="mt-2 text-sky-400 hover:text-sky-300 text-sm font-medium">Edit Info</button>
              </>
            )}
          </ProfileSection>

          <ProfileSection title="Coding Profiles" icon={<CodeBracketIcon />}>
            <div className="flex space-x-2">
              <select value={newProfilePlatform} onChange={(e) => setNewProfilePlatform(e.target.value as any)} className="p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 text-sm">
                <option value="GitHub">GitHub</option>
                <option value="LeetCode">LeetCode</option>
                <option value="HackerRank">HackerRank</option>
                <option value="CodeChef">CodeChef</option>
              </select>
              <input type="text" value={newProfileUsername} onChange={(e) => setNewProfileUsername(e.target.value)} placeholder="Username" className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 text-sm"/>
              <button onClick={addCodingProfile} className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md text-sm">Add</button>
            </div>
            {codingProfiles.length > 0 ? (
              <ul className="space-y-2 mt-3">
                {codingProfiles.map(p => (
                  <li key={`${p.platform}-${p.username}`} className="p-2 bg-slate-700 rounded-md">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-300 hover:underline">{p.platform}: {p.username}</a>
                    {p.summary && <p className="text-xs text-gray-400">{p.summary}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-400 text-sm">No coding profiles linked yet.</p>}
          </ProfileSection>

          <ProfileSection title="Application History" icon={<ClipboardDocumentListIcon />}>
            {applicationHistory.length > 0 ? (
              <ul className="space-y-2">
                {applicationHistory.map(app => (
                  <li key={app.jobId} className="p-2 bg-slate-700 rounded-md">
                    <p className="font-medium text-sky-300">{app.jobTitle} at {app.company}</p>
                    <p className="text-xs text-gray-400">Applied: {new Date(app.appliedDate).toLocaleDateString()} - Status: <span className={`font-semibold ${app.status === 'Interviewing' ? 'text-yellow-400' : app.status === 'Offer' ? 'text-green-400' : 'text-gray-400'}`}>{app.status}</span></p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-400 text-sm">No application history found.</p>}
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
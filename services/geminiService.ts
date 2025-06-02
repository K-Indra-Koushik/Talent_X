
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { GeminiAnalysisResult, AtsParameterScore } from "../types";

// Ensure API_KEY is accessed correctly. This relies on build-time replacement or environment setup.
// In a typical Vite/Create React App setup, environment variables prefixed with REACT_APP_ (for CRA)
// or VITE_ (for Vite) are embedded during build. For this environment, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled. Ensure process.env.API_KEY is configured.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper types for parsed Gemini JSON responses
interface ParseError {
  error: string;
  originalText: string;
}

// Type guard for ParseError
function isParseError(obj: any): obj is ParseError {
  return obj && typeof obj === 'object' && 'error' in obj && 'originalText' in obj;
}

interface ResumeAnalysisApiResponse {
  feedback: string;
  suggestions?: string[];
}

interface PercentageMatchApiResponse {
  matchScore?: number; // Percentage
  feedback?: string;
  matchingElements?: string[];
  missingElements?: string[];
}

// Interface for the expected JSON structure from Gemini for ATS Score Calculator
interface AtsScoreCalculatorApiResponse {
  overallScore: number; // 0-100
  overallFeedback: string; // Markdown formatted summary of the score and resume
  parameterBreakdown: AtsParameterScore[]; // Using AtsParameterScore from types.ts
  generalImprovementSuggestions?: string[]; // Overall suggestions for improvement, Markdown formatted
}


interface MockInterviewApiResponse {
  questions?: string[];
  feedback?: string;
}

interface ResumeSuggestionsApiResponse {
  feedback: string;
  suggestions?: string[];
}


const parseJsonFromText = (text: string): any => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", e);
    console.error("Original text:", text);
    // Fallback: return the original text if it's not valid JSON, perhaps wrapped in a known structure
    return { error: "Failed to parse JSON", originalText: text };
  }
};

export const analyzeResumeWithGemini = async (resumeText: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured. Please set API_KEY." };

  try {
    const systemInstruction = `You are an expert resume reviewer. Analyze the provided resume text. 
    Provide feedback on:
    1. Structure and Formatting (clarity, readability, ATS-friendliness).
    2. Content (achievements, action verbs, conciseness, impact).
    3. Keywords (relevance to common job roles, missing critical keywords).
    4. Common Errors (typos, grammar, inconsistencies).
    Return your feedback as a JSON object with a main "feedback" string (can be markdown formatted) and an optional "suggestions" array of strings for specific improvement points.
    Example JSON:
    {
      "feedback": "Overall, this is a good start... However, consider these points for improvement: ...",
      "suggestions": ["Quantify achievements more.", "Use stronger action verbs for XYZ section."]
    }`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: resumeText }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });
    
    const rawParsedResult = parseJsonFromText(response.text);

    if (isParseError(rawParsedResult)) {
        return { feedback: `Error processing response: ${rawParsedResult.error}. Raw: ${rawParsedResult.originalText}` };
    }
    
    const parsedResult = rawParsedResult as ResumeAnalysisApiResponse;
    
    return {
        feedback: parsedResult.feedback || "No feedback provided.",
        suggestions: parsedResult.suggestions || [],
    };

  } catch (error) {
    console.error("Error calling Gemini API for resume analysis:", error);
    return { feedback: `An error occurred while analyzing the resume: ${error instanceof Error ? error.message : String(error)}` };
  }
};


export const getPercentageMatchWithGemini = async (resumeText: string, jobDescriptionText: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured." };

  try {
    const systemInstruction = `You are an AI that calculates a percentage match between a resume and a job description.
    Analyze the provided resume and job description.
    Calculate a compatibility score from 0 to 100%.
    Provide the score and a brief explanation of key matching elements and significant missing elements.
    Return your feedback as a JSON object:
    {
      "matchScore": 85, // Percentage
      "feedback": "The resume shows strong alignment in X and Y skills. However, experience in Z mentioned in the job description is not prominent.",
      "matchingElements": ["Skill A", "Experience B"],
      "missingElements": ["Skill C", "Tool D"]
    }`;
    
    const prompt = `Resume:\n\`\`\`\n${resumeText}\n\`\`\`\n\nJob Description:\n\`\`\`\n${jobDescriptionText}\n\`\`\`\n\nPlease provide the percentage match analysis.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    const rawParsedResult = parseJsonFromText(response.text);
    if (isParseError(rawParsedResult)) {
      return { feedback: `Error processing response: ${rawParsedResult.error}. Raw: ${rawParsedResult.originalText}` };
    }

    const parsedResult = rawParsedResult as PercentageMatchApiResponse;

    return {
      feedback: `Match Score: ${parsedResult.matchScore || 'N/A'}%\n\n${parsedResult.feedback || 'No detailed feedback.'}`,
      suggestions: [
        ...(parsedResult.matchingElements ? [`Matching: ${parsedResult.matchingElements.join(', ')}`] : []),
        ...(parsedResult.missingElements ? [`Missing: ${parsedResult.missingElements.join(', ')}`] : [])
      ],
      overallScore: parsedResult.matchScore
    };
  } catch (error) {
    console.error("Error calling Gemini API for percentage match:", error);
    return { feedback: `Error calculating match: ${error instanceof Error ? error.message : String(error)}` };
  }
};


export const calculateAtsScoreWithGemini = async (resumeText: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured. Please set API_KEY." };

  try {
    const systemInstruction = `You are an expert ATS (Applicant Tracking System) Score Calculator.
    You will receive a resume/CV text.
    Your task is to:
    1. Parse the resume text.
    2. Evaluate it based on general ATS compatibility and effectiveness across the following parameters:
        - Contact Information: Presence, completeness (phone, email, LinkedIn optional), and professionalism.
        - Keywords & Skills Section: Presence of a clear skills section. Variety and relevance of skills listed (assume general industry best practices if no specific role is targeted by the resume).
        - Job Title Clarity & Impact: Are past job titles clear, professional, and do they suggest the scope of responsibility?
        - Experience Quantification & Action Verbs: Are accomplishments in the experience section described with strong action verbs and quantified results where possible?
        - Education and Certifications: Clarity and completeness of education and any listed certifications.
        - Formatting & Structure: ATS-friendliness including:
            - Standard, readable fonts.
            - Clear section headings (e.g., Experience, Education, Skills).
            - Use of bullet points for achievements.
            - Avoidance of tables, columns, images, and complex graphics.
            - Consistent date formatting.
            - Appropriate resume length (generally 1-2 pages).
        - Overall Readability and Professionalism: General impression of the resume's quality.
    3. Calculate an overall ATS compatibility score from 0 to 100 for the resume.
    4. Provide a detailed breakdown for each parameter, including a sub-score or status (e.g., "Excellent", "Good", "Needs Improvement"), feedback on how it was evaluated, and specific, actionable recommendations for improvement.
    5. Offer general improvement suggestions for the resume.

    Return your analysis as a JSON object with the following structure. All text values providing feedback, recommendations, or summaries should be Markdown formatted for rich text display.

    Example JSON Response Structure:
    {
      "overallScore": 78,
      "overallFeedback": "This resume demonstrates good ATS compatibility with clear formatting and well-defined sections. Key areas for improvement include quantifying achievements more consistently and ensuring the skills section is comprehensive for target roles.",
      "parameterBreakdown": [
        {
          "parameterName": "Contact Information",
          "score": 90,
          "status": "Excellent",
          "feedback": "Contact information is present, includes email and phone. LinkedIn profile is a good addition.",
          "recommendation": "Ensure email address is professional."
        },
        {
          "parameterName": "Keywords & Skills Section",
          "score": 75,
          "status": "Good",
          "feedback": "A skills section is present and lists relevant technical skills like 'Java', 'Python', and 'SQL'. Some soft skills are also mentioned.",
          "recommendation": "Consider categorizing skills (e.g., 'Programming Languages', 'Tools', 'Databases') for better readability. Tailor keywords to specific job types you are targeting when applying."
        },
        {
          "parameterName": "Job Title Clarity & Impact",
          "score": 80,
          "status": "Good",
          "feedback": "Job titles like 'Software Developer' are clear. Descriptions hint at responsibilities.",
          "recommendation": "Ensure job titles accurately reflect the roles held. Use industry-standard titles where possible."
        },
        {
          "parameterName": "Experience Quantification & Action Verbs",
          "score": 65,
          "status": "Needs Improvement",
          "feedback": "Uses some action verbs like 'Developed' and 'Managed'. However, many bullet points describe duties rather than achievements, and lack quantification.",
          "recommendation": "Rewrite bullet points to start with strong action verbs (e.g., 'Led', 'Implemented', 'Increased'). Quantify achievements wherever possible (e.g., 'Reduced processing time by 15%' or 'Managed a team of 5')."
        },
        {
          "parameterName": "Education and Certifications",
          "score": 85,
          "status": "Good",
          "feedback": "Education section is clear with degree, university, and graduation date. Certifications are listed.",
          "recommendation": "Ensure dates are consistent. List certifications in reverse chronological order or by relevance."
        },
        {
          "parameterName": "Formatting & Structure",
          "score": 70,
          "status": "Fair",
          "feedback": "Uses a standard font and bullet points. However, there are some inconsistencies in date formatting between sections. Resume length is appropriate.",
          "recommendation": "Ensure consistent date formatting (e.g., MM/YYYY or Month YYYY) throughout. Double-check for any hidden characters or complex formatting elements that might confuse an ATS. Aim for a length of 1 page if less than 10 years experience, up to 2 pages for more."
        },
         {
          "parameterName": "Overall Readability and Professionalism",
          "score": 80,
          "status": "Good",
          "feedback": "The resume is generally easy to read and professionally presented. No major grammatical errors found on initial scan.",
          "recommendation": "Proofread thoroughly for any minor typos or grammatical errors before submitting to jobs. Consider getting a peer review."
        }
      ],
      "generalImprovementSuggestions": [
        "Tailor your resume slightly for each job application, emphasizing skills and experiences most relevant to that specific role, even without a JD for this general scan.",
        "Use a professional summary or objective at the top to quickly highlight your key qualifications and career goals.",
        "Ensure contact information is up-to-date and easily accessible."
      ]
    }
    Ensure all text within 'overallFeedback', 'feedback', 'recommendation', and 'generalImprovementSuggestions' is Markdown formatted.
    For 'status' in parameterBreakdown, use terms like 'Excellent', 'Good', 'Fair', 'Needs Improvement', 'Not Applicable'.
    For 'score' in parameterBreakdown, provide a numerical score from 0-100 where applicable.
    Focus on providing actionable advice.
    The overall score should be a holistic assessment of how well the resume would perform in a typical ATS and its general quality.
    `;
    
    const prompt = `Resume/CV:\n\`\`\`\n${resumeText}\n\`\`\`\n\nPlease provide the detailed ATS Score calculation and breakdown for general ATS compatibility.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4, 
      }
    });
    
    const rawParsedResult = parseJsonFromText(response.text);

    if (isParseError(rawParsedResult)) {
      return { 
        feedback: `Error processing response: ${rawParsedResult.error}. Raw: ${rawParsedResult.originalText}`,
        overallScore: 0,
        detailedBreakdown: [],
        suggestions: [] 
      };
    }
    
    const parsedResult = rawParsedResult as AtsScoreCalculatorApiResponse;

    return {
      overallScore: parsedResult.overallScore,
      feedback: parsedResult.overallFeedback || "Overall feedback not provided.",
      detailedBreakdown: parsedResult.parameterBreakdown || [],
      suggestions: parsedResult.generalImprovementSuggestions || [],
    };

  } catch (error) {
    console.error("Error calling Gemini API for ATS Score Calculation:", error);
    return { 
        feedback: `Error performing ATS Score Calculation: ${error instanceof Error ? error.message : String(error)}`,
        overallScore: 0,
        detailedBreakdown: [],
        suggestions: []
    };
  }
};


export const generateAiMockInterviewQuestions = async (jobRoleOrIndustry: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured." };

  try {
    const systemInstruction = `You are an AI mock interview question generator.
    Based on the provided job role or industry, generate 5 relevant interview questions.
    These can include behavioral, technical (if applicable for the role), or situational questions.
    Return the questions as a JSON object:
    {
      "questions": [
        "Tell me about a time you faced a challenge and how you overcame it.",
        "Describe your experience with [specific technology/skill relevant to the role].",
        // ... 3 more questions
      ],
      "feedback": "Here are some questions tailored for a ${jobRoleOrIndustry} role."
    }`;
    
    const prompt = `Job Role/Industry: ${jobRoleOrIndustry}\n\nPlease generate 5 interview questions.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      }
    });
    
    const rawParsedResult = parseJsonFromText(response.text);
    if (isParseError(rawParsedResult)) {
      return { feedback: `Error processing response: ${rawParsedResult.error}. Raw: ${rawParsedResult.originalText}` };
    }
    
    const parsedResult = rawParsedResult as MockInterviewApiResponse;
    
    return {
      feedback: parsedResult.feedback || "Generated questions:",
      suggestions: parsedResult.questions || ["No questions generated."],
    };
  } catch (error) {
    console.error("Error calling Gemini API for mock interview questions:", error);
    return { feedback: `Error generating questions: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const getResumeSuggestionsWithGemini = async (resumeText: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured." };
  try {
    const systemInstruction = `You are an AI resume improvement assistant.
    Analyze the provided resume text.
    Provide 3-5 actionable suggestions to improve its content, keywords, and formatting for general job applications.
    Focus on clarity, impact, and modern resume best practices.
    Return your feedback as a JSON object:
    {
      "feedback": "Here are some personalized suggestions to enhance your resume:",
      "suggestions": [
        "Consider adding a brief professional summary at the top.",
        "Quantify your achievements in the 'Experience' section with numbers or data.",
        "Ensure consistent formatting for dates and job titles."
      ]
    }`;
    const prompt = `Resume for Improvement Suggestions:\n\`\`\`\n${resumeText}\n\`\`\`\n\nPlease provide improvement suggestions.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });
    const rawParsedResult = parseJsonFromText(response.text);
     if (isParseError(rawParsedResult)) {
      return { feedback: `Error processing response: ${rawParsedResult.error}. Raw: ${rawParsedResult.originalText}` };
    }
    const parsedResult = rawParsedResult as ResumeSuggestionsApiResponse;
    return {
      feedback: parsedResult.feedback || "Suggestions for your resume:",
      suggestions: parsedResult.suggestions || [],
    };
  } catch (error) {
    console.error("Error calling Gemini API for resume suggestions:", error);
    return { feedback: `Error getting resume suggestions: ${error instanceof Error ? error.message : String(error)}` };
  }
};

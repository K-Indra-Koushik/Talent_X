
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { GeminiAnalysisResult } from "../types";

// Ensure API_KEY is accessed correctly. This relies on build-time replacement or environment setup.
// In a typical Vite/Create React App setup, environment variables prefixed with REACT_APP_ (for CRA)
// or VITE_ (for Vite) are embedded during build. For this environment, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled. Ensure process.env.API_KEY is configured.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
    
    const parsedResult = parseJsonFromText(response.text);

    if (parsedResult.error) {
        return { feedback: `Error processing response: ${parsedResult.error}. Raw: ${parsedResult.originalText}` };
    }
    
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

    const parsedResult = parseJsonFromText(response.text);
    if (parsedResult.error) {
      return { feedback: `Error processing response: ${parsedResult.error}. Raw: ${parsedResult.originalText}` };
    }

    return {
      feedback: `Match Score: ${parsedResult.matchScore || 'N/A'}%\n\n${parsedResult.feedback || 'No detailed feedback.'}`,
      suggestions: [
        ...(parsedResult.matchingElements ? [`Matching: ${parsedResult.matchingElements.join(', ')}`] : []),
        ...(parsedResult.missingElements ? [`Missing: ${parsedResult.missingElements.join(', ')}`] : [])
      ]
    };
  } catch (error) {
    console.error("Error calling Gemini API for percentage match:", error);
    return { feedback: `Error calculating match: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const getAtsScoreEstimateWithGemini = async (resumeText: string): Promise<GeminiAnalysisResult> => {
  if (!ai) return { feedback: "Gemini API not configured." };

  try {
    const systemInstruction = `You are an AI that estimates ATS (Applicant Tracking System) compatibility for a resume.
    Analyze the provided resume text.
    Provide an estimated ATS compatibility score (e.g., "Low", "Medium", "High", or a percentage like "75%").
    Also, provide 3-5 actionable suggestions for improving ATS compatibility, focusing on formatting, keywords, and structure.
    Return your feedback as a JSON object:
    {
      "atsScore": "Medium", // or e.g., 75
      "feedback": "The resume has good keyword density but could improve section clarity for ATS parsing.",
      "suggestions": ["Use standard font and avoid tables/columns.", "Include a clear skills section.", "Tailor keywords from job descriptions."]
    }`;
    
    const prompt = `Resume for ATS Score Estimation:\n\`\`\`\n${resumeText}\n\`\`\`\n\nPlease provide the ATS score estimate and suggestions.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
      }
    });
    
    const parsedResult = parseJsonFromText(response.text);
    if (parsedResult.error) {
      return { feedback: `Error processing response: ${parsedResult.error}. Raw: ${parsedResult.originalText}` };
    }

    return {
      feedback: `ATS Score Estimate: ${parsedResult.atsScore || 'N/A'}\n\n${parsedResult.feedback || 'No detailed feedback.'}`,
      suggestions: parsedResult.suggestions || [],
    };
  } catch (error) {
    console.error("Error calling Gemini API for ATS score:", error);
    return { feedback: `Error estimating ATS score: ${error instanceof Error ? error.message : String(error)}` };
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
    
    const parsedResult = parseJsonFromText(response.text);
    if (parsedResult.error) {
      return { feedback: `Error processing response: ${parsedResult.error}. Raw: ${parsedResult.originalText}` };
    }
    
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
    const parsedResult = parseJsonFromText(response.text);
     if (parsedResult.error) {
      return { feedback: `Error processing response: ${parsedResult.error}. Raw: ${parsedResult.originalText}` };
    }
    return {
      feedback: parsedResult.feedback || "Suggestions for your resume:",
      suggestions: parsedResult.suggestions || [],
    };
  } catch (error) {
    console.error("Error calling Gemini API for resume suggestions:", error);
    return { feedback: `Error getting resume suggestions: ${error instanceof Error ? error.message : String(error)}` };
  }
};

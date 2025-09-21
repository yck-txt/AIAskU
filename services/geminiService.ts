import { GoogleGenAI, Type } from "@google/genai";
import type { Feedback, QuizQuestion, User, Badge } from '../types';
import { fileToBase64 } from "../utils/fileUtils";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewResponseSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "Whether the user's answer is correct based on the context."
        },
        explanation: {
            type: Type.STRING,
            description: "A concise explanation of why the answer is correct or incorrect, referencing the provided context."
        },
    },
    required: ["isCorrect", "explanation"],
};

const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: "The quiz question."
        },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 distinct potential answers."
        },
        correctAnswer: {
            type: Type.STRING,
            description: "The correct answer from the options array."
        },
        context: {
            type: Type.STRING,
            description: "A brief, one or two sentence explanation of why the correct answer is correct."
        }
    },
    required: ["question", "options", "correctAnswer", "context"]
};

const quizGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: quizQuestionSchema
        }
    },
    required: ["questions"]
};

const userCredentialsSchema = {
    type: Type.OBJECT,
    properties: {
        username: {
            type: Type.STRING,
            description: "A creative and unique two-word username, like 'CosmicTraveler' or 'PixelWizard', followed by a random 2-digit number."
        },
        password: {
            type: Type.STRING,
            description: "A strong, secure password of at least 12 characters, including uppercase letters, lowercase letters, numbers, and symbols (e.g., !@#$%^&*)."
        },
        avatar: {
            type: Type.STRING,
            description: "A valid SVG string for a unique, abstract geometric avatar. It should be a single <svg> element with a viewBox='0 0 100 100', no external links, scripts or bitmap images. It should incorporate various shapes like <circle>, <rect>, <path> and use a harmonious color palette. The design can be symmetrical or asymmetrical."
        }
    },
    required: ["username", "password", "avatar"],
};

const avatarSchema = {
    type: Type.OBJECT,
    properties: {
        avatar: {
            type: Type.STRING,
            description: "A valid SVG string for a unique, abstract geometric avatar. It should be a single <svg> element with a viewBox='0 0 100 100', no external links, scripts or bitmap images. It should incorporate various shapes like <circle>, <rect>, <path> and use a harmonious color palette. The design can be symmetrical or asymmetrical."
        }
    },
    required: ["avatar"],
};

const badgeSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A cool, thematic name for the badge, like 'Bronze Scholar' or 'Golden Sage'."
        },
        svg: {
            type: Type.STRING,
            description: "A valid SVG string for a unique badge. It should be a single <svg> element with a viewBox='0 0 100 100', no external links or scripts. The design should be thematic to the level tier (e.g., bronze, silver, gold)."
        }
    },
    required: ["name", "svg"],
};

const getLanguageInstruction = (language: string, forUsername = false) => {
    if (language === 'de') {
        if (forUsername) {
            return 'Generate a creative username using German words. For example: "SternenWanderer77" or "PixelMagier42". The password and SVG should remain standard.';
        }
        return 'The entire response, including all text content like questions, options, context, and badge names, must be in German.';
    }
    // Default to English
    if (forUsername) {
        return 'Generate a creative username using English words. For example: "StarlightRunner77", "QuantumLeaper42". The password and SVG should remain standard.';
    }
    return 'The entire response must be in English.';
};

export async function generateLevelBadge(level: number, language: string): Promise<Omit<Badge, 'level'>> {
    let tier = 'Bronze';
    if (level >= 50) tier = 'Diamond';
    else if (level >= 30) tier = 'Platinum';
    else if (level >= 20) tier = 'Gold';
    else if (level >= 10) tier = 'Silver';

    const langInstruction = getLanguageInstruction(language);
    const prompt = `
        Generate a unique achievement badge for a user who has just reached Level ${level}.
        The badge should have a visual theme of "${tier}".
        For example, a bronze badge could use brown/orange colors and a simple design. A diamond badge should be intricate and use light blue/white colors.
        
        The SVG must be a complete, valid string within a 'viewBox="0 0 100 100"'. It should be visually appealing, shaped like a medal, shield, or crest.
        The badge name should be cool and reflect the achievement and tier.
        ${langInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: badgeSchema,
                temperature: 0.9,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!parsedResponse.name || !parsedResponse.svg) {
            throw new Error("Invalid JSON structure from API for badge.");
        }

        return parsedResponse;

    } catch (error) {
        console.error(`Error calling Gemini API for level ${level} badge:`, error);
        throw new Error("Failed to generate level badge.");
    }
}


export async function generateAvatar(): Promise<string> {
    const prompt = `
        Create a visually striking, unique, abstract SVG avatar.
        The final output must be a single, complete, valid SVG string starting with '<svg' and ending with '</svg>'.
        It must use a 'viewBox="0 0 100 100"' and contain no external resources, scripts, or bitmap images.

        To ensure diversity, randomly select ONE of the following artistic styles for the avatar:
        1.  **Geometric Bauhaus:** Use simple geometric shapes like circles, squares, and triangles with a primary color palette (red, yellow, blue) plus black and white. Focus on clean lines and balanced asymmetry.
        2.  **Organic Abstract:** Use fluid, curved lines and natural, flowing shapes (like cells, leaves, or waves). Employ an analogous color palette (e.g., shades of blue and green). Use gradients to create depth.
        3.  **Memphis Design:** Combine bright, contrasting, and pastel colors. Use bold geometric shapes, squiggly lines, and playful patterns (dots, stripes). Embrace a fun, chaotic, and retro 80s feel.
        4.  **Minimalist Line Art:** Use a single, continuous, or a few bold strokes to create a simple, elegant form. Often monochromatic (black on white, or a single color on a neutral background). The beauty is in its simplicity.
        5.  **Op Art (Optical Art):** Create an illusion of movement, vibration, or hidden imagery. Use high-contrast patterns, repeating geometric shapes, and precise lines. Often black and white, but can use vibrant contrasting colors.
        6.  **Layered Paper Cut-out:** Simulate layers of colored paper. Use solid shapes with subtle drop shadows (<feDropShadow> filter) to create a sense of depth and texture. Use a rich, textured color palette.

        Based on the chosen style, generate a harmonious and interesting color palette.

        Experiment with advanced SVG features appropriate for the style, such as:
        - Layering multiple shapes.
        - Using transformations (rotate, scale, skew).
        - Defining and using gradients (<linearGradient> or <radialGradient>).
        - Creating patterns with <pattern>.
        - Using <clipPath> to mask elements.

        The final SVG should be aesthetically pleasing and a high-quality representation of the randomly chosen style. Do not describe the style in your response, just generate the SVG code.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: avatarSchema,
                temperature: 1, // High temperature for more variety
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!parsedResponse.avatar || typeof parsedResponse.avatar !== 'string') {
            throw new Error("Invalid JSON structure from API for avatar.");
        }

        return parsedResponse.avatar;

    } catch (error) {
        console.error("Error calling Gemini API for avatar generation:", error);
        throw new Error("Failed to generate avatar. The AI might be busy. Please try again.");
    }
}


export async function generateUserCredentials(language: string): Promise<Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'>> {
    const langInstruction = getLanguageInstruction(language, true);
    const prompt = `
        Generate a new user account with a creative username, a strong password, and a unique SVG avatar.
        
        ${langInstruction}

        Follow these rules strictly:
        - **Password:** Must be at least 12 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols.
        - **Avatar:** Create a simple but visually interesting, abstract SVG avatar. It must be a complete, valid SVG string starting with '<svg' and ending with '</svg>'. Use a 'viewBox="0 0 100 100"'. Do not use any external resources, scripts, or bitmap images.
          Randomly choose one of these simple styles:
          a) **Geometric:** Combine a few basic shapes (circles, rectangles, triangles). Use a bold, primary color palette.
          b) **Organic:** Use curved, flowing lines and a nature-inspired color palette (greens, blues, browns).
          c) **Monochromatic:** Use different shades of a single color plus white or black for a clean, modern look.
          The design can be symmetrical or asymmetrical.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: userCredentialsSchema,
                temperature: 1,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!parsedResponse.username || !parsedResponse.password || !parsedResponse.avatar) {
            throw new Error("Invalid JSON structure from API for user credentials.");
        }

        return parsedResponse as Omit<User, 'level' | 'xp' | 'badges' | 'isAdmin'>;

    } catch (error) {
        console.error("Error calling Gemini API for user generation:", error);
        throw new Error("Failed to generate user credentials. The AI might be busy. Please try again.");
    }
}

const parseAndValidateQuizResponse = (responseText: string): QuizQuestion[] => {
    const jsonText = responseText.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error("Invalid JSON structure from API: 'questions' array not found.");
    }
    
    // Add IDs to the questions, as they are not generated by the AI
    return parsedResponse.questions.map((q: Omit<QuizQuestion, 'id'>, index: number) => ({
        ...q,
        id: index + 1,
    }));
};

export async function generateSingleQuizQuestion(topic: string, existingQuestions: QuizQuestion[], language: string, difficulty: string): Promise<Omit<QuizQuestion, 'id'>> {
    const langInstruction = getLanguageInstruction(language);
    const existingQuestionText = existingQuestions.map(q => `- ${q.question}`).join('\n');
    const prompt = `
        Generate a single, new, fun and engaging multiple-choice question about the topic: "${topic}".
        The question should be of ${difficulty} difficulty.
        ${langInstruction}

        IMPORTANT: The new question must be different from the following existing questions:
        ${existingQuestionText}
        
        For the question, provide:
        - A clear question.
        - 4 distinct options.
        - The single correct answer.
        - A short, one-sentence explanation (context) for the correct answer.
        
        Ensure the correct answer is one of the provided options.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizQuestionSchema,
                temperature: 0.9,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!parsedResponse.question || !parsedResponse.options || !parsedResponse.correctAnswer) {
             throw new Error("Invalid JSON structure from API for single question.");
        }

        return parsedResponse as Omit<QuizQuestion, 'id'>;

    } catch (error) {
        console.error("Error calling Gemini API for single quiz question:", error);
        throw new Error("Failed to generate a new question. The AI might be busy. Please try again.");
    }
}

export async function generateQuizQuestions(topic: string, language: string, count: number, difficulty: string): Promise<QuizQuestion[]> {
    const langInstruction = getLanguageInstruction(language);
    const prompt = `
        Generate a fun and engaging quiz with ${count} multiple-choice questions about the topic: "${topic}".
        The questions should be of ${difficulty} difficulty.
        ${langInstruction}
        
        For each question, provide:
        - A clear question.
        - 4 distinct options.
        - The single correct answer.
        - A short, one-sentence explanation (context) for the correct answer.
        
        Ensure the correct answer is one of the provided options.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizGenerationSchema,
                temperature: 0.8,
            },
        });

        return parseAndValidateQuizResponse(response.text);

    } catch (error) {
        console.error("Error calling Gemini API for quiz generation:", error);
        throw new Error("Failed to generate the quiz. The AI might be busy, or the topic may be too restrictive. Please try another topic.");
    }
}

export async function generateQuizQuestionsFromFile(topic: string, file: File, language: string, count: number, difficulty: string): Promise<QuizQuestion[]> {
    const base64File = await fileToBase64(file);
    const langInstruction = getLanguageInstruction(language);
    const prompt = `
        Based on the content of the provided document, generate a fun and engaging quiz with ${count} multiple-choice questions about the topic: "${topic}".
        The questions should be directly related to the information found in the document.
        The questions should be of ${difficulty} difficulty.
        ${langInstruction}
        
        For each question, provide:
        - A clear question derived from the document's content.
        - 4 distinct options.
        - The single correct answer.
        - A short, one-sentence explanation (context) for the correct answer, based on the document.
        
        Ensure the correct answer is one of the provided options.
    `;

    const filePart = {
        inlineData: {
            mimeType: file.type,
            data: base64File,
        },
    };

    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [filePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: quizGenerationSchema,
                temperature: 0.7,
            },
        });

        return parseAndValidateQuizResponse(response.text);

    } catch (error) {
        console.error("Error calling Gemini API for file-based quiz generation:", error);
        throw new Error("Failed to generate quiz from the file. The document might be unreadable or the content too complex. Please try a different file.");
    }
}


export async function reviewAnswer(question: string, context: string, userAnswer: string, language: string): Promise<Feedback> {
    const langInstruction = getLanguageInstruction(language);
    const prompt = `
        **Question:** "${question}"
        
        **Context for Correct Answer:** "${context}"
        
        **User's Answer:** "${userAnswer}"
        
        Please evaluate the user's answer based *only* on the provided context. Determine if it is correct, and provide a brief explanation.
        ${langInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reviewResponseSchema,
                temperature: 0.3,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        if (typeof parsedResponse.isCorrect !== 'boolean' || typeof parsedResponse.explanation !== 'string') {
            throw new Error("Invalid JSON structure from API");
        }
        
        return parsedResponse as Feedback;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get feedback from the AI. The response might be blocked or the API key may be invalid.");
    }
}
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Rate limiting: Track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 seconds between requests (safer for free tier: 15/min = 1 per 4s)

export const generateResult = async (prompt) => {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && lastRequestTime > 0) {
        const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
        return `⏳ **Please Wait**

Wait **${waitTime} seconds** before making another AI request.

💡 To avoid rate limits, space requests by at least 4 seconds.`;
    }
    
    // Check if API key exists
    if (!process.env.GOOGLE_API_KEY) {
        return `❌ **AI Service Not Configured**

The AI service requires a Google API key to function.

**Setup Steps:**
1. Get free API key: https://makersuite.google.com/app/apikey
2. Add to backend/.env file: \`GOOGLE_API_KEY=your_key_here\`
3. Restart the server`;
    }
    
    // Only gemini-2.0-flash-exp works with this free tier API key
    const modelNames = [
        'gemini-1.5-flash',              // Try stable version first
        'gemini-1.5-flash-latest',       // Latest stable
        'gemini-2.0-flash-exp'           // Experimental (may have lower quota)
    ];
    
    for (const modelName of modelNames) {
        try {
            console.log(`Trying AI model: ${modelName}...`);
            
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const systemPrompt = `You are an expert in MERN stack development with 10 years of experience. 
You write clean, modular code with best practices, proper error handling, and helpful comments.
You provide concise, practical solutions.`;

            const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nYour Answer:`;
            
            console.log('Sending request to Gemini API...');
            
            // Generate content
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();
            
            // Update last request time on success
            lastRequestTime = Date.now();
            
            console.log(`✅ SUCCESS with model: ${modelName}`);
            return text;
            
        } catch (error) {
            console.log(`❌ Failed with ${modelName}: ${error.message}`);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            console.error('Error status:', error.status);
            console.error('Error code:', error.code);
            
            // Extract retry delay if present
            let retrySeconds = 60; // default
            const retryMatch = error.message.match(/retry in (\d+\.?\d*)/i);
            if (retryMatch) {
                retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
            }
            
            // Check if quota exceeded
            if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Too Many Requests')) {
                console.error('=== Quota/Rate Limit Exceeded ===');
                
                // Check if it's the per-minute rate limit (most common with free tier)
                if (error.message.includes('retry in') || error.message.includes('limit: 0')) {
                    return `⏳ **Rate Limit Exceeded**

Too many AI requests in a short time. 

**What happened:**
- Free tier allows 15 requests per minute
- This limit resets automatically
- Not a daily quota - just wait a moment!

**Please wait ${retrySeconds} seconds and try again.**

💡 **Tip:** Space out your @ai requests by at least 4-5 seconds to avoid hitting the limit.`;
                }
                
                return `⏳ **Too Many Requests**

Please wait ${retrySeconds} seconds before trying again.

The free tier has strict per-minute limits. Try spacing out your requests.

Error: ${error.message.substring(0, 100)}`;
            }
            
            // If this is the last model, return error
            if (modelName === modelNames[modelNames.length - 1]) {
                console.error('=== All AI Models Failed ===');
                console.error('Error details:', error.message);
                
                return `❌ **AI Service Unavailable**

Unfortunately, the AI assistant is currently unavailable.

**What's happening:**
The Google Gemini API free tier has very strict limits and may not be available in all regions or for all accounts.

**Alternative Solutions:**

1. **Ask Without @ai**: Other participants can help answer your questions

2. **Use ChatGPT/Claude**: For complex coding questions
   - ChatGPT: https://chat.openai.com
   - Claude: https://claude.ai

3. **Upgrade API Plan**: Get a paid Google AI key ($0.075 per 1M tokens)
   - Visit: https://ai.google.dev/pricing

4. **Stack Overflow**: Great for specific technical issues

**Your question was:** "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"

Feel free to ask other participants for help!`;
            }
            // Continue to next model
        }
    }
    
    // If all models fail without throwing (shouldn't happen)
    return `❌ **No AI Models Available**

Unable to connect to any Gemini models. The service may be temporarily unavailable.

Please try again later or ask your question without @ai for help from other participants.`;
}

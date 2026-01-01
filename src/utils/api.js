export const callGeminiAPI = async (systemPrompt, userQuery) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while generating ideas.";
    }
};


import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = "YOUR API KEY";

const genAI = new GoogleGenerativeAI(API_KEY);

// Using Gemini 2.5 Flash as requested by the user
const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
You are a helpful AI assistant for a note-taking application called "Gravity Check".
Your goal is to provide helpful answers and also generate structured notes when appropriate.

IMPORTANT: You have access to the full conversation history within this session. You can and should reference:
- Previous messages in the conversation
- Topics discussed earlier
- Any notes you've generated in this session
- Questions the user has asked before

When a user asks about previous interactions (e.g., "how many notes did you create?", "what did we discuss earlier?"), 
you should reference the conversation history to provide accurate answers.

If your response includes structured content like:
- Summaries
- Key takeaways
- Bullet lists
- Steps
- Lecture-style notes

Please format that specific part of the content between special delimiters:
<gravity_note>
...your structured notes here...
</gravity_note>

The content INSIDE these tags will be automatically extracted to a side panel for the user.
The content OUTSIDE these tags will remain in the main chat.
You can include the notes in the chat flow as well if it makes sense contextually, but the <gravity_note> block is specifically for the side panel.
If you use the <gravity_note> block, you do NOT need to repeat the content outside of it, unless you want to summarize it or introduce it.
Ideally, provide a conversational introduction, then the <gravity_note> block.

Remember: You are stateful within this session. Track what you've discussed and what notes you've created.
`;

export async function streamGeminiChat(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    newMessage: string,
    onChunk: (text: string) => void,
    onNoteFound: (note: string) => void
) {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 8192,
        },
    });

    try {
        const result = await chat.sendMessageStream(newMessage);

        let fullText = "";
        let buffer = "";

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            buffer += chunkText;

            // Check for note tags in the buffer
            // We need to be careful about partial tags
            const noteStart = buffer.indexOf("<gravity_note>");
            const noteEnd = buffer.indexOf("</gravity_note>");

            if (noteStart !== -1 && noteEnd !== -1) {
                // We have a complete note
                const noteContent = buffer.substring(noteStart + 14, noteEnd).trim();
                onNoteFound(noteContent);

                // Remove the note block from the buffer so we don't process it again
                // AND remove it from the chat stream if we want it ONLY in notes?
                // The prompt says: "If you use the <gravity_note> block, you do NOT need to repeat the content outside of it"
                // So we might want to hide the raw tags from the user in the chat.

                // Let's strip the tags from the displayed text.
                // But we are streaming. This is tricky.
                // If we want to hide tags, we have to buffer until we are sure we don't have a tag.
                // For MVP, showing tags is ugly. Let's try to clean it up.

                // Reset buffer after processing a complete note
                // But wait, 'fullText' is what we might want to return/display?
                // Actually, the 'onChunk' is usually used to update the UI.
                // If we want to hide tags, we should filter 'fullText' before calling 'onChunk' or 
                // handle the display logic in the component.

                // For simplicity in this function, we will just pass the raw text to onChunk
                // and let the UI component handle hiding the tags or we just accept them for now.
                // OR, we can try to strip them here.

                buffer = buffer.substring(noteEnd + 15);
            }

            onChunk(chunkText);
        }

        return fullText;
    } catch (error) {
        console.error("Gemini streaming error:", error);
        throw error;
    }
}

import { config } from 'dotenv';
config();
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })]
});
async function main() {
    try {
        const response = await ai.generate({
            model: 'googleai/gemini-3.1-pro-preview',
            prompt: 'hello'
        });
        console.log(response.text);
    } catch (e) {
        console.error(e);
    }
}
main();

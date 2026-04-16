# Architecture & Tech Stack
- **Framework:** Next.js (App Router). Strict separation of Client and Server components.
- **State Management:** React Query (instantiated safely inside components to prevent SSR leaks), custom `ClientStateProvider`, `ProModeProvider`.
- **Styling:** Tailwind CSS with `next-themes` (Dark mode default).
- **AI Backend:** 
  - **Client-Side:** Vertex AI for Firebase Client SDK (`firebase/vertexai`) for high-performance, fast client-side interactions (e.g., `gemini-1.5-flash`).
  - **Server-Side:** Genkit with Google Cloud Vertex AI (Gemini 2.5 Pro, MedGemma) for complex backend orchestration and tool calling.
- **Database:** Firebase Firestore.

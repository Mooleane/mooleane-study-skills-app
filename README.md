# Mooleane Study Skills App / MyTime

## Project overview
MyTime is an all-in-one study-skills app that combines time management, planning, and self-care check-ins. It helps students block out time for tasks, break assignments into manageable steps, and reflect on mood/work patterns so they can adjust their routine without getting overwhelmed. The app uses Google sign-in and server-side AI endpoints to generate structured planning and reflection guidance.

## Problem summary
Many students (and busy workers) struggle to manage time and focus day-to-day. Common pain points include:

- Not knowing where to start on an assignment (or starting too late)
- Procrastinating or getting distracted mid-task
- Feeling overwhelmed by work and falling behind
- Not having enough time to focus on self-care

Existing tools can help, but often in a narrow way:

- Google Calendar is great for scheduling but doesn't guide task breakdown.
- Daylio is quick for mood tracking but doesn't connect moods to study habits.
- Microsoft To Do is simple, but planning support can feel limited.

MyTime combines planning + reflection in one place, with guided support to simplify work into clear next steps.

## Features (including AI integration)
- Simple dashboard navigation to key areas (planner, reflection, key pages).
- Google sign-in with access control via NextAuth (restricted allowlist).
- Protected pages that redirect unauthenticated users to sign-in and unauthorized users to an unauthorized page.
- Designed to be accessible, easy to navigate, and not overwhelming.

Core product features:

- Study planner: block out time for different tasks and start focused work sessions.
- Breakdown wizard: simplifies larger tasks into digestible steps.
- Mood tracker + reflection: quick mood entries and a place to notice changes over time.
- Guided notes: supportive suggestions based on recent activity and personal notes.

File text extraction for study content:

- `POST /api/extract` accepts a `.txt` or `.pdf` upload and returns extracted text.
- Uses `pdfjs-dist` on the server to extract PDF text (best with selectable-text PDFs).

AI-powered server routes (AI Integration):

- `POST /api/chat`: Generates a short step-by-step plan for a task.
  - Input: task name/date/priority + optional extracted text.
  - Output: JSON `{ "steps": ["Step 1 (30m)", ...] }`.
- `POST /api/insights`: Generates multiple types of insights.
  - Insights include mood correlations, mood summary, and a quick check-in.
  - Output is constrained to JSON so the UI can render it predictably.
- `POST /api/suggestions`: Generates supportive study-skill suggestions (guided tips) based on recent moods, work balance in study planner, and personal notes.

Prompts are designed to return JSON so the UI can reliably display outputs. The model defaults to `gpt-4o-mini` and can be overridden via an environment variable.

## Tech stack
- Next.js (App Router)
- React
- NextAuth (Google provider)
- Tailwind CSS
- OpenAI (Chat Completions via `fetch`)
- `pdfjs-dist` for PDF text extraction
- ESLint
- Package manager: pnpm

## How to run the project
Prereqs:

- Node.js 18+ recommended
- pnpm installed (`npm i -g pnpm`)

1) Install dependencies

```bash
pnpm install
```

2) Create your environment file

```bash
copy .env.local.example .env.local
```

3) Fill in `.env.local`

- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

Note: The sign-in flow only allows emails listed in the allowlist in `src/app/api/auth/[...nextauth]/route.js`.

4) Run the dev server

```bash
pnpm dev
```

Open `http://localhost:3000`.

Production build:

```bash
pnpm build
pnpm start
```

## Reflection
What worked:

- Creating the wireframes and implementing them into the Next JS project went well, and I was able to create features that built off each other decently.
- Making the RBA was slightly tedious but worked well in the end.

What didn't (or was tricky):

- Implementing the features into Next JS was a challenge because they all had to connect to each other, and that approach meant a lot of saving between all the different tabs for the AI to output info from other tabs to the sections that relied on it. 
- Satisfying the user story fully didn't go well because some features such as the calendar would be too complex to satisfy for the user story considering the UI buttons. 

What I'd improve next:

- The appearance of the CSS (more colors/vibrancy)
- 
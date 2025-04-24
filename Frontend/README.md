# Resume Screening System - Frontend

A Next.js-powered frontend for an AI-driven resume screening and candidate management system.

## Features

- Modern UI with responsive design
- AI-powered resume parsing and matching
- Real-time candidate screening
- Job management
- Role-based access control
- Light/dark theme support
- Authentication with JWT

## Tech Stack

- Next.js 15.2.3
- React 19.0.0
- TypeScript
- Framer Motion
- React Toastify
- TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/resume-screening-system.git
cd resume-screening-system/Frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create an `.env.local` file in the Frontend directory with the following variables:

```
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8080
# Optional - Analytics
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3001`

## Environment Variables

| Variable                     | Description                         | Required |
| ---------------------------- | ----------------------------------- | -------- |
| NEXT_PUBLIC_API_URL          | API URL for direct fetch requests   | Yes      |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Google Client ID for authentication | No       |

## Project Structure

```
Frontend/
├── app/                  # App Router pages
│   ├── dashboard/        # Dashboard views
│   ├── auth/             # Authentication views
│   ├── globals.css       # Global CSS
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth.tsx          # Authentication context
│   ├── dataContext.tsx   # Data fetching/caching context
│   └── themeContext.tsx  # Theme context
├── public/               # Static assets
├── utils/                # Utility functions
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Best Practices

- Use the provided toast service for notifications:

  ```typescript
  import toastService from "../utils/toastService";
  import toastService from "../../../../utils/toastService";
  import { useToastInit } from "../../../../hooks/useToastInit";

  // put this in your component  start of the component
  useToastInit();

  toastService.error("Please select a job before uploading resumes.");

  // Success notification
  toastService.success("Operation completed successfully");

  // Error notification
  toastService.error("Something went wrong");

  // For cross-page navigation
  toastService.persistentSuccess("Changes saved. Redirecting...");
  ```

- Use the data context for managing API data:

  ```typescript
  import { useData } from "../lib/dataContext";

  function MyComponent() {
    const { data, isLoading, refreshData } = useData();

    // Refresh data after changes
    refreshData("candidates");
  }
  ```

## Troubleshooting

### Toast Notifications Not Appearing

If toast notifications aren't showing up:

1. Make sure you're using the `toastService` utility rather than direct toast calls
2. Check console for errors
3. Verify only one `ToastContainer` exists in the app (in layout.tsx)

### API Connection Issues

If you can't connect to the backend:

1. Verify your `.env.local` file has the correct URLs
2. Ensure the backend server is running
3. Check for CORS issues in the browser console

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with Next.js App Router
- Styling powered by TailwindCSS
- Icons provided by Lucide React

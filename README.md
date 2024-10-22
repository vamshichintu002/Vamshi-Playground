# AI Chatbot Playground

This project is an interactive web application that allows users to experiment with various AI models for text generation, code generation, and image generation. Built with Next.js, it provides a user-friendly interface to interact with different AI models and visualize their outputs in real-time.

## Features

- Support for multiple AI models including text generation, code generation, and image generation
- Real-time streaming of AI responses
- Dark mode support
- Responsive design for desktop and mobile devices
- Integration with Hugging Face, Groq, and Replicate APIs

## Project Structure
playground/
├── app/
│ ├── api/
│ │ ├── groq/
│ │ ├── huggingface/
│ │ └── replicate.ts
│ ├── fonts/
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components/
│ ├── ui/
│ ├── ModelSelector.tsx
│ └── playground.tsx
├── lib/
│ └── utils.ts
├── styles/
│ └── markdown-styles.css
├── public/
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json

## Key Components and Files

### `components/playground.tsx`

This is the main component of the application. It handles:
- User input and message history
- Model selection
- API calls to different AI services
- Rendering of chat messages and AI responses
- Dark mode toggle
- Image generation and display

### `components/ModelSelector.tsx`

This component provides a dropdown menu for users to select different AI models. It categorizes models into text generation, code generation, and image generation.

### `app/api/`

This directory contains API route handlers for different AI services:
- `groq/route.ts`: Handles requests to the Groq API
- `huggingface/route.ts`: Manages interactions with the Hugging Face API
- `replicate.ts`: Processes requests for the Replicate API

### `app/layout.tsx`

The root layout component that sets up the basic structure of the app, including font loading and analytics integration.

### `app/page.tsx`

The main page component that renders the Playground component.

### `styles/markdown-styles.css`

Contains custom styles for rendering markdown content in chat messages.

### `tailwind.config.ts`

Configuration file for Tailwind CSS, defining custom colors, themes, and other styling options.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example` for required variables)
4. Run the development server: `npm run dev`

## Environment Variables

Make sure to set the following environment variables:

- `GROQ_API_KEY`: API key for Groq
- `HUGGINGFACE_API_KEY`: API key for Hugging Face
- `REPLICATE_API_TOKEN`: API token for Replicate

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


# AI Chatbot Playground - Product Requirements Document (PRD)

## Project Overview

The AI Chatbot Playground is an interactive web application where users can select AI models, ask questions, and receive streamed responses from the AI in real time. The application uses Next.js, Shadcn/UI, Tailwind CSS, Lucid Icons, Replicate API, and Vercel AI SDK for fast and scalable performance.

## Objective

The goal is to provide a simple interface where users can:
- View a list of AI models
- Select an AI model 
- Take user input from a input box and submit a question
- Receive a real-time, streamed response from the selected model

## Core Functionalities

### Model Selection
- Users should be able to see a list of available AI models
- Users can select a specific AI model to use for their query
- User can enter their query in a input box and submit the question

### User Query Submission
- Users will input a prompt (i.e., question or task)
- create a function to handle the user's query and submit it to the AI model
- After selecting a model, they submit their query to get a response from the AI

### Real-Time Response Streaming
- The AI response should be streamed to the user in real-time
- The streaming functionality will be managed by Vercel AI SDK

### Error Handling
- The app should handle API errors gracefully, providing informative error messages to users if the model fails or if there's an issue with API connectivity

## Project File Structure

```
playground
├── app
│   ├── page.tsx                    # Main entry point, home page with model list and chat interface
│   ├── api                         # API folder for backend logic
│   │   └── replicate.ts            # API route for interacting with the Replicate API
├── components                      # Reusable components
│   ├── ModelSelector.tsx           # Component to list and select AI models
│   ├── ChatBox.tsx                 # Component to display chat and handle input/output
│   ├── StreamingAnswer.tsx         # Component to stream AI responses
├── lib
│   └── replicate.ts               # Utility function to handle Replicate API calls
├── styles
│   └── globals.css                # Tailwind CSS or global styles
├── public
│   └── favicon.ico                # Favicon
├── .env.local                     # Environment variables (API keys, etc.)
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation
```

## Detailed Documentation and Example Code

### API Documentation

#### Huggingface API Overview
The project integrates with the Huggingface API to run AI models. The developer will use the following example to send requests to the Huggingface API.

Example Code:
```javascript
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

for message in client.chat_completion(
	model="google/gemma-2-2b-jpn-it",
	messages=[{"role": "user", "content": "What is the capital of France?"}],
	max_tokens=500,
	stream=True,
):
    print(message.choices[0].delta.content, end="")

```

Expected Model Output:
```
Model output:
To answer this question, let's break it down step by step:

1. Tina has one brother and one sister.
2. We need to determine how many sisters Tina's siblings have.

Let's consider each sibling separately:

1. Tina's brother:
   - He has one sister (Tina herself).
   - He also has another sister (Tina's sister).
   So, Tina's brother has 2 sisters.

2. Tina's sister:
   - She has one sister (Tina herself).
   - She doesn't have any other sisters.
   So, Tina's sister has 1 sister.

Therefore, the answer to the question "How many sisters do Tina's siblings have?" is:
- Tina's brother has 2 sisters.
- Tina's sister has 1 sister.

Model execution completed.
```
// ... existing code ...

## Groq API Documentation

The Groq API allows you to interact with various models for different tasks. Below are the supported models:

### Supported Models

- **Distil-Whisper English**
  - **Model ID:** distil-whisper-large-v3-en
  - **Developer:** HuggingFace
  - **Max File Size:** 25 MB

- **Gemma 2 9B**
  - **Model ID:** gemma2-9b-it
  - **Developer:** Google
  - **Context Window:** 8,192 tokens

- **Gemma 7B**
  - **Model ID:** gemma-7b-it
  - **Developer:** Google
  - **Context Window:** 8,192 tokens

- **Llama 3 Groq 70B Tool Use (Preview)**
  - **Model ID:** llama3-groq-70b-8192-tool-use-preview
  - **Developer:** Groq
  - **Context Window:** 8,192 tokens

- **Llama 3 Groq 8B Tool Use (Preview)**
  - **Model ID:** llama3-groq-8b-8192-tool-use-preview
  - **Developer:** Groq
  - **Context Window:** 8,192 tokens

- **Llama 3.1 405B**
  - **Status:** Offline due to overwhelming demand! Stay tuned for updates.

- **Llama 3.1 70B**
  - **Model ID:** llama-3.1-70b-versatile
  - **Developer:** Meta
  - **Context Window:** 128k tokens (max_tokens limited to 8k)

- **Llama 3.1 8B**
  - **Model ID:** llama-3.1-8b-instant
  - **Developer:** Meta
  - **Context Window:** 128k tokens (max_tokens limited to 8k)

- **Llama 3.2 1B (Preview)**
  - **Model ID:** llama-3.2-1b-preview
  - **Developer:** Meta
  - **Context Window:** 128k tokens (temporarily limited to 8k in preview)

- **Llama 3.2 3B (Preview)**
  - **Model ID:** llama-3.2-3b-preview
  - **Developer:** Meta
  - **Context Window:** 128k tokens (temporarily limited to 8k in preview)

- **Llama 3.2 11B Vision (Preview)**
  - **Model ID:** llama-3.2-11b-vision-preview
  - **Developer:** Meta
  - **Context Window:** 128k tokens (temporarily limited to 8k in preview)

- **Llama 3.2 90B (Preview) Coming Soon**
  - **Model ID:** llama-3.2-90b-vision-preview
  - **Developer:** Meta
  - **Context Window:** 128k tokens (temporarily limited to 8k in preview)

- **Llama Guard 3 8B**
  - **Model ID:** llama-guard-3-8b
  - **Developer:** Meta
  - **Context Window:** 8,192 tokens

- **LLaVA 1.5 7B**
  - **Model ID:** llava-v1.5-7b-4096-preview
  - **Developer:** Haotian Liu
  - **Context Window:** 4,096 tokens

- **Meta Llama 3 70B**
  - **Model ID:** llama3-70b-8192
  - **Developer:** Meta
  - **Context Window:** 8,192 tokens

- **Meta Llama 3 8B**
  - **Model ID:** llama3-8b-8192
  - **Developer:** Meta
  - **Context Window:** 8,192 tokens

- **Mixtral 8x7B**
  - **Model ID:** mixtral-8x7b-32768
  - **Developer:** Mistral
  - **Context Window:** 32,768 tokens

- **Whisper**
  - **Model ID:** whisper-large-v3
  - **Developer:** OpenAI
  - **File Size:** 25 MB

// ... existing code ...

### Backend API Route Documentation

The backend API route will handle requests to the Replicate API, process them, and return the response to the frontend.

#### API Route:
- **Path**: `/api/huggingface.ts`
- **Method**: POST
- **Input**: `{ "model": "google/gemma-2-2b-jpn-it", "prompt": "user's prompt" }`
- **Response**: The streamed response from the AI model

#### Error Handling:
In case of an error (invalid API token, network issues, etc.), the response should return a 500 status code with an error message.

### Frontend Components Documentation

#### ModelSelector Component
This component will allow users to select a model from a dropdown menu.

**Props**:
- `onSelectModel`: A callback function that receives the selected model

**Functionality**:
- Renders a dropdown of available AI models
- Updates the parent component when a model is selected

#### ChatBox Component
This is the main component responsible for capturing user input (the question), sending it to the backend, and displaying the streamed response.

**State**:
- `prompt`: Stores the user's input
- `model`: Stores the selected model

**Functionality**:
- Handles the form submission
- Sends the prompt and model to the backend API for processing
- Displays the streamed response from the AI

#### StreamingAnswer Component
This component will handle the real-time display of streamed responses.

**Props**:
- `modelResponse`: The real-time stream of text returned by the API

**Functionality**:
- Displays the AI's response as it is streamed

### Environmental Variables

All sensitive information (such as the huggingface API token) should be stored in environment variables.

**.env.local**:
```
HUGGINGFACE_API_TOKEN=<your_huggingface_api_token>
```

### Deployment

- The app will be deployed on Vercel, utilizing Vercel AI SDK to manage streaming responses from the API
- Railway.app may also be used if additional backend logic or services are required in the future

## Implementation Details

### Dependencies
- Next.js: Server-side rendering and API routes
- Huggingface API: For executing AI models and fetching results
- Vercel AI SDK: To manage real-time streaming of the AI's response
- Tailwind CSS: For styling and UI components
- Lucid Icon: For icons in the UI

### Key Milestones

1. **UI/UX Implementation**:
   - Design and implement the basic layout using Shadcn/UI and Tailwind
   - Implement dropdown for model selection and chat input box

2. **API Integration**:
   - Set up the backend API route to communicate with Huggingface API
   - Implement logic to stream responses using Vercel AI SDK

3. **Error Handling**:
   - Ensure proper error messages are displayed for failed requests

4. **Final Testing & Deployment**:
   - Test the app thoroughly before deploying on Vercel
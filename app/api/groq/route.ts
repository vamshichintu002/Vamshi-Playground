import { NextRequest } from 'next/server';
import { Groq } from 'groq-sdk';

console.log("API Token:", process.env.GROQ_API_KEY ? "Set" : "Not set");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { model, prompt } = await req.json();

    console.log("Received request:", { model, prompt });

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }

    const stream = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      stream: true,
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          } catch (error) {
            console.error("Streaming error:", error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Streaming error occurred", details: error instanceof Error ? error.message : String(error) })}\n\n`));
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request.', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
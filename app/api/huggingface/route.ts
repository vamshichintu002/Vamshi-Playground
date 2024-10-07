import { NextRequest } from 'next/server';
import { HfInference } from '@huggingface/inference';

console.log("API Token:", process.env.HUGGINGFACE_API_TOKEN ? "Set" : "Not set");

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { model, prompt } = await req.json();

    console.log("Received request:", { model, prompt });

    if (!process.env.HUGGINGFACE_API_TOKEN) {
      throw new Error("HUGGINGFACE_API_TOKEN is not set");
    }

    if (model === 'XLabs-AI/flux-RealismLora') {
      const response = await hf.textToImage({
        model: model,
        inputs: prompt,
      });

      // Convert the blob to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return new Response(JSON.stringify({ image: `data:image/jpeg;base64,${base64}` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const encoder = new TextEncoder();

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              if (model === 'microsoft/phi-2' || model === 'microsoft/Phi-3.5-mini-instruct') {
                const response = await hf.textGeneration({
                  model: model,
                  inputs: prompt,
                  parameters: {
                    max_new_tokens: 500,
                    return_full_text: false,
                  },
                });
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: response.generated_text })}\n\n`));
              } else {
                const stream = await hf.textGenerationStream({
                  model: model,
                  inputs: prompt,
                  parameters: {
                    max_new_tokens: 500,
                    return_full_text: false,
                  },
                });
                for await (const chunk of stream) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                }
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
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request.', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
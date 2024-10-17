import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { inputs, model } = await req.json();
  console.log('Received request for model:', model);
  console.log('Inputs:', inputs);

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API Error:', errorText);
      return NextResponse.json({ error: `Hugging Face API Error: ${errorText}` }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('Error in Hugging Face API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

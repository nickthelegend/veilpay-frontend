import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { history, profile } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        score: 85, 
        insights: [
          "Set up an ANTHROPIC_API_KEY to get real AI analysis.",
          "Your current privacy score is based on a baseline heuristic.",
          "Consider using more stealth addresses for recurring payments."
        ] 
      });
    }

    const systemPrompt = `You are a Web3 Privacy Expert for VeilPay. 
    Analyze the user's transaction history and provide a privacy score (0-100) and 3 specific, actionable insights.
    VeilPay uses EIP-5564 stealth addresses on Conflux eSpace.
    History: ${JSON.stringify(history)}
    Profile: ${JSON.stringify(profile)}
    Return ONLY a JSON object: { "score": number, "insights": string[] }`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: systemPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : "";
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

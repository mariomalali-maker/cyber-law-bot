export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "API key missing on server" });
    return;
  }

  // Read raw body from the request (Vercel doesn't auto-parse)
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    console.error("Invalid JSON:", e);
    res.status(400).json({ error: "Invalid JSON in request" });
    return;
  }

  const question = (body.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "Empty question" });
    return;
  }

  const systemPrompt = `
You are a UAE cyber law assistant.
- Only answer questions about cyber security, cybercrime, online safety, and digital privacy in the United Arab Emirates.
- If the question is not about online behaviour or not about the UAE, reply: "I can only help with UAE cyber security and online issues."
- Do not give official legal advice, only general guidance.
- Always end with: "This is general information, not legal advice."
`.trim();

  try {
    const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await oaRes.json();

    if (!oaRes.ok) {
      console.error("OpenAI error:", data);
      res.status(500).json({ error: data.error?.message || "OpenAI API error" });
      return;
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

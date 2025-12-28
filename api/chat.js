export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key missing on server" });
  }

  const { question } = req.body; // <-- MATCHES your frontend

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Empty question" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a UAE cyber law assistant. Only answer questions about cyber security and online safety in the United Arab Emirates. If outside that scope, refuse politely." },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: "OpenAI error" });
    }

    const answer = data.choices?.[0]?.message?.content || "Sorry, no answer generated.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

        "Content-Type": "application/json",

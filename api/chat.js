export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let rawBody = "";
  for await (const chunk of req) rawBody += chunk;
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const question = (body.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "Missing question" });
    return;
  }

  const systemPrompt = `
You are a UAE Cyber Law assistant.
- Only answer questions related to cyber security, cybercrime, online safety, privacy, hacking, social media misuse, and digital law in the UAE.
- If the question is not about UAE or not cyber-related, politely refuse.
- Always end with: "This is general information, not legal advice."
  `.trim();

  try {
    const apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
      }),
    });

    const data = await apiRes.json();

    if (data.error) {
      console.log("API Error:", data.error);
      res.status(500).json({ error: data.error.message });
      return;
    }

    // FIX: new format uses "output_text"
    const answer =
      data.output_text || "I couldn't generate a response. Try again.";

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server crashed" });
  }
}

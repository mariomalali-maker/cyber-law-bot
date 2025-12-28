export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing on server' });
  }

  const { message } = req.body;

  // ❌ Reject non-UAE / non-cyber questions
  const allowedKeywords = ["UAE", "cyber", "law", "hacked", "report", "ecrime", "social media", "online"];
  const isRelevant = allowedKeywords.some(word => message.toLowerCase().includes(word.toLowerCase()));
  if (!isRelevant) {
    return res.status(400).json({
      error: "This chatbot only answers UAE cyber security / online law questions."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

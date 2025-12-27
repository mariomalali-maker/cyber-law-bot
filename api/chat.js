export default async function handler(req, res) {
  const body = await req.json();
  const question = body.question;

  const systemPrompt = `
  You are a UAE Cyber Law assistant.
  Only answer questions about cyber security and online safety in the UAE.
  If the question is unrelated, refuse politely.
  Do not give legal advice, just general guidance.
  End answers with: "This is general info, not legal advice."
  `;

  const request = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + process.env.OPENAI_API_KEY
    },
    body:JSON.stringify({
      model:"gpt-4o-mini",
      messages:[
        {role:"system", content:systemPrompt},
        {role:"user", content:question}
      ]
    })
  });

  const json = await request.json();
  res.status(200).json({ answer: json.choices[0].message.content });
}

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}
const { prompt } = req.body;
if (!prompt) {
return res.status(400).json({ error: 'Prompt is required' });
}
try {
const response = await fetch('

https://api.anthropic.com/v1/messages

', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 2048,
messages: [{ role: 'user', content: prompt }]
})
});
const data = await response.json();
if (data.error) {
return res.status(500).json({ error: data.error.message });
}
const text = data.content && data.content[0] && data.content[0].text;
return res.status(200).json({ result: text || '' });
} catch (error) {
return res.status(500).json({ error: error.message });
}
}

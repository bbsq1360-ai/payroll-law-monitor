export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}
const { prompt } = req.body;
if (!prompt) {
return res.status(400).json({ error: 'Prompt is required' });
}
try {
const apiUrl = 'https://api.anthropic.com/v1/messages';
const response = await fetch(apiUrl, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 2048,
tools: [{ type: 'web_search_20250305', name: 'web_search' }],
messages: [{ role: 'user', content: prompt }]
})
});
const data = await response.json();
if (data.error) {
return res.status(500).json({ error: data.error.message });
}
if (!data.content || !Array.isArray(data.content)) {
return res.status(500).json({ error: 'No content' });
}
const textBlocks = data.content
.filter(function(b) { return b && b.type === 'text' && typeof b.text === 'string'; })
.map(function(b) { return b.text; })
.join('\n');
return res.status(200).json({ result: textBlocks || '검색 결과가 없습니다.' });
} catch (error) {
return res.status(500).json({ error: error.message });
}
}

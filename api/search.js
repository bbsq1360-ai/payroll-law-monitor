export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

const { prompt } = req.body;

if (!prompt) {
return res.status(400).json({ error: 'Prompt is required' });
}

try {
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 1000,
tools: [{ type: 'web_search_20250305', name: 'web_search' }],
messages: [{ role: 'user', content: prompt }]
})
});

```
const data = await response.json();

if (data.error) {
  return res.status(500).json({ error: data.error.message });
}

const textBlocks = data.content
  .filter(b => b.type === 'text')
  .map(b => b.text)
  .join('\\n');

return res.status(200).json({ result: textBlocks });
```

} catch (error) {
return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
}
}

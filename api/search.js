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
const headers = {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
};
const firstResponse = await fetch(apiUrl, {
method: 'POST',
headers: headers,
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 2048,
tools: [{ type: 'web_search_20250305', name: 'web_search' }],
messages: [{ role: 'user', content: prompt }]
})
});
const firstData = await firstResponse.json();
if (firstData.error) {
return res.status(500).json({ error: firstData.error.message });
}
const textFromFirst = firstData.content && firstData.content
.filter(function(b) { return b && b.type === 'text' && typeof b.text === 'string'; })
.map(function(b) { return b.text; })
.join('\n');
if (textFromFirst && textFromFirst.trim()) {
return res.status(200).json({ result: textFromFirst });
}
if (firstData.stop_reason !== 'tool_use') {
return res.status(200).json({ result: '검색 결과가 없습니다.' });
}
const toolUseBlock = firstData.content.find(function(b) { return b && b.type === 'tool_use'; });
if (!toolUseBlock) {
return res.status(200).json({ result: '검색 결과가 없습니다.' });
}
const secondResponse = await fetch(apiUrl, {
method: 'POST',
headers: headers,
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 2048,
tools: [{ type: 'web_search_20250305', name: 'web_search' }],
messages: [
{ role: 'user', content: prompt },
{ role: 'assistant', content: firstData.content },
{ role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUseBlock.id, content: '' }] }
]
})
});
const secondData = await secondResponse.json();
if (secondData.error) {
return res.status(500).json({ error: secondData.error.message });
}
const textFromSecond = secondData.content && secondData.content
.filter(function(b) { return b && b.type === 'text' && typeof b.text === 'string'; })
.map(function(b) { return b.text; })
.join('\n');
return res.status(200).json({ result: textFromSecond || '검색 결과가 없습니다.' });
} catch (error) {
return res.status(500).json({ error: error.message });
}
}
export const config = {
maxDuration: 60
};

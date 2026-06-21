import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const res = await fetch('https://api.thebreeth.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BREETH_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{role: 'user', content: 'hello'}]
    })
  });
  console.log(res.status, await res.text());
}
test();

// Test environment variables in backend
console.log('Testing environment variables...');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log('OPENAI_API_KEY starts with sk:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.startsWith('sk-') : false);
console.log('SPOON_KEY exists:', !!process.env.SPOON_KEY);
console.log('SPOON_KEY value:', process.env.SPOON_KEY);

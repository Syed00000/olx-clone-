// Test the backend code locally
const { handler } = require('./backend/api/index.ts');

// Mock Vercel request and response
const mockReq = {
  method: 'POST',
  url: '/api/auth/login',
  headers: {
    host: 'localhost:3000',
    'content-type': 'application/json'
  },
  body: {
    email: 'syedimranh59@gmail.com',
    password: '12345'
  }
};

const mockRes = {
  status: (code) => {
    console.log(`Response Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('Response Data:', JSON.stringify(data, null, 2));
    return mockRes;
  },
  setHeader: (name, value) => {
    console.log(`Header Set: ${name} = ${value}`);
    return mockRes;
  },
  end: () => {
    console.log('Response ended');
    return mockRes;
  }
};

// Test the health endpoint
console.log('Testing health endpoint...');
const healthReq = { ...mockReq, method: 'GET', url: '/health' };
handler(healthReq, mockRes);

console.log('\nTesting login endpoint...');
handler(mockReq, mockRes);


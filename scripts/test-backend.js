const https = require('https');

const testBackend = async () => {
  const backendUrl = 'https://football-team-manager-6fyxn0yl3-trungs-projects-4a25ad7a.vercel.app';

  console.log('🧪 Testing backend API...');
  console.log('Backend URL:', backendUrl);

  const testData = JSON.stringify({
    email: 'admin@football.com',
    password: 'admin123',
  });

  const options = {
    hostname: 'football-team-manager-6fyxn0yl3-trungs-projects-4a25ad7a.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);

      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response:', data);
        resolve(data);
      });
    });

    req.on('error', error => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(testData);
    req.end();
  });
};

testBackend();

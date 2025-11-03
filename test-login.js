const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('https://football-team-manager-pi.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@football.com',
        password: 'admin123',
      }),
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());

    const data = await response.text();
    console.log('Response:', data);

    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();

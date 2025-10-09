// Test script to verify API connection
const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

console.log('API_URL:', API_URL);

// Test the API endpoint
fetch(`${API_URL}/api/imports`)
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.text();
  })
  .then(text => {
    console.log('Response body:', text);
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Not valid JSON:', e.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

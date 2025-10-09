'use client';

import React, { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');

  const testAPI = async () => {
    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
    
    try {
      console.log('API_URL:', API_URL);
      console.log('Making request to:', `${API_URL}/api/imports`);
      
      const response = await fetch(`${API_URL}/api/imports`);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
        setResult(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Not valid JSON:', e.message);
        setResult(`Error parsing JSON: ${e.message}\n\nResponse: ${text}`);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug API Connection</h1>
      <p className="mb-4">API_URL: {process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'}</p>
      <button 
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test API Connection
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
        {result}
      </pre>
    </div>
  );
}

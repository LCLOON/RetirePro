'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test 1: Check if we can reach Supabase
      const response = await fetch('https://litbmjdtaofepkgquqgp.supabase.co/auth/v1/health', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdGJtamR0YW9mZXBrZ3F1cWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODM2MTcsImV4cCI6MjA4MjM1OTYxN30.ZJiF_I5vzQOJu6x_GiAPFsokVtXtwOL7RDRB40LTF_A'
        }
      });
      const healthData = await response.text();
      setResult(`Health check: ${response.status} - ${healthData}\n\n`);
      
      // Test 2: Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: 'test' + Date.now() + '@gmail.com',
        password: 'testpass123',
      });
      
      if (error) {
        setResult(prev => prev + `Signup error: ${error.message}`);
      } else {
        setResult(prev => prev + `Signup success: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`Catch error: ${err instanceof Error ? err.message : String(err)}\n\nStack: ${err instanceof Error ? err.stack : 'N/A'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      <pre className="bg-slate-800 p-4 rounded overflow-auto whitespace-pre-wrap">
        {result || 'Click button to test'}
      </pre>
    </div>
  );
}

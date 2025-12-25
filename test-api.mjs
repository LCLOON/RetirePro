// Test script for email and Stripe APIs
// Run with: node test-api.mjs

const BASE_URL = 'http://localhost:3000';

async function testEmailAPI() {
  console.log('📧 Testing Email API...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'lcloon@roadrunner.com',
        data: {
          userName: 'Test User'
        }
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email API Success!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Email API Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Email API Request Failed:', error.message);
  }
}

async function testStripeCheckout() {
  console.log('\n💳 Testing Stripe Checkout API...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1ShALU8WMeXEKMhbscZyFQb4',
        billingPeriod: 'monthly',
        plan: 'pro'
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.url) {
      console.log('✅ Stripe Checkout Success!');
      console.log('   Session ID:', data.sessionId);
      console.log('   Checkout URL:', data.url);
    } else {
      console.log('❌ Stripe Checkout Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Stripe API Request Failed:', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 RetirePro API Tests');
  console.log('='.repeat(50));
  
  await testEmailAPI();
  await testStripeCheckout();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Tests Complete!');
  console.log('='.repeat(50));
}

runTests();

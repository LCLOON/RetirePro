// Test script for email and Stripe APIs
// Run with: node test-api.mjs

// Use 'live' for production, 'local' for development
const MODE = 'live';
const BASE_URL = MODE === 'live' ? 'https://retirepro.io' : 'http://localhost:3000';

// Live Price IDs
const LIVE_PRICES = {
  pro: {
    monthly: 'price_1ShAIv8WMeXEKMhbq7JZAvCJ',
    yearly: 'price_1SiczK8WMeXEKMhbr7KcYJDZ',
  },
  premium: {
    monthly: 'price_1Siczj8WMeXEKMhb1AEnTWNt',
    yearly: 'price_1Siczr8WMeXEKMhb8pkuN1KH',
  }
};

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

async function testCheckoutTier(plan, period, priceId) {
  try {
    const response = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        billingPeriod: period,
        plan: plan
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.url) {
      console.log(`   ✅ ${plan.toUpperCase()} ${period}: Session created`);
      return true;
    } else {
      console.log(`   ❌ ${plan.toUpperCase()} ${period}: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${plan.toUpperCase()} ${period}: ${error.message}`);
    return false;
  }
}

async function testAllPricingTiers() {
  console.log('\n💳 Testing All Stripe Pricing Tiers...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test all 4 tiers
  if (await testCheckoutTier('pro', 'monthly', LIVE_PRICES.pro.monthly)) passed++; else failed++;
  if (await testCheckoutTier('pro', 'yearly', LIVE_PRICES.pro.yearly)) passed++; else failed++;
  if (await testCheckoutTier('premium', 'monthly', LIVE_PRICES.premium.monthly)) passed++; else failed++;
  if (await testCheckoutTier('premium', 'yearly', LIVE_PRICES.premium.yearly)) passed++; else failed++;
  
  console.log(`\n   Summary: ${passed}/4 tiers working`);
  return passed === 4;
}

async function testWebhookEndpoint() {
  console.log('\n🔔 Testing Webhook Endpoint (ping)...\n');
  
  try {
    // Just check the endpoint responds (without valid signature it should return 400)
    const response = await fetch(`${BASE_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    
    // 400 is expected (missing signature), 500 means server error
    if (response.status === 400) {
      console.log('   ✅ Webhook endpoint is responding (signature validation working)');
      return true;
    } else if (response.status === 500) {
      const data = await response.json();
      console.log('   ⚠️  Webhook endpoint error:', data.error);
      return false;
    } else {
      console.log('   ⚠️  Unexpected response:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Webhook endpoint unreachable:', error.message);
    return false;
  }
}

async function testAIAdvisor() {
  console.log('\n🤖 Testing AI Advisor API...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-advisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test.',
        conversationHistory: []
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.response) {
      console.log('   ✅ AI Advisor responding');
      console.log('   Preview:', data.response.substring(0, 100) + '...');
      return true;
    } else {
      console.log('   ❌ AI Advisor Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('   ❌ AI Advisor Request Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 RetirePro LIVE API Tests');
  console.log('   URL:', BASE_URL);
  console.log('='.repeat(50));
  
  await testEmailAPI();
  await testAllPricingTiers();
  await testWebhookEndpoint();
  await testAIAdvisor();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ All Tests Complete!');
  console.log('='.repeat(50));
}

runTests();

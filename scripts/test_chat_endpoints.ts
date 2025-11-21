/**
 * Test script for chat API endpoints
 * Tests the GET /state and POST /message endpoints
 */

async function testChatEndpoints() {
  const BASE_URL = 'http://localhost:3000';
  const SESSION_ID = '009';

  console.log('🧪 Testing Chat API Endpoints\n');
  console.log('=====================================\n');

  try {
    // Test 1: GET /api/assessment/[sessionId]/state
    console.log('Test 1: GET /api/assessment/009/state');
    console.log('---------------------------------------');

    const stateResponse = await fetch(`${BASE_URL}/api/assessment/${SESSION_ID}/state`);

    if (!stateResponse.ok) {
      console.error(`❌ State endpoint failed: ${stateResponse.status}`);
      const errorText = await stateResponse.text();
      console.error('Error:', errorText);
    } else {
      const stateData: any = await stateResponse.json();
      console.log('✅ State endpoint successful');
      console.log(`   Session ID: ${stateData.sessionId}`);
      console.log(`   Messages: ${stateData.messages?.length || 0}`);
      console.log(`   Progress: ${stateData.progress}%`);
      console.log(`   Stage: ${stateData.stage} - ${stateData.stageDescription}`);
      console.log(`   Archetype: ${stateData.archetype || 'Not detected yet'}`);
      console.log(`   EQ Tone: ${stateData.eqTone?.label || 'N/A'} (warmth: ${stateData.eqTone?.warmth}, strictness: ${stateData.eqTone?.strictness})`);
    }

    console.log('\n');

    // Test 2: POST /api/assessment/[sessionId]/message
    console.log('Test 2: POST /api/assessment/009/message');
    console.log('---------------------------------------');

    const testMessage = "Hi Jenny! I'm feeling a bit stressed about my college applications.";
    console.log(`📤 Sending message: "${testMessage}"`);

    const messageResponse = await fetch(`${BASE_URL}/api/assessment/${SESSION_ID}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testMessage }),
    });

    if (!messageResponse.ok) {
      console.error(`❌ Message endpoint failed: ${messageResponse.status}`);
      const errorText = await messageResponse.text();
      console.error('Error:', errorText);
    } else {
      const messageData: any = await messageResponse.json();
      console.log('✅ Message endpoint successful');
      console.log(`📥 Agent response: "${messageData.message}"`);
      console.log(`   Timestamp: ${messageData.timestamp}`);
    }

    console.log('\n');

    // Test 3: Verify state updated with new message
    console.log('Test 3: Verify state updated after message');
    console.log('---------------------------------------');

    const updatedStateResponse = await fetch(`${BASE_URL}/api/assessment/${SESSION_ID}/state`);

    if (!updatedStateResponse.ok) {
      console.error(`❌ Updated state check failed: ${updatedStateResponse.status}`);
    } else {
      const updatedState: any = await updatedStateResponse.json();
      console.log('✅ State updated successfully');
      console.log(`   Messages: ${updatedState.messages?.length || 0} (should be 2+)`);
      console.log(`   Latest messages:`);

      const recentMessages = updatedState.messages?.slice(-2) || [];
      recentMessages.forEach((msg: any, idx: number) => {
        const preview = msg.content.substring(0, 60);
        console.log(`     ${idx + 1}. [${msg.role}]: ${preview}${msg.content.length > 60 ? '...' : ''}`);
      });
    }

    console.log('\n=====================================');
    console.log('✅ All chat endpoint tests completed!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run tests
testChatEndpoints();

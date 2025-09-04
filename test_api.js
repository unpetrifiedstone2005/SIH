// Simple test script for the API endpoint
const testData = {
  features: [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8]
};

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ API test successful!');
      console.log('Prediction:', result.prediction);
    } else {
      console.log('❌ API test failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();

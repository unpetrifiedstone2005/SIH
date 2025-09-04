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
      
      if (result.databaseRecord) {
        console.log('📊 Database Record Created:');
        console.log('  - Prediction ID:', result.databaseRecord.predictionId);
        console.log('  - Sensor Reading ID:', result.databaseRecord.sensorReadingId);
        console.log('  - Location ID:', result.databaseRecord.locationId);
        console.log('  - Risk Level:', result.databaseRecord.riskLevel);
        console.log('  - Risk Score:', result.databaseRecord.riskScore + '%');
      }
      
      // Test fetching predictions
      console.log('\n🔍 Testing predictions retrieval...');
      const predictionsResponse = await fetch('http://localhost:3000/api/predictions?limit=5');
      const predictionsData = await predictionsResponse.json();
      
      if (predictionsResponse.ok) {
        console.log('✅ Predictions retrieved successfully!');
        console.log('Total predictions:', predictionsData.count);
        if (predictionsData.predictions.length > 0) {
          console.log('Latest prediction:', {
            id: predictionsData.predictions[0].id,
            riskLevel: predictionsData.predictions[0].riskLevel,
            riskScore: predictionsData.predictions[0].riskScore,
            timestamp: predictionsData.predictions[0].predictionTimestamp
          });
        }
      } else {
        console.log('❌ Failed to retrieve predictions');
      }
      
    } else {
      console.log('❌ API test failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();

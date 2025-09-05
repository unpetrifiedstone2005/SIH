// Test script for bulk prediction API
const testData = {
  rows: [
    [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8],
    [2.5, 4.1, 6.2, 8.3, 10.5, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9],
    [3.8, 5.2, 7.4, 9.6, 12.0, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.1],
  ]
};

async function testBulkAPI() {
  try {
    console.log('Testing Bulk Prediction API...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/predict/bulk', {
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
      console.log('✅ Bulk API test successful!');
      console.log(`📊 Summary: ${result.summary.successful}/${result.summary.totalRows} predictions completed`);
      
      if (result.results && result.results.length > 0) {
        console.log('\n🔍 Sample Results:');
        result.results.slice(0, 3).forEach((result, index) => {
          console.log(`  Row ${result.row}: ${result.databaseRecord.riskLevel} (${result.databaseRecord.riskScore.toFixed(1)}%)`);
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => {
          console.log(`  Row ${error.row}: ${error.error}`);
        });
      }
    } else {
      console.log('❌ Bulk API test failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing bulk API:', error.message);
  }
}

testBulkAPI();

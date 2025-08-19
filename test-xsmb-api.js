// Simple test script to verify XSMB API integration
const testXSMBAPI = async () => {
  try {
    console.log('Testing XSMB API...');
    
    // Test single date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Testing date range: ${yesterday} to ${today}`);
    
    const response = await fetch(
      `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?start=${yesterday}&end=${today}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.ok && data.results) {
      console.log(`✅ Successfully fetched ${data.results.length} results`);
      
      data.results.forEach(result => {
        if (result.data) {
          console.log(`📅 ${result.date}: Special Prize = ${result.data.prizes['ĐB']?.[0] || 'N/A'}`);
        } else {
          console.log(`📅 ${result.date}: ${result.error || 'No data'}`);
        }
      });
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testXSMBAPI();
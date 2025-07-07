export default function TestAPI() {
  const testAPI = async () => {
    try {
      const response = await fetch('/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: 12, year: 2024 })
      });
      
      console.log('Response:', response);
      const data = await response.json();
      console.log('Data:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8">
      <button onClick={testAPI} className="bg-blue-600 text-white px-4 py-2 rounded">
        Test API
      </button>
    </div>
  );
} 
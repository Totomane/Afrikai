export const generatePodcast = async (data: any) => {
  const response = await fetch('http://localhost:8000/api/podcast/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to generate podcast');
  }

  return response.json();
};

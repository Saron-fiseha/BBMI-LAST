export async function fetchInstructors() {
  const response = await fetch('/api/instructors');
  if (!response.ok) {
    throw new Error('Failed to fetch instructors');
  }
  return response.json();
}
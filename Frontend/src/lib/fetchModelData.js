const baseURL = "http://localhost:8081";

export default async function fetchModel(url) {
  const response = await fetch(`${baseURL}${url}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text(); // đọc message từ backend
    throw new Error(`Failed to fetch ${url}: ${response.status} ${errorText}`);
  }

  return await response.json();
}

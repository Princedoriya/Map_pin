import fetch from 'node-fetch';

const cache = new Map();
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; 
const FETCH_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RETRIES = 2;

function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeout)
    ),
  ]);
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: 'Missing lat or lon query parameters' });
    return;
  }

  const cacheKey = `${lat},${lon}`;
  const cachedEntry = cache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_EXPIRATION_MS) {
    // Serve from cache
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(cachedEntry.data);
    return;
  }

  try {
    const response = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'my-app-reverse-geocode/1.0',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch address' });
      return;
    }

    const data = await response.json();

    // Cache the result
    cache.set(cacheKey, { data, timestamp: now });

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(data);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

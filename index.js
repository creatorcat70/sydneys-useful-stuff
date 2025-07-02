import { UVServiceWorker } from '/active/uv/uv.sw.js';
import { UVClient } from '/active/uv/uv.client.js';
import { createBareClient } from '/bare-client.js'; // optional if you're using bare
import { proxyConfig } from '/active/uv/uv.config.js';

async function registerUVServiceWorker() {
  if (!navigator.serviceWorker.controller) {
    try {
      await navigator.serviceWorker.register('/active/uv/uv.sw.js', {
        scope: proxyConfig.prefix
      });
      console.log('UV service worker registered!');
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
}

function generateUrl(query) {
  try {
    return new URL(query).toString();
  } catch {
    try {
      const url = new URL('https://' + query);
      if (!url.hostname.includes('.')) throw new Error('Invalid hostname');
      return url.toString();
    } catch {
      // fallback to search
      return `https://www.startpage.com/do/search?query=${encodeURIComponent(query)}`;
    }
  }
}

async function main() {
  // Wait for DOM ready
  if (document.readyState !== 'loading') {
    // already ready
  } else {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // Wait for UV config to be available
  while (typeof proxyConfig === 'undefined' || typeof window.Ultraviolet === 'undefined') {
    await new Promise(r => setTimeout(r, 50));
  }

  // Init UV client instance (needed for urlCodec)
  const uvClient = new UVClient(proxyConfig);
  uvClient.init();

  // Register service worker
  await registerUVServiceWorker();

  // Attach input listener
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) {
    console.error('searchInput element not found');
    return;
  }

  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (!query) return;

      try {
        const url = generateUrl(query);
        const encodedUrl = proxyConfig.prefix + uvClient.urlCodec.encode(url);
        window.location.href = encodedUrl;
      } catch (err) {
        console.error('Failed to encode or redirect:', err);
      }
    }
  });
}

main();

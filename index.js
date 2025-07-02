import { UVServiceWorker } from '/active/uv/uv.sw.js';
import { UVClient } from '/active/uv/uv.client.js';
import { createBareClient } from '/bare-client.js'; // optional if you're using bare
import { proxyConfig } from '/active/uv/uv.config.js';

const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (!query) return;

      try {
        let url;
        try {
          url = new URL(query);
        } catch {
          try {
            url = new URL('https://' + query);
          } catch {
            url = new URL(`https://www.startpage.com/do/search?query=${encodeURIComponent(query)}`);
          }
        }

        const encodedUrl = proxyConfig.encodeUrl(url.toString());
        window.location.href = proxyConfig.prefix + encodedUrl;
      } catch (err) {
        console.error('Failed to encode or redirect:', err);
      }
    }
  });
}

// Register the UV service worker (optional if not already done elsewhere)
window.addEventListener('load', async () => {
  if (!navigator.serviceWorker.controller) {
    try {
      await navigator.serviceWorker.register('/active/uv/uv.sw.js', {
        scope: __uv$config.prefix
      });
      console.log('UV service worker registered!');
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
});


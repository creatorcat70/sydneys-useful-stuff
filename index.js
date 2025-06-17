// --- YouTube Section ---
let currentVideoId = null;
let currentVideoTitle = null;

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function showError(message) {
    const errorEl = document.getElementById('error-msg');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.getElementById('success-msg');
    successEl.textContent = message;
    successEl.style.display = 'block';
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

async function loadVideo() {
    const url = document.getElementById('youtube-url').value.trim();
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
        showError('Invalid YouTube URL. Please check the format.');
        return;
    }

    showLoading(true);
    currentVideoId = videoId;

    try {
        // Use youtube-nocookie.com for cookie-free embedding
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
        
        // Create video container
        const videoContainer = document.getElementById('video-container');
        videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        
        // Try to get video title (may fail due to CORS)
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const data = await response.json();
            currentVideoTitle = data.title;
            
            const videoInfo = document.getElementById('video-info');
            videoInfo.innerHTML = `
                <div class="video-title">${data.title}</div>
                <p><strong>Channel:</strong> ${data.author_name}</p>
            `;
        } catch (e) {
            // If we can't get the title, that's okay
            const videoInfo = document.getElementById('video-info');
            videoInfo.innerHTML = `<div class="video-title">YouTube Video</div>`;
        }

        // Show video section and download button
        document.getElementById('video-section').style.display = 'block';
        document.getElementById('download-btn').style.display = 'inline-flex';
        document.getElementById('no-video').style.display = 'none';
        
        showSuccess('Video loaded successfully!');
        
    } catch (error) {
        showError('Failed to load video. Please try again.');
    } finally {
        showLoading(false);
    }
}

function downloadVideo() {
    if (!currentVideoId) {
        showError('No video loaded to download');
        return;
    }

    // Create download links using popular YouTube download services
    const downloadOptions = [
        { name: 'Y2Mate', url: `https://www.y2mate.com/youtube/${currentVideoId}` },
        { name: 'SaveFrom.net', url: `https://en.savefrom.net/#url=https://youtube.com/watch?v=${currentVideoId}` },
        { name: 'KeepVid', url: `https://keepvid.com/?url=https://youtube.com/watch?v=${currentVideoId}` }
    ];

    const downloadWindow = window.open('', '_blank', 'width=600,height=400');
    downloadWindow.document.write(`
        <html>
        <head><title>Download Options - ${currentVideoTitle || 'YouTube Video'}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <h2>Download Options</h2>
            <p>Choose a download service:</p>
            ${downloadOptions.map(option => 
                `<p><a href="${option.url}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px 0;">${option.name}</a></p>`
            ).join('')}
            <hr>
            <p><small>Note: These are third-party services. Please respect copyright laws and YouTube's terms of service.</small></p>
            <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </body>
        </html>
    `);
}

// Allow Enter key to load video
document.getElementById('youtube-url').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadVideo();
    }
});

// --- Spotify Downloader ---
function extractSpotifyId(url) {
    // Supports track, album, playlist, artist
    const regex = /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    if (!match) return null;
    return {
        type: match[1],
        id: match[2]
    };
}

function downloadSpotify() {
    const url = document.getElementById('spotify-url').value.trim();
    if (!url) {
        showError('Please enter a Spotify URL');
        return;
    }

    const spotify = extractSpotifyId(url);
    if (!spotify) {
        showError('Invalid Spotify URL. Please check the format.');
        return;
    }

    // Provide download options using popular Spotify downloaders
    const downloadOptions = [
        {
            name: 'Spotify Downloader (spotifydown.com)',
            url: `https://spotifydown.com/?url=${encodeURIComponent(url)}`
        },
        {
            name: 'SpotDL',
            url: `https://spotdl.com/spotify/${spotify.type}/${spotify.id}`
        },
        {
            name: 'SnapSave',
            url: `https://snapsave.io/spotify-downloader?url=${encodeURIComponent(url)}`
        }
    ];

    const downloadWindow = window.open('', '_blank', 'width=600,height=400');
    downloadWindow.document.write(`
        <html>
        <head><title>Download Options - Spotify</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <h2>Spotify Download Options</h2>
            <p>Choose a download service:</p>
            ${downloadOptions.map(option => 
                `<p><a href="${option.url}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #1db954; color: white; text-decoration: none; border-radius: 5px; margin: 5px 0;">${option.name}</a></p>`
            ).join('')}
            <hr>
            <p><small>Note: These are third-party services. Please respect copyright laws and Spotify's terms of service.</small></p>
            <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </body>
        </html>
    `);
}

// Allow Enter key to trigger Spotify download
document.getElementById('spotify-url').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        downloadSpotify();
    }
});

// --- MLA Citation Maker ---
function generateMLACitation() {
    const author = document.getElementById('mla-author').value.trim();
    const title = document.getElementById('mla-title').value.trim();
    const website = document.getElementById('mla-website').value.trim();
    const publisher = document.getElementById('mla-publisher').value.trim();
    const date = document.getElementById('mla-date').value.trim();
    const url = document.getElementById('mla-url').value.trim();

    let citation = "";

    if (author) citation += author + ". ";
    if (title) citation += `"${title}." `;
    if (website) citation += `<i>${website}</i>, `;
    if (publisher) citation += publisher + ", ";
    if (date) citation += date + ", ";
    if (url) citation += url;

    // Remove trailing comma and space if needed
    citation = citation.replace(/, $/, "");

    if (!citation) {
        showError("Please fill in at least one field for the citation.");
        document.getElementById('mla-citation-result').style.display = "none";
        return;
    }

    document.getElementById('mla-citation-text').innerHTML = citation;
    document.getElementById('mla-citation-result').style.display = "block";
}

function copyMLACitation() {
    const text = document.getElementById('mla-citation-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showSuccess("Citation copied to clipboard!");
    });
}

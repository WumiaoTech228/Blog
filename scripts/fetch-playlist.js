import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const playlistId = '8529369110';
  
  // 12-hour Cache Bypass Logic
  const outputPath = path.join(__dirname, '../src/data/netease-playlist.json');
  if (fs.existsSync(outputPath)) {
    try {
      const stats = fs.statSync(outputPath);
      const mtime = stats.mtime.getTime();
      const ageHours = (Date.now() - mtime) / (1000 * 60 * 60);
      const forceFetch = process.env.FORCE_FETCH_PLAYLIST === 'true';
      
      const content = fs.readFileSync(outputPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (ageHours < 12 && !forceFetch) {
          console.log(`[Build Hook] Playlist cache is only ${ageHours.toFixed(1)} hours old. Skipping fetch to prevent NetEase API rate-limiting.`);
          return;
        }
      }
    } catch (e) {
      console.warn('[Build Hook] Failed to parse playlist cache. Proceeding to fetch fresh data.', e instanceof Error ? e.message : String(e));
    }
  }

  console.log(`[Build Hook] Fetching default NetEase playlist ${playlistId}...`);
  try {
    const playlistUrl = `https://music.163.com/api/v1/playlist/detail?id=${playlistId}`;
    const playlistRes = await fetch(playlistUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!playlistRes.ok) {
      throw new Error(`Failed to fetch playlist detail API: ${playlistRes.status}`);
    }

    const playlistData = await playlistRes.json();
    if (playlistData.code !== 200 || !playlistData.playlist || !playlistData.playlist.trackIds) {
      throw new Error(`Invalid playlist response code or missing playlist/trackIds: ${JSON.stringify(playlistData)}`);
    }

    const trackIds = playlistData.playlist.trackIds.map(t => t.id);
    console.log(`Found ${trackIds.length} track IDs. Fetching song details in batches...`);

    const tracks = [];
    const chunkSize = 100;
    
    for (let i = 0; i < trackIds.length; i += chunkSize) {
      const chunk = trackIds.slice(i, i + chunkSize);
      const idsParam = JSON.stringify(chunk);
      const detailUrl = `https://music.163.com/api/song/detail?ids=${encodeURIComponent(idsParam)}`;
      
      try {
        const detailRes = await fetch(detailUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (!detailRes.ok) {
          console.error(`[Build Hook] Failed to fetch chunk ${i / chunkSize + 1}: ${detailRes.status}`);
          console.warn(`[Build Hook] ⚠️  Continuing with partial data (chunk at index ${i} skipped).`);
          continue;
        }

        const detailData = await detailRes.json();
        if (detailData.songs && Array.isArray(detailData.songs)) {
          for (const s of detailData.songs) {
            const artists = s.artists ? s.artists.map(a => a.name).join('/') : '未知歌手';
            tracks.push({
              name: s.name,
              artist: artists,
              url: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3`
            });
          }
        }
      } catch (err) {
        console.error(`[Build Hook] Error fetching details for chunk starting at index ${i}:`, err);
      }
    }

    if (tracks.length === 0) {
      console.warn('[Build Hook] ⚠️  All API requests returned no songs. This likely means the NetEase endpoints require authentication.');
      throw new Error('Fetched 0 songs from detail APIs.');
    }

    const outputDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'netease-playlist.json'), JSON.stringify(tracks, null, 2));
    console.log(`[Build Hook] Successfully wrote ${tracks.length} tracks to netease-playlist.json`);
  } catch (err) {
    console.error('[Build Hook] Error pre-fetching playlist:', err);
    console.warn('[Build Hook] ⚠️  WARNING: Falling back to 3 local lofi tracks. The NetEase playlist will NOT be available.');
    console.warn('[Build Hook] ⚠️  ﻿This may be due to NetEase API authentication requirements or network issues.');
    // Write fallback local lofi tracks if fetch fails entirely
    const fallback = [
      { "name": "2 AM Debug Loop", "artist": "OpenLofi", "url": "https://cdn.jsdelivr.net/gh/btahir/open-lofi@main/tracks/activities/2-am-debug-loop.mp3" },
      { "name": "Brushstrokes & Rain", "artist": "OpenLofi", "url": "https://cdn.jsdelivr.net/gh/btahir/open-lofi@main/tracks/activities/brushstrokes-and-rain.mp3" },
      { "name": "Coffee Ring Notebook", "artist": "OpenLofi", "url": "https://cdn.jsdelivr.net/gh/btahir/open-lofi@main/tracks/activities/coffee-ring-notebook.mp3" }
    ];
    const outputDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'netease-playlist.json'), JSON.stringify(fallback, null, 2));
  }
}

main();

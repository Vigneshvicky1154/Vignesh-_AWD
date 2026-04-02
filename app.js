"use strict";
// --- MOCK DATA ---
const library = [
    { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', genre: 'Electronic', duration: '4:03', favorite: true, playCount: 150 },
    { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', genre: 'Rock', duration: '5:55', favorite: true, playCount: 342 },
    { id: '3', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', genre: 'Pop', duration: '3:20', favorite: false, playCount: 89 },
    { id: '4', title: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out', genre: 'Jazz', duration: '5:24', favorite: false, playCount: 45 },
];
let currentPlaylist = {
    name: "My Library",
    songs: [...library],
    createdDate: new Date(),
    songCount: library.length
};
// --- PLAYER STATE ---
let isPlaying = false;
let currentSong = null;
let progressInterval;
let currentSeconds = 0;
let totalSeconds = 0;
// --- CORE FUNCTIONS ---
const filterByGenre = (songs, genre) => {
    if (genre === 'All')
        return songs;
    return songs.filter(song => song.genre === genre);
};
const filterByArtist = (songs, artist) => {
    if (!artist || artist === 'All')
        return songs;
    return songs.filter(song => song.artist.toLowerCase().includes(artist.toLowerCase()));
};
const searchSongs = (songs, query) => {
    const lowerQuery = query.toLowerCase();
    return songs.filter(song => song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album.toLowerCase().includes(lowerQuery));
};
const sortBy = (songs, key, ascending = true) => {
    return [...songs].sort((a, b) => {
        if (a[key] < b[key])
            return ascending ? -1 : 1;
        if (a[key] > b[key])
            return ascending ? 1 : -1;
        return 0;
    });
};
const parseDurationToSeconds = (duration) => {
    const [mins, secs] = duration.split(':').map(Number);
    return (mins * 60) + secs;
};
const formatSecondsToTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
// --- DOM RENDERER ---
const updatePlayerUI = () => {
    const titleEl = document.getElementById('now-playing-title');
    const artistEl = document.getElementById('now-playing-artist');
    const timeTotalEl = document.getElementById('time-total');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = playPauseBtn.querySelector('.material-symbols-rounded');
    const coverEl = document.getElementById('now-playing-cover');
    const likeBtn = document.getElementById('like-btn');
    if (currentSong) {
        titleEl.textContent = currentSong.title;
        artistEl.textContent = currentSong.artist;
        timeTotalEl.textContent = currentSong.duration;
        coverEl.classList.add('active');
        if (currentSong.favorite) {
            likeBtn.classList.add('liked');
        }
        else {
            likeBtn.classList.remove('liked');
        }
    }
    if (isPlaying) {
        playIcon.textContent = 'pause';
    }
    else {
        playIcon.textContent = 'play_arrow';
    }
};
const tickProgress = () => {
    if (!isPlaying || !currentSong)
        return;
    if (currentSeconds >= totalSeconds) {
        // Song ended
        isPlaying = false;
        currentSeconds = 0;
        updatePlayerUI();
        clearInterval(progressInterval);
        return;
    }
    currentSeconds += 1; // Fake speed up by changing tick logic if needed, but going real-time here
    const progressEl = document.getElementById('progress-bar');
    const timeCurrentEl = document.getElementById('time-current');
    const percentage = (currentSeconds / totalSeconds) * 100;
    progressEl.style.width = `${percentage}%`;
    timeCurrentEl.textContent = formatSecondsToTime(currentSeconds);
};
const playSong = (song) => {
    currentSong = song;
    totalSeconds = parseDurationToSeconds(song.duration);
    currentSeconds = 0;
    isPlaying = true;
    updatePlayerUI();
    // Reset progress bar
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('time-current').textContent = '0:00';
    if (progressInterval)
        clearInterval(progressInterval);
    progressInterval = setInterval(tickProgress, 200); // Spead up interval 5x so it visually moves faster for the demo
};
const togglePlayPause = () => {
    if (!currentSong)
        return; // No song loaded
    isPlaying = !isPlaying;
    updatePlayerUI();
};
const toggleLike = () => {
    if (!currentSong)
        return;
    currentSong.favorite = !currentSong.favorite;
    updatePlayerUI();
};
const renderGrid = (songs) => {
    const grid = document.getElementById('playlist-grid');
    grid.innerHTML = ''; // Clear current grid
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
      <div class="cover-wrapper">
        <div class="cover-placeholder">
          <span class="material-symbols-rounded">music_note</span>
        </div>
        <div class="play-overlay">
          <span class="material-symbols-rounded">play_circle</span>
        </div>
      </div>
      <div class="song-info">
        <h3>${song.title}</h3>
        <p>${song.artist} • ${song.album}</p>
      </div>
      <div class="song-meta">
        <span class="genre-tag">${song.genre}</span>
        <span>${song.duration}</span>
      </div>
    `;
        card.addEventListener('click', () => playSong(song));
        grid.appendChild(card);
    });
};
// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    renderGrid(currentPlaylist.songs);
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const artistFilter = document.getElementById('artist-filter');
    const sortFilter = document.getElementById('sort-filter');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const likeBtn = document.getElementById('like-btn');
    playPauseBtn.addEventListener('click', togglePlayPause);
    likeBtn.addEventListener('click', toggleLike);
    const applyFilters = () => {
        let filtered = currentPlaylist.songs;
        // Apply Search
        if (searchInput.value) {
            filtered = searchSongs(filtered, searchInput.value);
        }
        // Apply Genre
        filtered = filterByGenre(filtered, genreFilter.value);
        // Apply Artist
        filtered = filterByArtist(filtered, artistFilter.value);
        // Apply Sort
        const sortValue = sortFilter.value;
        if (sortValue !== 'id') {
            filtered = sortBy(filtered, sortValue, sortValue !== 'playCount');
        }
        renderGrid(filtered);
    };
    searchInput.addEventListener('input', applyFilters);
    genreFilter.addEventListener('change', applyFilters);
    artistFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
});

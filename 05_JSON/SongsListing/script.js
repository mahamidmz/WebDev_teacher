// Global data (loaded from LOCALSTORAGE)
let songs = [];

// DOM references
const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const submitBtn = document.getElementById('submitBtn');

const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const toggleViewBtn = document.getElementById('toggleView');
const tableView = document.getElementById('tableView');
const cardsContainer = document.getElementById('cardsContainer');
const playerFrame = document.getElementById('player');

let currentView = 'table'; // 'table' | 'cards'

// Load from LOCALSTORAGE on page load
document.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('songs');

    if (storedData) {
        try {
            songs = JSON.parse(storedData) || [];
        } catch {
            songs = [];
        }
    } else {
        songs = [];
    }

    updateViewButton();
    renderSongs();
});

// --- Form submit: add / update song ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleEl = document.getElementById('title');
    const urlEl = document.getElementById('url');
    const ratingEl = document.getElementById('rating');
    const idEl = document.getElementById('songId');

    const title = titleEl.value.trim();
    const url = urlEl.value.trim();
    const rating = parseInt(ratingEl.value, 10);
    const existingId = idEl.value;

    if (!title || !url || isNaN(rating)) {
        return;
    }

    if (existingId) {
        // Update existing song
        const idx = songs.findIndex((s) => s.id === Number(existingId));
        if (idx !== -1) {
            songs[idx].title = title;
            songs[idx].url = url;
            songs[idx].rating = rating;
        }
    } else {
        // Add new song
        const song = {
            id: Date.now(),
            title,
            url,
            rating,
            dateAdded: Date.now()
        };
        songs.push(song);
    }

    saveAndRender();

    // Reset form back to "Add" mode
    form.reset();
    ratingEl.value = 5;
    idEl.value = '';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-success');
});

// Search, sort & view toggle
searchInput.addEventListener('input', renderSongs);
sortSelect.addEventListener('change', renderSongs);

toggleViewBtn.addEventListener('click', () => {
    currentView = currentView === 'table' ? 'cards' : 'table';
    updateViewButton();
    renderSongs();
});

// Save to LOCALSTORAGE and re-render
function saveAndRender() {
    localStorage.setItem('songs', JSON.stringify(songs));
    renderSongs();
}

// Update button text + which view is shown
function updateViewButton() {
    if (currentView === 'table') {
        tableView.classList.remove('d-none');
        cardsContainer.classList.add('d-none');
        toggleViewBtn.textContent = 'Cards View';
    } else {
        tableView.classList.add('d-none');
        cardsContainer.classList.remove('d-none');
        toggleViewBtn.textContent = 'Table View';
    }
}

// Build filtered/sorted list
function getFilteredSortedSongs() {
    let result = [...songs];

    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        result = result.filter((song) =>
            song.title.toLowerCase().includes(searchTerm)
        );
    }

    switch (sortSelect.value) {
        case 'az':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'ratingDesc':
            result.sort(
                (a, b) => (b.rating || 0) - (a.rating || 0)
            );
            break;
        case 'ratingAsc':
            result.sort(
                (a, b) => (a.rating || 0) - (b.rating || 0)
            );
            break;
        case 'newest':
        default:
            result.sort(
                (a, b) => (b.dateAdded || 0) - (a.dateAdded || 0)
            );
            break;
    }

    return result;
}

// Render songs in current view (table / cards)
function renderSongs() {
    const data = getFilteredSortedSongs();

    list.innerHTML = '';
    cardsContainer.innerHTML = '';

    data.forEach((song) => {
        const ratingText = song.rating != null ? song.rating : '';

        const thumb = getThumbnailUrl(song.url);

        if (currentView === 'table') {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="align-middle text-center">
                    <input type="radio"
                           name="currentSong"
                           onclick="playSong('${encodeURIComponent(song.url)}')" />
                </td>
                <td class="align-middle">
                    ${thumb
                    ? `<img src="${thumb}" class="img-thumbnail" style="max-width:120px;" alt="Thumbnail" />`
                    : ''}
                </td>
                <td class="align-middle">${song.title}</td>
                <td class="align-middle">${ratingText}</td>
                <td class="align-middle">
                    <a href="${song.url}" target="_blank" class="text-info">Watch</a>
                </td>
                <td class="align-middle text-end">
                    <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            list.appendChild(row);
        } else {
            const col = document.createElement('div');
            col.className = 'col';

            col.innerHTML = `
                <div class="card h-100 bg-dark border-secondary">
                    ${thumb
                    ? `<img src="${thumb}" class="card-img-top" alt="Thumbnail" />`
                    : ''}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${song.title}</h5>
                        <p class="card-text mb-2">Rating: ${ratingText}</p>

                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <div class="form-check">
                                <input class="form-check-input"
                                       type="radio"
                                       name="currentSong"
                                       onclick="playSong('${encodeURIComponent(song.url)}')" />
                                <label class="form-check-label">Play</label>
                            </div>

                            <div>
                                <a href="${song.url}" target="_blank" class="btn btn-sm btn-outline-info me-2">
                                    <i class="fas fa-play"></i> Watch
                                </a>
                                <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            cardsContainer.appendChild(col);
        }
    });
}

// Delete song
function deleteSong(id) {
    if (!confirm('Are you sure?')) return;

    songs = songs.filter((song) => song.id !== id);
    saveAndRender();
}

// Edit song: load into form
function editSong(id) {
    const songToEdit = songs.find((song) => song.id === id);
    if (!songToEdit) return;

    document.getElementById('title').value = songToEdit.title;
    document.getElementById('url').value = songToEdit.url;
    document.getElementById('rating').value = songToEdit.rating ?? 5;
    document.getElementById('songId').value = songToEdit.id;

    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-warning');
}

// --- YouTube helpers ---

function getYouTubeId(url) {
    if (!url) return null;

    // Supports https://www.youtube.com/watch?v=XXXX, youtu.be/XXXX, shorts, embed etc.
    const regExp =
        /(?:youtube\.com\/(?:.*[?&]v=|(?:v|e(?:mbed)?|shorts)\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

function getThumbnailUrl(url) {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

// Called from radio buttons (table/cards)
function playSong(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    const id = getYouTubeId(url);
    if (!id || !playerFrame) return;

    playerFrame.src = `https://www.youtube.com/embed/${id}`;
}

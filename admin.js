import { getRegistrations } from './firebase-config.js';

let currentView = 'registrations';
const views = {
    registrations: document.getElementById('registrations-view'),
    photos: document.getElementById('photos-view')
};
const photoGrid = document.getElementById('photo-grid');
const modal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const modalInfo = document.getElementById('modal-info');
const registrationsData = new Map(); // Store registration data for reference

// Initialize the page
async function initialize() {
    setupEventListeners();
    await refreshData();
    setInterval(refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
}

function setupEventListeners() {
    // Tab switching
    document.querySelector('.tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            switchView(e.target.dataset.view);
        }
    });

    // Modal close button
    document.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Refresh button
    document.getElementById('refresh').addEventListener('click', refreshData);

    // Filter input
    document.getElementById('filter').addEventListener('input', handleFilter);
}

function switchView(viewName) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Show/hide views
    Object.entries(views).forEach(([name, element]) => {
        element.style.display = name === viewName ? 'block' : 'none';
    });

    currentView = viewName;
}

async function refreshData() {
    try {
        const result = await getRegistrations();
        if (!result.ok) throw new Error('Failed to fetch registrations');

        registrationsData.clear();
        result.rows.forEach(row => registrationsData.set(row.uuid, row));

        updateRegistrationsTable(result.rows);
        updatePhotoGallery(result.rows);
        
        document.getElementById('last-updated').textContent = 
            'Last updated: ' + new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

function updateRegistrationsTable(rows) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Children</th>
                <th>Photos</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map(row => `
                <tr>
                    <td>${new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>${row.parentFirst} ${row.parentLast}</td>
                    <td>${row.email}</td>
                    <td>${row.phone || ''}</td>
                    <td>${row.children || ''}</td>
                    <td>${row.photosTaken || 0}/${row.numPhotos || 1}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    const container = document.getElementById('rows');
    container.innerHTML = '';
    container.appendChild(table);
}

function updatePhotoGallery(rows) {
    photoGrid.innerHTML = '';
    
    rows.forEach(registration => {
        if (registration.photos) {
            Object.entries(registration.photos).forEach(([photoNum, photoData]) => {
                const photoCard = document.createElement('div');
                photoCard.className = 'photo-card';
                photoCard.innerHTML = `
                    <img src="${photoData.url}" alt="Photo ${photoNum}">
                    <div class="photo-info">
                        <strong>${registration.parentFirst} ${registration.parentLast}</strong><br>
                        Photo ${photoNum} of ${registration.numPhotos || 1}<br>
                        <small>${new Date(photoData.takenAt).toLocaleString()}</small>
                    </div>
                    <div class="photo-actions">
                        <button onclick="window.open('${photoData.url}', '_blank')">Download</button>
                        <button onclick="viewPhoto('${photoData.url}', '${registration.parentFirst} ${registration.parentLast}', '${photoData.takenAt}')">View</button>
                    </div>
                `;
                photoGrid.appendChild(photoCard);
            });
        }
    });

    if (photoGrid.children.length === 0) {
        photoGrid.innerHTML = '<p>No photos taken yet.</p>';
    }
}

function handleFilter(e) {
    const filter = e.target.value.toLowerCase();
    const rows = [...registrationsData.values()];
    
    const filtered = rows.filter(row => 
        `${row.parentFirst} ${row.parentLast}`.toLowerCase().includes(filter) ||
        row.email.toLowerCase().includes(filter)
    );

    if (currentView === 'registrations') {
        updateRegistrationsTable(filtered);
    } else {
        updatePhotoGallery(filtered);
    }
}

// Show photo in modal
window.viewPhoto = function(url, name, date) {
    modalImage.src = url;
    modalInfo.textContent = `${name} - ${new Date(date).toLocaleString()}`;
    modal.classList.add('active');
};

// Initialize on page load
initialize();
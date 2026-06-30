// public/js/map.js

// Leaflet requires [Latitude, Longitude] to draw the map, so we flip the MongoDB coordinates
const lat = listingCoordinates[1];
const lng = listingCoordinates[0];

// Initialize the map
const map = L.map('map').setView([lat, lng], 13);

// Load the free OpenStreetMap visual tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Drop a pin exactly on the location
const marker = L.marker([lat, lng]).addTo(map);

// Add popup with the location name
marker.bindPopup(`<b>${listingLocation}</b><br>Exact location provided after booking!`).openPopup();
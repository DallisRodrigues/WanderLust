// public/js/formMap.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Determine starting coordinates (Use existing listing coordinates if editing, otherwise default to Mumbai)
    let initialLat = typeof startCoordinates !== "undefined" ? startCoordinates[1] : 19.0760;
    let initialLng = typeof startCoordinates !== "undefined" ? startCoordinates[0] : 72.8777;
    let defaultZoom = typeof startCoordinates !== "undefined" ? 13 : 5;

    // 2. Initialize the map container
    const map = L.map('form-map').setView([initialLat, initialLng], defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 3. Drop a Draggable Marker onto the starting point
    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

    const locationInput = document.getElementById("location-input");
    const countryInput = document.getElementById("country-input");
    const searchBtn = document.getElementById("search-location-btn");

    // 4. Reverse Geocoding: Updates text input fields automatically when the pin is dragged
    async function updateInputsFromPin(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
                headers: { 'User-Agent': 'WanderLust_Application_Dev' }
            });
            const data = await response.json();
            
            if (data && data.address) {
                // Extract the most descriptive regional name available
                const locationName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.name || "";
                const countryName = data.address.country || "";
                
                if (locationName) locationInput.value = locationName;
                if (countryName) countryInput.value = countryName;
            }
        } catch (err) {
            console.error("Reverse geocoding failed:", err);
        }
    }

    // Monitor drag action
    marker.on('dragend', function () {
        const position = marker.getLatLng();
        updateInputsFromPin(position.lat, position.lng);
    });

    // 5. Geocoding: Moves map and pin automatically when the "Find on Map" button is clicked
    searchBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Stop form submission
        const locationVal = locationInput.value;
        const countryVal = countryInput.value;

        if (!locationVal) return;

        const query = encodeURIComponent(`${locationVal}, ${countryVal}`);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
                headers: { 'User-Agent': 'WanderLust_Application_Dev' }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                
                map.setView([lat, lng], 13);
                marker.setLatLng([lat, lng]);
            } else {
                alert("Location not found on the map. Try adjusting your spelling!");
            }
        } catch (err) {
            console.error("Forward geocoding failed:", err);
        }
    });
});
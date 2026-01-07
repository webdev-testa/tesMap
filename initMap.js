// Initialize and add the map
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { Autocomplete } = await google.maps.importLibrary("places");

    // Default center (Malang, East Java)
    const defaultLocation = { lat: -7.9666, lng: 112.6326 };

    console.log("Initializing Map..."); // Debug Log

    const map = new Map(document.getElementById("map"), {
        zoom: 13,
        center: defaultLocation,
        mapId: "DEMO_MAP_ID", 
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const autocomplete = new Autocomplete(input, {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "id" },
    });

    // Bind the map's bounds (viewport) bias to the autocomplete object,
    autocomplete.bindTo("bounds", map);

    // Initial Marker
    const marker = new AdvancedMarkerElement({
        map: map,
        position: defaultLocation,
        gmpDraggable: true, 
        title: "Drag me!"
    });

    // Initialize Geocoder
    const geocoder = new google.maps.Geocoder();

    // Listener for dragging the Advanced Marker
    marker.addListener("dragend", () => {
        const position = marker.position; 
        console.log("New Pin Position:", position); // position is usually fine as is or .toJSON()

        // Reverse Geocoding
        geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                    // Update search box with the address
                    input.value = results[0].formatted_address;
                    
                    // Copy address to Delivery Address Details
                    const addressTextarea = document.getElementById("deliveryAddress");
                    if (addressTextarea) {
                        addressTextarea.value = results[0].formatted_address;
                    }

                    console.log("Selected Place (Drag):", results[0].formatted_address);
                    console.log("Full Result:", results[0]);
                } else {
                    window.alert("No results found");
                }
            } else {
                window.alert("Geocoder failed due to: " + status);
            }
        });
    });

    // Listen for the event fired when the user selects a prediction and click
    // "Enter".
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        
        marker.position = place.geometry.location;
        console.log("Selected Place:", place.formatted_address);
        
        // Copy address to Delivery Address Details
        const addressTextarea = document.getElementById("deliveryAddress");
        if (addressTextarea) {
            addressTextarea.value = place.formatted_address;
        }
    });
    // Try HTML5 Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update Map and Marker
                map.setCenter(pos);
                map.setZoom(17);
                marker.position = pos;
                console.log("User Location Found:", pos);

            },
            () => {
                console.log("Geolocation denied or failed. Using default location (Malang).");
            }
        );
    }
}

// Call initMap when the script loads (since we removed the callback from the script tag)
initMap();

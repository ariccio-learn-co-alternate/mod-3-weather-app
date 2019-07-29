

function mapClick(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    fetch(`http://localhost:3000/stations/${btoa(JSON.stringify(body))}`)
    
}


"use strict";


function createCity(station) {
    const cityP = document.createElement("p");
    cityP.innerText = `City: ${station.city}`;
    cityP.id = "your-station-city";
    return cityP;
}

function createState(station) {
    const stateP = document.createElement("p");
    stateP.innerText = `State: ${station.state}`;
    stateP.id = "your-station-state";
    return stateP;
}

function createStationID(station) {
    const stationIDP = document.createElement("p");
    stationIDP.innerText = `station ID: ${station.id}`;
    stationIDP.id = "your-station-id";
    return stationIDP;
}

function createStationLat(station) {
    const latP = document.createElement("p");
    latP.innerText = `Station latitude: ${station.latitude}`;
    latP.id = "your-station-lat";
    return latP;
}

function createStationLong(station) {
    const longP = document.createElement("p");
    longP.innerText = `Station longitude: ${station.longitude}`;
    longP.id = "your-station-long";
    return longP;
}

function createStationNOAAID(station) {
    const noaaIDP = document.createElement("p");
    noaaIDP.innerText = `noaa_id: ${station.noaa_id}`;
    noaaIDP.id = "your-station-noaa-id";
    return noaaIDP;
}

function appendStationInfo(station) {
    const stationDataDiv = document.querySelector("#station-data");
    stationDataDiv.innerHTML = "";

    const newDiv = document.createElement("div");
    newDiv.id = "your-station-data";
    

    // Example data:
        // city: "Westchester Co Airport"
        // created_at: "2019-07-29T18:14:59.267Z"
        // id: 108
        // latitude: 41.06694
        // longitude: -73.7075
        // noaa_id: "GHCND:USW00094745"
        // state: "NY"
        // updated_at: "2019-07-29T18:14:59.267Z"

    newDiv.appendChild(createCity(station));
    newDiv.appendChild(createState(station));
    newDiv.appendChild(createStationID(station));
    newDiv.appendChild(createStationLat(station));
    newDiv.appendChild(createStationLong(station));
    newDiv.appendChild(createStationNOAAID(station));

    stationDataDiv.appendChild(newDiv);
}

function mapClick(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    fetch(`http://localhost:3000/stations/${btoa(JSON.stringify(body))}`).then(res => res.json()).then(response => {
        console.log(response);
        appendStationInfo(response);
    })
    
}


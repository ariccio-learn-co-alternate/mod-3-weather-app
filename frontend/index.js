"use strict";
const BASE_SERVER_PATH = "http://localhost:3000";

const BASE_YOUR_STATION_ID = "your-station";
const INPUT_BOX_CLASS = "input-box";
const YEAR_INPUT_BOX_FORM_ID = "year-input-box-form"

function createCity(station) {
    const cityP = document.createElement("p");
    cityP.innerText = `City: ${station.city}`;
    cityP.id = `${BASE_YOUR_STATION_ID}-city`;
    return cityP;
}

function createState(station) {
    const stateP = document.createElement("p");
    stateP.innerText = `State: ${station.state}`;
    stateP.id = `${BASE_YOUR_STATION_ID}-state`;
    return stateP;
}

function createStationID(station) {
    const stationIDP = document.createElement("p");
    stationIDP.innerText = `station ID: ${station.id}`;
    stationIDP.id = `${BASE_YOUR_STATION_ID}-id`;
    return stationIDP;
}

function createStationLat(station) {
    const latP = document.createElement("p");
    latP.innerText = `Station latitude: ${station.latitude}`;
    latP.id = `${BASE_YOUR_STATION_ID}-lat`;
    return latP;
}

function createStationLong(station) {
    const longP = document.createElement("p");
    longP.innerText = `Station longitude: ${station.longitude}`;
    longP.id = `${BASE_YOUR_STATION_ID}-long`;
    return longP;
}

function createStationNOAAID(station) {
    const noaaIDP = document.createElement("p");
    noaaIDP.innerText = `noaa_id: ${station.noaa_id}`;
    noaaIDP.id = `${BASE_YOUR_STATION_ID}-noaa-id`;
    return noaaIDP;
}

function renderStationSubDiv(station) {
    const newDiv = document.createElement("div");
    newDiv.id = `${BASE_YOUR_STATION_ID}-data`;
    

    // Example data:
        // city: "Westchester Co Airport"
        // created_at: "2019-07-29T18:14:59.267Z"
        // id: 108
        // latitude: 41.06694
        // longitude: -73.7075
        // noaa_id: "GHCND:USW00094745"
        // state: "NY"
        // updated_at: "2019-07-29T18:14:59.267Z"

    // Station location data:
    newDiv.appendChild(createCity(station));
    newDiv.appendChild(createState(station));
    newDiv.appendChild(createStationID(station));
    newDiv.appendChild(createStationLat(station));
    newDiv.appendChild(createStationLong(station));
    newDiv.appendChild(createStationNOAAID(station));
    
    return newDiv;
}

function renderYearInputBox(station) {
    const oldForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    oldForm.hidden = false;
    oldForm.dataset.noaa_id = station.noaa_id;


}

function appendStationInfo(station) {
    const stationDataDiv = document.querySelector("#station-data");
    stationDataDiv.innerHTML = "";
    stationDataDiv.appendChild(renderStationSubDiv(station));

    // precipitation,
    // snow,
    // average temp
    // max temp
    // min temp

    renderYearInputBox(station);
}

function mapClick(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    fetch(`${BASE_SERVER_PATH}/stations/${btoa(JSON.stringify(body))}`).then(res => res.json()).then(response => {
        console.log(response);
        appendStationInfo(response);
    })
    
}


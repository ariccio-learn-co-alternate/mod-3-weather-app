"use strict";
const BASE_SERVER_PATH = "http://localhost:3000";
const BASE_YOUR_STATION_ID = "your-station";
const INPUT_BOX_CLASS = "input-box";
const YEAR_INPUT_BOX_FORM_ID = "year-input-box-form";
const MONTHLY_DATA_TABLE_ID = "monthly-data-table";
const MONTHLY_DATA_TABLE_WRAPPER = "monthly-data-table-wrapper";
const MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.",
    "Sep.", "Oct.", "Nov.", "Dec."];

let chart = null;
let curStationMarker = null;
let curHighlightedMonthCell = null;

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

// function createStationID(station) {
//     const stationIDP = document.createElement("p");
//     stationIDP.innerText = `station ID: ${station.id}`;
//     stationIDP.id = `${BASE_YOUR_STATION_ID}-id`;
//     return stationIDP;
// }

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

// function createStationNOAAID(station) {
//     const noaaIDP = document.createElement("p");
//     noaaIDP.innerText = `noaa_id: ${station.noaa_id}`;
//     noaaIDP.id = `${BASE_YOUR_STATION_ID}-noaa-id`;
//     return noaaIDP;
// }

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
    const infoHeading = document.createElement('h3')
    infoHeading.innerText = "Station Info"
    newDiv.appendChild(infoHeading)
    newDiv.appendChild(createCity(station));
    newDiv.appendChild(createState(station));
    // newDiv.appendChild(createStationID(station));
    newDiv.appendChild(createStationLat(station));
    newDiv.appendChild(createStationLong(station));
    // newDiv.appendChild(createStationNOAAID(station));

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

function fetchStationURL(event) {
    const body = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
    };
    return `${BASE_SERVER_PATH}/stations/${btoa(JSON.stringify(body))}`;
}

function renderYear(response, graphDatatypeInput) {
    console.log(response);
    slapYearDataOnDOM(response);
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }
    // document.getElementById("graph-temperature-button").addEventListener('click', )
}


function makeStationMarker(response) {
    if (curStationMarker) {
        curStationMarker.setMap(null)
    }
    curStationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(response.latitude, response.longitude),
        map: map,
        title: 'Current Station',
        label: 'S'
    });
}

function mapClick(event) {
    document.querySelector('#instructions-for-table').hidden = true
    fetch(fetchStationURL(event))
        .then(res => res.json()).then(response => {
            console.log(response);
            const chartHolder = document.querySelector('#monthly-data-table-wrapper')
            chartHolder.innerHTML = ""
            makeStationMarker(response)
            document.querySelector('#divider').hidden = false;
            if (chart) {
                chart.destroy()
                chart = null
                document.querySelector('#graph-canvas').innerHTML = ""
            }

            appendStationInfo(response);

        }
        ).catch(
            _ => alert("NOAA sent back bad data. Try another location or time span.")
        )

}

function fetchYearURL(target, userYear) {
    // noaa_id : ...
    // year : ...
    const body = {
        noaa_id: target.dataset.noaa_id,
        year: userYear
    };
    return `${BASE_SERVER_PATH}/weather/monthly/${btoa(JSON.stringify(body))}`;
}

function findOldTableAndEmptyOrCreateEmptyTable(id, div) {
    const table = document.querySelector(`#${id}`);
    if (!table) {
        const newTable = document.createElement("table");
        newTable.className = 'table table-dark smushed-table';
        newTable.id = id;
        const divToAddTo = document.querySelector(`#${div}`);
        divToAddTo.appendChild(newTable);
        return newTable;
    }
    table.innerHTML = "";
    return table;
}

// function newTableHeader(headerText) {
//     const newThead = document.createElement("thead");
//     const newTR = document.createElement("tr");
//     const newTH = document.createElement("th");
//     newTH.innerText = headerText;
//     newTH.colSpan = 3;
//     newTH.className = 'thead';

//     newTR.appendChild(newTH);
//     newThead.appendChild(newTR);
//     return newThead;
// }


function topRow(year, noaa_id) {
    // const headerTR = document.createElement("tr");
    // const monthTH = document.createElement("th");
    // monthTH.innerText = "Month";
    // headerTR.appendChild(monthTH);

    // const tempTH = document.createElement("th");
    // tempTH.innerText = "Average temperature (\xB0F)";
    // headerTR.appendChild(tempTH);

    // const precipTH = document.createElement("th");
    // precipTH.innerText = "Total precipitation (in.)";
    // headerTR.appendChild(precipTH);

    // const snowTH = document.createElement("th");
    // snowTH.innerText = "Total snow (in.)";
    // headerTR.appendChild(snowTH);
    const headerTR = document.createElement("tr");
    const corner = document.createElement('th');
    corner.innerText = `Monthly Data for ${year}`
    corner.id = "table-corner"
    corner.addEventListener('click', function (e) {
        if (curHighlightedMonthCell != null) {
            curHighlightedMonthCell.className = ""
            curHighlightedMonthCell = null
            clearTableColor()
        }
        rerenderChart()
    })
    headerTR.appendChild(corner)
    MONTHS.forEach(
        function (month) {
            const header = document.createElement("th");
            header.innerText = month;
            header.dataset.monthNum = MONTHS.indexOf(month) + 1
            headerTR.appendChild(header)
        }
    )
    headerTR.dataset.noaaId = noaa_id
    headerTR.dataset.year = year
    headerTR.addEventListener('click', submitMonthData)
    return headerTR;
}

function rerenderChart() {
    const yearForm = document.querySelector('#year-input-box-form')
    const graphDatatypeInput = yearForm.graph_datatype_input.value
    const userYear = parseInt(yearForm.year.value);
    console.log(`user wants data for year ${userYear}`);
    fetch(fetchYearURL(yearForm, userYear)).then(res => res.json()).then(response => {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
        window.scrollTo(0, document.body.scrollHeight);
    }).catch(
        _ => alert("NOAA sent back bad data. Try another location or time span.")
    )
}

function submitMonthData(event) {
    const cell = event.target
    if (cell.dataset.monthNum != null) {

        if (curHighlightedMonthCell != null) {
            curHighlightedMonthCell.className = ""
            clearTableColor()
        }

        curHighlightedMonthCell = cell

        highlightCol(cell)

        const month = cell.dataset.monthNum
        const noaaId = cell.parentNode.dataset.noaaId
        const year = cell.parentNode.dataset.year
        const body = {
            noaa_id: noaaId,
            year: year,
            month: month
        };
        const url = `${BASE_SERVER_PATH}/weather/daily/${btoa(JSON.stringify(body))}`
        fetch(url).then(res => res.json()).then(dailyData => renderDailyChart(dailyData)).catch(
            _ => alert("NOAA sent back bad data. Try another location or time span.")
        )
    }

}

function highlightCol(cell) {
    cell.className = "bg-primary"

    const tBody = document.querySelector('tbody')

    tBody.childNodes.forEach(
        function (row) {
            row.childNodes[cell.dataset.monthNum].className = "bg-primary"
        }
    )
}

function clearTableColor() {
    const tBody = document.querySelector('tbody')
    tBody.childNodes.forEach(
        function (row) {
            row.childNodes.forEach(
                function (cell) {
                    cell.className = ""
                }
            )
        }
    )
}



function createTempRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Average temperature (\xB0F)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.mean_temp === undefined) {
                cell.innerText = "No Data"
            }
            else { cell.innerText = result.mean_temp }
            newTR.appendChild(cell)
        }
    )
}

function createPrecipRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Total precipitation (in.)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.total_precip === undefined) {
                cell.innerText = "No Data"
            }
            else { cell.innerText = result.total_precip }
            newTR.appendChild(cell)
        }
    )
}

function createSnowRow(newTR, results) {
    const firstCell = document.createElement('td')
    firstCell.innerText = "Total snowfall (in.)"
    newTR.appendChild(firstCell)
    results.forEach(
        function (result) {
            const cell = document.createElement('td')
            if (result.total_snow === undefined) {
                cell.innerText = "No Data"
            }
            else {
                cell.innerText = result.total_snow
            }
            newTR.appendChild(cell)
        }
    )
}




// function createRow(tr, rowData) {
//     const monthTd = document.createElement("td");
//     monthTd.innerText = rowData["month"];
//     tr.appendChild(monthTd);

//     const tempTd = document.createElement("td");
//     tempTd.innerText = rowData["mean_temp"];
//     tr.appendChild(tempTd);

//     const precipTd = document.createElement("td");
//     precipTd.innerText = rowData["total_precip"];
//     tr.appendChild(precipTd);

//     const snowTd = document.createElement("td");
//     snowTd.innerText = rowData["total_snow"];
//     tr.appendChild(snowTd);
// }


function slapYearDataOnDOM(response) {
    const table = findOldTableAndEmptyOrCreateEmptyTable(MONTHLY_DATA_TABLE_ID, MONTHLY_DATA_TABLE_WRAPPER);

    // const tHead = document.createElement('th')
    // tHead.colSpan = 13
    // table.appendChild(tHead);

    table.appendChild(topRow(response.meta.year, response.meta.noaa_id));

    const tBody = document.createElement("tbody");

    const tempTR = document.createElement('tr')
    createTempRow(tempTR, response.results)
    tBody.append(tempTR)

    const precipTR = document.createElement('tr')
    createPrecipRow(precipTR, response.results)
    tBody.append(precipTR)

    const snowTR = document.createElement('tr')
    createSnowRow(snowTR, response.results)
    tBody.append(snowTR)
    // for (let i = 0; i < response.results.length; i++) {
    //     const newTR = document.createElement("tr");
    //     createRow(newTR, response.results[i]);
    //     newTR.className = "smushed-row"
    //     tBody.appendChild(newTR);
    // }
    table.appendChild(tBody);
}

function renderDailyChart(response) {
    console.log(response);
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), dailyChartConfig(response));
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), dailyChartConfig(response));
        window.scrollTo(0, document.body.scrollHeight);
    }
}

function yearFormHandler(event) {
    event.preventDefault();
    const userYear = parseInt(event.target.year.value);
    console.log(`user wants data for year ${userYear}`);
    fetch(fetchYearURL(event.target, userYear)).then(res => res.json()).then(response => {
        renderYear(response, event.target.graph_datatype_input.value);
        const directions = document.querySelector('#instructions-for-table')
        directions.hidden = false;
    }).catch(
        _ => alert("NOAA sent back bad data. Try another location or time span.")
    )
}
// I know it's not C++, don't @ me bro.
function main() {
    const yearForm = document.querySelector(`#${YEAR_INPUT_BOX_FORM_ID}`);
    yearForm.addEventListener('submit', yearFormHandler);
    // chart = chart(ctx, config);
}

main();

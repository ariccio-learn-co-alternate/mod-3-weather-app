function datasetFromResponse(response, label, key) {
    const dataset = {
        label: label,
        backgroundColor: 'black',
        borderColor: 'black',
        data: response.results.map(result => result[key]),
        fill: false
    }
    return dataset;
}

function axesWithLabel(label) {
    const axe = {
        display: true,
        scaleLabel: {
            display: true,
            labelString: label
        }
    }
    return axe;
}

function chartConfig(response, graphDatatypeInput) {
    // based on sample code: https://github.com/chartjs/Chart.js/blob/master/samples/charts/line/basic.html
    const config = {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [
                datasetFromResponse(response, graphDatatypeInput, graphDatatypeInput)
            ]
        },
        options: {

            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Data for ${response.meta.noaa_id}`
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                xAxes: [axesWithLabel('month')],
                yAxes: [axesWithLabel(graphDatatypeInput)]
            }
        }
    };
    return config;
}

function renderYear(response, graphDatatypeInput) {
    console.log(response);
    slapYearDataOnDOM(response);
    if (chart == null) {
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
    }
    else {
        chart.destroy();
        chart = new Chart(graphCanvas2dCtx(), chartConfig(response, graphDatatypeInput));
    }
    // document.getElementById("graph-temperature-button").addEventListener('click', )
}



function graphCanvas2dCtx() {
    const graphCanvas = document.getElementById("graph-canvas");
    const graphCanvasCtx = graphCanvas.getContext('2d');
    return graphCanvasCtx;
}
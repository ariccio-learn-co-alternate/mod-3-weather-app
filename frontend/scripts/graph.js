function datasetFromResponse(response, label, key) {

    let color = 'black'


    if (key === 'max_temp') {
        color = 'red'
    }
    else if (key === 'min_temp') {
        color = 'blue'
    }
    const dataset = {
        label: label,
        backgroundColor: color,
        borderColor: color,
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
    let dataTypeString = graphDatatypeInput.replace('_', ' ');
    const config = {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [
                datasetFromResponse(response, dataTypeString, graphDatatypeInput),
            ]
        },
        options: {

            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Monthly data for ${response.meta.city}, ${response.meta.state}`
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
                yAxes: [axesWithLabel(dataTypeString)]
            }
        }
    };
    return config;
}

function dailyChartConfig(response) {
    console.log(response)
    labels = []
    for (let i = 1; i <= response["results"].length; i++) {
        labels.push(i)
    }
    // based on sample code: https://github.com/chartjs/Chart.js/blob/master/samples/charts/line/basic.html
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                datasetFromResponse(response, 'daily high', 'max_temp'),
                datasetFromResponse(response, 'daily low', 'min_temp')
            ]
        },
        options: {

            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Daily data for ${response.meta.city}, ${MONTHS[response.meta.month - 1]}, ${response.meta.year}`
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
                xAxes: [axesWithLabel('day')],
                yAxes: [axesWithLabel('temperature (\xB0F)')]
            }
        }
    };
    return config;
}

function graphCanvas2dCtx() {
    const graphCanvas = document.getElementById("graph-canvas");
    const graphCanvasCtx = graphCanvas.getContext('2d');
    return graphCanvasCtx;
}
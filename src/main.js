// Supports weights 300-900
import "@fontsource-variable/merriweather/standard.css";
import '@fontsource-variable/merriweather/wght-italic.css';

// Supports weights 300-800
import "@fontsource-variable/merriweather-sans";
import "@fontsource-variable/merriweather-sans/wght-italic.css";

import "./style.css"
import "./chart.css"

import * as d3 from "d3";

import { hydrateIcons, setIcon } from "./utils/icons";

import EduRatePlayable from "./charts/EduRatePlayable";
import GDPPlayable from "./charts/GDPPlayable";
import GDPScatterPlayable from "./charts/GDPScatterPlayable";
import ChoroplethMap from "./charts/ChoroplethMap";
import LegalEduScatter from "./charts/LegalEduScatter";

hydrateIcons();

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            switch (entry.target.id) {
                case "chart-edu-rate-playable":
                    eduRatePlayable?.play();
                    break;

                case "chart-gdp-playable":
                    gdpPlayable?.play();
                    break;

                case "chart-gdp-scatter-playable":
                    gdpScatterPlayable?.play();
                    break;

                case "chart-choropleth-map-playable":
                    choroplethMapPlayable?.play();
                    break;

                default:
                    break;
            }
        } else {
            switch (entry.target.id) {
                case "chart-edu-rate-playable":
                    eduRatePlayable?.pause();
                    break;

                case "chart-gdp-playable":
                    gdpPlayable?.pause();
                    break

                case "chart-gdp-scatter-playable":
                    gdpScatterPlayable?.pause();
                    break;

                case "chart-choropleth-map-playable":
                    choroplethMapPlayable?.pause();
                    break;

                default:
                    break;
            }
        }
    });
}, {
    threshold: 1,
    root: null,

});

// Education Rate Playable Bar Chart
let eduRatePlayable;
d3.csv("/data/primary-secondary-enrollment-completion-rates.csv")
    .then((data) => {
        data.forEach((row) => {
            row["Primary enrollment"] = Number(row["Primary enrollment"]) / 100;
            row["Secondary enrollment"] = Number(row["Secondary enrollment"]) / 100;
            row["Tertiary enrollment"] = Number(row["Tertiary enrollment"]) / 100;
        });

        eduRatePlayable = new EduRatePlayable({
            parentElement: "#chart-edu-rate-playable>.chart-area",
            dataLabels: data.columns.slice(1),
            // TODO: Automatically calculate this
            sequenceMax: 1.2,
            // TODO: Some of this playback control code is a mess and probably needs to be restructured/rethought
            playback: {
                play,
                pause,
                reset,
            }
        }, data[0]);

        let playback;

        function play() {
            eduRatePlayable.state.isPlaying = true;
            clearInterval(playback);
            if (eduRatePlayable.state.index >= data.length) {
                eduRatePlayable.reset();
            }
            playback = setInterval(() => {
                eduRatePlayable.state.index = (eduRatePlayable.state.index + 1);
                if (eduRatePlayable.state.index >= data.length) {
                    pause();
                    return;
                }
                eduRatePlayable.data = data[eduRatePlayable.state.index];

                document.querySelector("#chart-edu-rate-playable .year.label").textContent = data[eduRatePlayable.state.index]?.["Year"];

                eduRatePlayable.updateVis();
            }, 200);


            playbackButton.title = "Pause";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "pause");
        }

        const playbackButton = document.querySelector("#chart-edu-rate-playable button.playback");
        const replayButton = document.querySelector("#chart-edu-rate-playable button.replay");

        function pause() {
            clearInterval(playback);
            eduRatePlayable.state.isPlaying = false;

            playbackButton.title = "Play";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "play-arrow");

        }

        function reset() {
            // NOTE: I had originally paused and reset here, but I think it probably makes more sense to leave 
            // the playback state alone
            eduRatePlayable.state.index = 0;

            eduRatePlayable.data = data[eduRatePlayable.state.index];
            document.querySelector("#chart-edu-rate-playable .year.label").textContent = data[eduRatePlayable.state.index]?.["Year"];
            eduRatePlayable.updateVis();
        }

        playbackButton.addEventListener("click", () => {
            if (eduRatePlayable.state.isPlaying) {
                eduRatePlayable.pause();
            } else {
                eduRatePlayable.play();
            }
        });

        replayButton.addEventListener("click", () => {
            eduRatePlayable.reset();
        });
    })
    .then(() => {
        observer.observe(document.getElementById("chart-edu-rate-playable"));
    })
    .catch((error) => {
        console.error(error);
    });


// GDP Playable Histogram
let gdpPlayable;
d3.csv("/data/gdp-per-capita-distribution-log.csv")
    .then((data) => {
        const labels = data.columns.slice(1);
        // TODO: I don't know if this is the most efficient/best way to do this
        data.forEach((row) => {
            labels.forEach((label) => {
                row[label] = Number(row[label]);
            });
        });

        gdpPlayable = new GDPPlayable({
            parentElement: "#chart-gdp-playable>.chart-area",
            dataLabels: labels,
            // TODO: Automatically calculate this
            sequenceMax: 100,
            // TODO: Some of this playback control code is a mess and probably needs to be restructured/rethought
            playback: {
                play,
                pause,
                reset,
            }
        }, data[0]);

        let playback;

        function play() {
            gdpPlayable.state.isPlaying = true;
            clearInterval(playback);
            if (gdpPlayable.state.index >= data.length) {
                gdpPlayable.reset();
            }
            playback = setInterval(() => {
                gdpPlayable.state.index = (gdpPlayable.state.index + 1);
                if (gdpPlayable.state.index >= data.length) {
                    pause();
                    return;
                }
                gdpPlayable.data = data[gdpPlayable.state.index];

                document.querySelector("#chart-gdp-playable .year.label").textContent = data[gdpPlayable.state.index]?.["Year"];

                gdpPlayable.updateVis();
            }, 200);


            playbackButton.title = "Pause";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "pause");
        }

        const playbackButton = document.querySelector("#chart-gdp-playable button.playback");
        const replayButton = document.querySelector("#chart-gdp-playable button.replay");

        function pause() {
            clearInterval(playback);
            gdpPlayable.state.isPlaying = false;

            playbackButton.title = "Play";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "play-arrow");

        }

        function reset() {
            // NOTE: I had originally paused and reset here, but I think it probably makes more sense to leave 
            // the playback state alone
            gdpPlayable.state.index = 0;

            gdpPlayable.data = data[gdpPlayable.state.index];
            document.querySelector("#chart-gdp-playable .year.label").textContent = data[gdpPlayable.state.index]?.["Year"];
            gdpPlayable.updateVis();
        }

        playbackButton.addEventListener("click", () => {
            if (gdpPlayable.state.isPlaying) {
                gdpPlayable.pause();
            } else {
                gdpPlayable.play();
            }
        });

        replayButton.addEventListener("click", () => {
            gdpPlayable.reset();
        });
    })
    .then(() => {
        observer.observe(document.getElementById("chart-gdp-playable"));
    })
    .catch((error) => {
        console.error(error);
    });

// GDP Playable Scatter Plot
let gdpScatterPlayable;
let percentFields = ["Primary enrollment", "Secondary enrollment", "Tertiary enrollment"];
const { promise: eduRatesMerged, resolve: resolveEduRatesMerged } = Promise.withResolvers();
d3.csv("/data/edu-rates-merged.csv")
    .then((data) => {
        const labels = data.columns.slice(3);
        const xSwitcher = document.querySelector("#chart-gdp-scatter-playable select.x-switcher");

        // TODO: I don't know if this is the most efficient/best way to do this
        data.forEach((row) => {
            labels.forEach((label) => {
                // Handle missing data
                if (row[label] === "") {
                    row[label] = null;
                    return;
                }
                row[label] = Number(row[label]);
                if (percentFields.includes(label)) {
                    row[label] = row[label] / 100;
                }
            });
        });

        resolveEduRatesMerged(data);

        let groupedData = d3.groups(data, (d) => d["Year"]);
        groupedData.sort((a, b) => a[0] - b[0]);


        gdpScatterPlayable = new GDPScatterPlayable({
            parentElement: "#chart-gdp-scatter-playable>.chart-area",
            xAxis: {
                label: xSwitcher.value,
                sequenceMax: d3.max(data, (d) => d[xSwitcher.value]),
            },
            yAxis: {
                label: "GDP per capita",
                sequenceMax: d3.max(data, (d) => d["GDP per capita"]),
            },
            // TODO: Some of this playback control code is a mess and probably needs to be restructured/rethought
            playback: {
                play,
                pause,
                reset,
            }
        }, groupedData[0][1]);

        let playback;

        function play() {
            gdpScatterPlayable.state.isPlaying = true;
            clearInterval(playback);
            if (gdpScatterPlayable.state.index >= groupedData.length) {
                gdpScatterPlayable.reset();
            }
            playback = setInterval(() => {
                gdpScatterPlayable.state.index = (gdpScatterPlayable.state.index + 1);
                if (gdpScatterPlayable.state.index >= groupedData.length) {
                    pause();
                    return;
                }
                gdpScatterPlayable.data = groupedData[gdpScatterPlayable.state.index][1];

                document.querySelector("#chart-gdp-scatter-playable .year.label").textContent = groupedData[gdpScatterPlayable.state.index][0];

                gdpScatterPlayable.updateVis();
            }, 200);


            playbackButton.title = "Pause";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "pause");
        }

        const playbackButton = document.querySelector("#chart-gdp-scatter-playable button.playback");
        const replayButton = document.querySelector("#chart-gdp-scatter-playable button.replay");

        function pause() {
            clearInterval(playback);
            gdpScatterPlayable.state.isPlaying = false;

            playbackButton.title = "Play";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "play-arrow");

        }

        function reset() {
            // NOTE: I had originally paused and reset here, but I think it probably makes more sense to leave 
            // the playback state alone
            gdpScatterPlayable.state.index = 0;

            gdpScatterPlayable.data = groupedData[gdpScatterPlayable.state.index][1];
            document.querySelector("#chart-gdp-scatter-playable .year.label").textContent = groupedData[gdpScatterPlayable.state.index][0];
            gdpScatterPlayable.updateVis();
        }

        playbackButton.addEventListener("click", () => {
            if (gdpScatterPlayable.state.isPlaying) {
                gdpScatterPlayable.pause();
            } else {
                gdpScatterPlayable.play();
            }
        });

        replayButton.addEventListener("click", () => {
            gdpScatterPlayable.reset();
        });

        xSwitcher.addEventListener("change", (e) => {
            gdpScatterPlayable.config.xAxis.label = e.target.value;
            gdpScatterPlayable.config.xAxis.sequenceMax = d3.max(data, (d) => d[e.target.value]);
            gdpScatterPlayable.updateVis();
        });
    })
    .then(() => {
        observer.observe(document.getElementById("chart-gdp-scatter-playable"));
    })
    .catch((error) => {
        console.error(error);
    });

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

// Choropleth map
let choroplethMapPlayable;
Promise.all([
    d3.json("/geo/world.geojson"),
    eduRatesMerged
])
    .then((data) => {
        const geo = data[0];
        const eduRates = data[1];
        const xSwitcher = document.querySelector("#chart-choropleth-map-playable select.x-switcher");
        const currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

        const groupedData = d3.groups(eduRates, (d) => d["Year"]);
        groupedData.sort((a, b) => a[0] - b[0]);

        const mostRecentData = new Map();

        function loadYear(year, label = choroplethMapPlayable.config.label) {
            const m = new Map(groupedData[year][1].map((d) => [d["Code"], d]));

            geo.features.forEach((country) => {
                const data = m.get(country.id);

                // TODO: This is really hacky, I kind of tacked this on at the last second
                if (data && data[label] !== null) {
                    mostRecentData.set(country.id, {
                        isOld: false,
                        year: groupedData[year][0],
                        ...data,
                    });
                } else if (mostRecentData.has(country.id)) {
                    mostRecentData.set(country.id, {
                        ...mostRecentData.get(country.id),
                        isOld: true,
                    });
                };

                country.properties.data = mostRecentData.get(country.id);
            });

        };

        const label = xSwitcher.value;

        loadYear(0, label);

        choroplethMapPlayable = new ChoroplethMap({
            parentElement: "#chart-choropleth-map-playable>.chart-area",
            label,
            formatter: percentFields.includes(xSwitcher.value) ? percentFormatter : currencyFormatter,
            sequenceMax: d3.max(eduRates, (d) => d[label]),
            // TODO: Some of this playback control code is a mess and probably needs to be restructured/rethought
            playback: {
                play,
                pause,
                reset,
            }
        }, geo);

        let playback;

        function play() {
            choroplethMapPlayable.state.isPlaying = true;
            clearInterval(playback);
            if (choroplethMapPlayable.state.index >= groupedData.length) {
                choroplethMapPlayable.reset();
            }
            playback = setInterval(() => {
                choroplethMapPlayable.state.index++;
                if (choroplethMapPlayable.state.index >= groupedData.length) {
                    pause();
                    return;
                }
                loadYear(choroplethMapPlayable.state.index);

                document.querySelector("#chart-choropleth-map-playable .year.label").textContent = groupedData[choroplethMapPlayable.state.index][0];

                choroplethMapPlayable.updateVis();
            }, 200);


            playbackButton.title = "Pause";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "pause");
        }

        const playbackButton = document.querySelector("#chart-choropleth-map-playable button.playback");
        const replayButton = document.querySelector("#chart-choropleth-map-playable button.replay");

        function pause() {
            clearInterval(playback);
            choroplethMapPlayable.state.isPlaying = false;

            playbackButton.title = "Play";
            setIcon(playbackButton.querySelector("svg[data-icon]"), "play-arrow");

        }

        function reset() {
            // NOTE: I had originally paused and reset here, but I think it probably makes more sense to leave 
            // the playback state alone
            choroplethMapPlayable.state.index = 0;

            loadYear(choroplethMapPlayable.state.index);
            document.querySelector("#chart-choropleth-map-playable .year.label").textContent = groupedData[choroplethMapPlayable.state.index][0];
            choroplethMapPlayable.updateVis();
        }

        playbackButton.addEventListener("click", () => {
            if (choroplethMapPlayable.state.isPlaying) {
                choroplethMapPlayable.pause();
            } else {
                choroplethMapPlayable.play();
            }
        });

        replayButton.addEventListener("click", () => {
            choroplethMapPlayable.reset();
        });

        xSwitcher.addEventListener("change", (e) => {
            choroplethMapPlayable.config.label = e.target.value;
            choroplethMapPlayable.config.formatter = percentFields.includes(e.target.value) ? percentFormatter : currencyFormatter;
            choroplethMapPlayable.config.sequenceMax = d3.max(eduRates, (d) => d[e.target.value]);
            // TODO: It pains me to do it this way, but I really wanted the "rate" in the title and this is by far the easiest way to do it (I'm aware it's bad)
            document.querySelector("#chart-choropleth-map-playable .chart-title").textContent = percentFields.includes(e.target.value) ? `${e.target.value} rate` : e.target.value;
            choroplethMapPlayable.updateVis();
        });


    })
    .then(() => {
        observer.observe(document.getElementById("chart-choropleth-map-playable"));
    })
    .catch((error) => {
        console.error(error)
    });

// LGBT+ Legal Equity Index Scatter plot
let legalEduScatter;
d3.csv("/data/legal-edu-merged.csv")
    .then((data) => {
        const labels = data.columns.slice(3);
        const xSwitcher = document.querySelector("#chart-legal-edu select.x-switcher");

        // TODO: I don't know if this is the most efficient/best way to do this
        data.forEach((row) => {
            labels.forEach((label) => {
                // Handle missing data
                if (row[label] === "") {
                    row[label] = null;
                    return;
                }
                row[label] = Number(row[label]);
                if (percentFields.includes(label)) {
                    row[label] = row[label] / 100;
                }
            });
        });

        legalEduScatter = new LegalEduScatter({
            parentElement: "#chart-legal-edu>.chart-area",
            xAxis: {
                label: xSwitcher.value,
            },
            yAxis: {
                label: "Legal equality index",
                sequenceMax: 100,
            }
        }, data);

        xSwitcher.addEventListener("change", (e) => {
            legalEduScatter.config.xAxis.label = e.target.value;
            legalEduScatter.updateVis();
        });
    })
    .catch((error) => {
        console.error(error);
    });

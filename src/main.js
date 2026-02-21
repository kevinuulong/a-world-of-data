// Supports weights 300-900
import "@fontsource-variable/merriweather/standard.css";
import '@fontsource-variable/merriweather/wght-italic.css';

// Supports weights 300-800
import "@fontsource-variable/merriweather-sans";
import "@fontsource-variable/merriweather-sans/wght-italic.css";

import "./style.css"
import "./chart.css"

import { hydrateIcons, setIcon } from "./utils/icons";
import * as d3 from "d3";
import EduRatePlayable from "./charts/EduRatePlayable";
import GDPPlayable from "./charts/GDPPlayable";

hydrateIcons();

// TODO: If the element is already fully visible on page load eduRatePlayable 
// is still undefined. I fixed this for now by just not worrying about it and
// making it fail silently, but this may be worth coming back to if I have time.
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            switch (entry.target.id) {
                case "chart-edu-rate-playable":
                    eduRatePlayable?.play();
                    break;
                
                case "chart-gdp-playable":
                    gdpPlayable?.play();
                    break

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

                default:
                    break;
            }
        }
    });
}, {
    threshold: 1,
    root: null,

});

observer.observe(document.getElementById("chart-edu-rate-playable"));
observer.observe(document.getElementById("chart-gdp-playable"));


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

        eduRatePlayable.updateVis();

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
    .catch((error) => {
        console.error(error);
    });


// GDP Playable Histogram
let gdpPlayable;
d3.csv("/data/gdp-distribution-log.csv")
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

        gdpPlayable.updateVis();

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
    .catch((error) => {
        console.error(error);
    });

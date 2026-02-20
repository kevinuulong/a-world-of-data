// Supports weights 300-900
import "@fontsource-variable/merriweather/standard.css";

// Supports weights 300-800
import "@fontsource-variable/merriweather-sans/wght-italic.css";
import "@fontsource-variable/merriweather-sans";

import "./style.css"
import "./chart.css"

import { hydrateIcons } from "./icons";
import * as d3 from "d3";
import EduRatePlayable from "./charts/EduRatePlayable";

hydrateIcons();

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

// Education Rate Playable Bar Chart
let eduRatePlayable;
d3.csv("/data/primary-secondary-enrollment-completion-rates.csv")
    .then((data) => {
        data.forEach((row) => {
            row["Primary enrollment"] = Number(row["Primary enrollment"]) / 100;
            row["Secondary enrollment"] = Number(row["Secondary enrollment"]) / 100;
            row["Tertiary enrollment"] = Number(row["Tertiary enrollment"]) / 100;
        });

        // let flattenedData = Object.values(data[0]);
        // let year = flattenedData.splice(0, 1);

        eduRatePlayable = new EduRatePlayable({
            parentElement: "#chart-edu-rate-playable>.chart-area",
            dataLabels: data.columns.slice(1),
        }, data[0]);

        eduRatePlayable.updateVis();
    })
    .catch((error) => {
        console.error(error);
    });
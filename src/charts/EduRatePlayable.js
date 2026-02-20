import * as d3 from "d3";

export default class EduRatePlayable {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        // Configuration object with defaults
        this.config = {
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            width: _config.containerWidth || 520,
            height: _config.containerHeight || 320,
            dataLabels: _config.dataLabels,
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        this.yScale = d3.scaleOrdinal()
            .range([this.config.height, 0]);

        this.xScale = d3.scaleBand()
            .range([0, this.config.width])
            .padding(0.2);

        this.svg = d3.select(this.config.parentElement)
            .attr("width", this.config.width)
            .attr("height", this.config.height);

        this.chart = this.svg.append("g");
        this.xAxisGroup = this.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${this.config.height})`);

    };

    updateVis() {
        this.xScale.domain(this.config.dataLabels);
        this.yScale.domain([0, d3.max(this.data)]);

        this.renderVis();
    };

    renderVis() {
        const bars = this.chart.selectAll(".bar")
            .data(this.data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => {
                console.log(d, this.xScale("Primary enrollment"));
                return this.xScale(d)
            })
            .attr("width", this.xScale.bandwidth())
            .attr("height", 100)
    };
}
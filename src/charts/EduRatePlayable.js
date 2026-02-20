import * as d3 from "d3";

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

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
            containerWidth: _config.containerWidth || 520,
            containerHeight: _config.containerHeight || 320,
            margin: _config.margin || { top: 36, right: 0, bottom: 38, left: 0 },
            dataLabels: _config.dataLabels,
            barColor: _config.barColor || "var(--bar-color)",
            sequenceMax: _config.sequenceMax,
            playback: _config.playback,
        }
        this.data = _data;
        this.state = {
            index: 0,
            isPlaying: false,
        };
        this.initVis();
    }

    initVis() {
        this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
        this.height = this.config.containerHeight - this.config.margin.bottom;

        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.2);

        this.xAxis = d3.axisBottom(this.xScale)
            .ticks(this.config.dataLabels)
            .tickSize(0)
            .tickPadding(20);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickSize(-this.width)
            .tickFormat("")

        this.svg = d3.select(this.config.parentElement)
            .attr("width", this.config.containerWidth)
            .attr("height", this.config.containerHeight);

        this.chart = this.svg.append("g")
            .attr("transform", `translate(${this.config.margin.left}, 0)`);

        this.xAxisGroup = this.chart.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${this.height})`);

        this.yAxisGroup = this.chart.append("g")
            .attr("class", "axis y-axis");

        // TODO: I don't like this for a couple of reasons, but mostly that it is outside the main chart group
        // this.svg.append("line")
        //     .attr("x1", 0)
        //     .attr("y1", 1)
        //     .attr("x2", this.width)
        //     .attr("y2", 1)
        //     .attr("class", "ascender")

    };

    updateVis() {
        // NOTE: Cannot use Object.entries here because it does not guarantee the correct order is maintained
        this.parsedData = this.config.dataLabels.map((label) => [label, this.data[label]]);

        this.xScale.domain(this.config.dataLabels);

        // NOTE: This is not perfect, i.e. when passed 0 it would default to d3.max, but I don't 
        // really know why you would do that (I certainly never plan to) so I'm going to call it good
        // enough for now.
        let max = this.config.sequenceMax || d3.max(this.parsedData, (d) => d[1])
        this.yScale.domain([0, max]);

        // TODO: This is also kind of hacky, I originally used the margin, but ran into issues
        // drawing the top line. Although it's not perfect, I like this better than my previous
        // solution of just force drawing an extra random line.
        let ticks = this.yScale.ticks(5);
        if (!ticks.includes(this.config.sequenceMax)) {
            ticks.push(this.config.sequenceMax);
        }

        this.yAxis.tickValues(ticks);

        this.renderVis();
    };

    renderVis() {
        const bars = this.chart.selectAll(".bar")
            .data(this.parsedData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => this.xScale(d[0]))
            .attr("width", this.xScale.bandwidth())
            .attr("y", (d) => this.yScale(d[1]))
            .attr("height", (d) => this.height - this.yScale(d[1]))
            .attr("fill", this.config.barColor)
            .attr("rx", 4);

        const labels = this.chart.selectAll(".label")
            .data(this.parsedData)
            .join("text")
            .attr("class", "label")
            .text((d) => percentFormatter.format(d[1]))
            .attr("x", (d) => this.xScale(d[0]) + (this.xScale.bandwidth() / 2))
            .attr("text-anchor", "middle")
            .attr("y", (d) => this.yScale(d[1]) - 8)

        this.yAxisGroup.call(this.yAxis)
            .select(".domain")
            .remove();

        this.xAxisGroup.call(this.xAxis);
    };

    play() {
        this.config.playback?.play();
    };

    pause() {
        this.config.playback?.pause();
    };

    reset() {
        this.config.playback?.reset();
    };

}
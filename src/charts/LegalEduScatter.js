import * as d3 from "d3";

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

export default class LegalEduScatter {

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
            margin: { top: 4, right: 4, bottom: 38, left: 52, ..._config.margin },
            pointColor: _config.pointColor || "var(--bar-color)",
            xAxis: {
                sequenceMax: _config.xAxis?.sequenceMax,
                label: _config.xAxis?.label,
            },
            yAxis: {
                sequenceMax: _config.yAxis?.sequenceMax,
                label: _config.yAxis?.label,
            },
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
        this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

        this.xScale = d3.scaleLinear()
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);


        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat((d) =>
                this.xScale.tickFormat()(d) !== "" ? percentFormatter.format(d) : ""
            )
            .tickSize(-this.height)
            .tickPadding(20)

        this.yAxis = d3.axisLeft(this.yScale)
            .tickSize(0)
            .tickPadding(10);

        this.svg = d3.select(this.config.parentElement)
            .attr("width", this.config.containerWidth)
            .attr("height", this.config.containerHeight);

        this.chart = this.svg.append("g")
            .attr("transform", `translate(${this.config.margin.left}, ${this.config.margin.top})`);

        this.xAxisGroup = this.chart.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${this.height})`);

        this.yAxisGroup = this.chart.append("g")
            .attr("class", "axis y-axis");

        this.updateVis();
    };

    updateVis() {
        this.filteredData = this.data.filter((d) => d[this.config.xAxis?.label] !== null && d[this.config.yAxis?.label] !== null);
        // NOTE: This is not perfect, i.e. when passed 0 it would default to d3.max, but I don't 
        // really know why you would do that (I certainly never plan to) so I'm going to call it good
        // enough for now.
        let xMax = this.config.xAxis?.sequenceMax || d3.max(this.filteredData, (d) => d[this.config.xAxis?.label]);
        // console.log("x-max", xMax);
        this.xScale.domain([0, xMax]);

        // NOTE: This is not perfect, i.e. when passed 0 it would default to d3.max, but I don't 
        // really know why you would do that (I certainly never plan to) so I'm going to call it good
        // enough for now.
        let yMax = this.config.yAxis?.sequenceMax || d3.max(this.filteredData, (d) => d[this.config.yAxis?.label]);
        this.yScale.domain([0, yMax]);

        // TODO: This is also kind of hacky, I originally used the margin, but ran into issues
        // drawing the top line. Although it's not perfect, I like this better than my previous
        // solution of just force drawing an extra random line.
        let ticks = this.yScale.ticks();

        this.yAxis.tickValues(ticks);

        this.renderVis();
    };

    renderVis() {
        const points = this.chart.selectAll(".point")
            .data(this.filteredData, (d) => d["Code"])
            .join(
                (enter) => enter.append("circle")
                    .attr("class", "point")
                    .attr("r", 4)
                    .attr("cx", (d) => this.xScale(d[this.config.xAxis?.label]))
                    .attr("cy", (d) => this.yScale(d[this.config.yAxis?.label]))
                    .attr("fill", this.config.pointColor),
                (update) => update.transition().duration(200)
                    .attr("cx", (d) => this.xScale(d[this.config.xAxis?.label]))
                    .attr("cy", (d) => this.yScale(d[this.config.yAxis?.label])),
                (exit) => exit.remove()
            );

        points.on("mouseover", (e, d) => {
            d3.select("#tooltip")
                .style("display", "flex")
                .style("left", `${e.pageX + 8}px`)
                .style("top", `${e.pageY + 8}px`)
                .html(`
                    <div class="tooltip-labels">
                        <div class="tooltip-primary">
                            ${percentFormatter.format(d[this.config.xAxis?.label])}
                        </div>
                        <div class="tooltip-title">${d["Entity"]}</div>
                    </div>
                    <div class="tooltip-secondary">
                        ${Math.round(d[this.config.yAxis?.label])} ${this.config.yAxis?.label}
                    </div>
                `);
        })
            .on("mouseleave", (e, d) => {
                d3.select("#tooltip")
                    .style("display", "none");
            });

        this.yAxisGroup.call(this.yAxis);

        this.xAxisGroup.call(this.xAxis)
            .select(".domain")
            .remove();
    };

}
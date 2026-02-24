import * as d3 from "d3";

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

export default class ChoroplethMap {

    /**
     * Class constructor with basic configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 520,
            containerHeight: _config.containerHeight || 320,
            margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
            tooltipPadding: 10,
            legendBottom: 50,
            legendLeft: 50,
            legendRectHeight: 12,
            legendRectWidth: 150,
            sequenceMax: _config.sequenceMax,
            label: _config.label,
            playback: _config.playback,
        };
        this.state = {
            index: 0,
            isPlaying: false,
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
        this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

        this.svg = d3.select(this.config.parentElement)
            .attr("width", this.config.containerWidth)
            .attr("height", this.config.containerHeight);

        this.chart = this.svg.append("g")
            .attr("transform", `translate(${this.config.margin.left}, ${this.config.margin.top})`);

        this.projection = d3.geoNaturalEarth1();
        this.geoPath = d3.geoPath(this.projection);

        this.colorScale = d3.scaleLinear()
            .range(["#FFEAF8", "#A3006D"])
            .interpolate(d3.interpolateHcl);

        this.updateVis();
    };

    updateVis() {
        console.log(this.data.features[0])
        const extent = this.config.sequenceMax ? [0, this.config.sequenceMax] : d3.extent(this.data.features, (d) => d.properties.data?.[this.config.label]);

        this.colorScale.domain(extent);

        this.renderVis();
    };

    renderVis() {
        this.projection.fitSize([this.width, this.height], this.data);

        const countryPath = this.chart.selectAll(".country")
            .data(this.data.features, (d) => d.id)
            .join(
                (enter) => enter.append("path")
                    .attr("class", "country")
                    .attr("d", this.geoPath)
                    .attr("fill", (d) => {
                        if (d.properties.data?.[this.config.label]) {
                            return this.colorScale(d.properties.data[this.config.label]);
                        } else {
                            return "#e8e8e8";
                        }
                    })
                    .attr("stroke", "white"),
                (update) => update.transition().duration(200)
                    .attr("fill", (d) => {
                        if (d.properties.data?.[this.config.label]) {
                            return this.colorScale(d.properties.data[this.config.label]);
                        } else {
                            return "#e8e8e8";
                        }
                    })
            );

        countryPath.on("mousemove", (e, d) => {
            d3.select("#tooltip")
                .style("display", "flex")
                .style("left", `${e.pageX + 8}px`)
                .style("top", `${e.pageY + 8}px`)
                .html(`
                        <div class="tooltip-labels">
                            <div class="tooltip-primary">
                                ${d.properties.data?.[this.config.label] != undefined ? percentFormatter.format(d.properties.data?.[this.config.label]) : "No data available"}
                            </div>
                            <div class="tooltip-title">${d.properties.data?.["Entity"] || d.properties.name}</div>
                        </div>
                    `);
        })
            .on("mouseleave", (e, d) => {
                d3.select("#tooltip")
                    .style("display", "none");
            });
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
};
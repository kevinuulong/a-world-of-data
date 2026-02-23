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
        
        this.projection = d3.geoMercator();
        this.geoPath = d3.geoPath(this.projection);

        this.colorScale = d3.scaleLinear()
            .range(["var(--min-color)", "var(--max-color)"])
            .interpolate(d3.interpolateHcl);
        
        this.updateVis();
    };

    updateVis() {

    };
};
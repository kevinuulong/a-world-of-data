import PauseIcon from "./assets/icons/pause.svg?raw";
import PlayArrowIcon from "./assets/icons/play_arrow.svg?raw";
import ReplayIcon from "./assets/icons/replay.svg?raw";

const iconMap = {
    "pause": PauseIcon,
    "play-arrow": PlayArrowIcon,
    "replay": ReplayIcon
};

const parser = new DOMParser();

/**
 * Hydrates all icons on the current page.
 */
export function hydrateIcons() {
    const elements = document.querySelectorAll("svg.icon[data-type]");

    elements.forEach((svg) => {
        const icon = svg.dataset.type;
        setIcon(svg, icon);
    });
}

/**
 * Hydrates an individual icon.
 * @param {SVGElement} svg The SVG to update/replace.
 * @param {string} icon A valid icon name.
 */
export function setIcon(svg, icon) {
    if (icon && iconMap[icon]) {
        const newSVG = (parser.parseFromString(iconMap[icon], "image/svg+xml")).querySelector("svg");
        newSVG.setAttribute("class", svg.getAttribute("class"));
        newSVG.classList.add("icon");
        newSVG.dataset.type = icon;
        svg.replaceWith(newSVG);
    }
}
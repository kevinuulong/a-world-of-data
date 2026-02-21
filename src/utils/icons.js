import ArrowRightIcon from "../assets/icons/arrow_right.svg?raw";
import PauseIcon from "../assets/icons/pause.svg?raw";
import PlayArrowIcon from "../assets/icons/play_arrow.svg?raw";
import ReplayIcon from "../assets/icons/replay.svg?raw";

const iconMap = {
    "arrow-right": ArrowRightIcon,
    "pause": PauseIcon,
    "play-arrow": PlayArrowIcon,
    "replay": ReplayIcon
};

const parser = new DOMParser();

/**
 * Hydrates all icons on the current page.
 */
export function hydrateIcons() {
    const elements = document.querySelectorAll("svg[data-icon]");

    elements.forEach((svg) => {
        const icon = svg.dataset.icon;
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
        let classes = svg.getAttribute("class");
        if (classes) {
            newSVG.setAttribute("class", classes);
        }
        newSVG.dataset.icon = icon;
        svg.replaceWith(newSVG);
    }
}
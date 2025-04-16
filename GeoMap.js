const mapWidth = 600; 
const mapHeight = 400; 

// Append SVG for the map
const mapSvg = d3.select("#geoMap")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .call(d3.zoom()
        .scaleExtent([1, 10]) // Restrict zoom levels
        .translateExtent([[0, 0], [mapWidth, mapHeight]]) // Restrict panning to map boundaries
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform); 
        })
        .interpolate(d3.interpolateLinear) 
    );

// Append a group for map content
const mapGroup = mapSvg.append("g");

// Tooltip for interactivity
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


const projection = d3.geoMercator()
    .center([128, 36]) 
    .scale(4000) 
    .translate([mapWidth / 2, mapHeight / 2]);


const path = d3.geoPath().projection(projection);

const provinceColorScale = d3.scaleOrdinal(d3.schemeSet3); 
const clusterColorScale = d3.scaleOrdinal()
    .domain(["True"])
    .range(["red"]); 


Promise.all([
    d3.json("data/gadm41_KOR_1.json"), 
    d3.csv("data/cleaned_covid_map_data.csv") 
]).then(([geoData, covidData]) => {

    mapGroup.append("g")
        .selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d, i) => provinceColorScale(i)) 
        .attr("stroke", "#555")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .html(`<strong>Province:</strong> ${d.properties.NAME_1}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });


    const points = covidData.map(d => ({
        latitude: +d.latitude,
        longitude: +d.longitude,
        name: d.infection_case,
        region: d.province,
        cluster: d.group === "True",
        cases: +d.confirmed_case || 1,
    }));

    const pins = mapGroup.append("g")
        .selectAll("circle")
        .data(points)
        .join("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", d => Math.sqrt(d.cases) * 0.5) // Adjust radius by cases
        .attr("fill", d => clusterColorScale(d.cluster))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("data-region", d => d.region.toLowerCase()) // Add region metadata
        .attr("data-cluster", d => d.cluster) // Add cluster metadata
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>Case:</strong> ${d.name}<br>
                    <strong>Region:</strong> ${d.region}<br>
                    <strong>Cases:</strong> ${d.cases}<br>
                    <strong>Cluster:</strong> ${d.cluster ? "Yes" : "No"}
                `)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    const legend = mapSvg.append("g")
        .attr("transform", `translate(${mapWidth - 120}, 20)`);

    legend.append("text")
        .text("Legend:")
        .attr("font-weight", "bold");

    legend.selectAll("rect")
        .data(["True"])
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => 20 + i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => clusterColorScale(d));

    legend.selectAll("text.legend-label")
        .data(["Cluster"])
        .join("text")
        .attr("x", 20)
        .attr("y", (d, i) => 32 + i * 20)
        .text(d => d);

    const regionFilterInput = document.getElementById("regionFilter");
    const clusterFilterCheckbox = document.getElementById("clusterFilter");

    regionFilterInput.addEventListener("input", () => {
        const filterValue = regionFilterInput.value.toLowerCase();
        pins.attr("visibility", d =>
            d.region.toLowerCase().includes(filterValue) ? "visible" : "hidden"
        );
    });

    clusterFilterCheckbox.addEventListener("change", () => {
        const showClusters = clusterFilterCheckbox.checked;
        pins.attr("visibility", d =>
            (d.cluster && showClusters) || (!d.cluster && !showClusters) ? "visible" : "hidden"
        );
    });
});

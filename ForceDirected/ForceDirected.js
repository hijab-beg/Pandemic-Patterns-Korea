const width = document.getElementById("container").clientWidth;
const height = document.getElementById("container").clientHeight;

const container = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
        svgGroup.attr("transform", event.transform);
    }))
    .append("g");

const svgGroup = container.append("g");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

d3.csv("data/cleaned_covid_map_data.csv").then(data => {
    const nodesSet = new Set();
    const links = [];

    data.forEach(row => {
        const province = row["province"];
        const city = row["city"];
        const infectionCase = row["infection_case"];

        nodesSet.add(province);
        nodesSet.add(city);
        nodesSet.add(infectionCase);

        links.push({ source: province, target: city, type: "Province-City" });

            links.push({ source: city, target: infectionCase, type: "City-Infection" });
        });

    const nodes = Array.from(nodesSet).map(id => ({ id }));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svgGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2)
        .attr("stroke", d => {
            if (d.type === "Province-City") return "blue";
            if (d.type === "City-Infection") return "orange";
            return "green";
        })
        .attr("data-type", d => d.type);

    const node = svgGroup.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", d => color(d.id))
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.id}</strong>`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            alert(`Node clicked: ${d.id}`);
        })
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart(); 
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    document.getElementById("provinceCity").addEventListener("change", (event) => {
        filterLinks(event.target.checked, "Province-City");
    });
    document.getElementById("cityInfection").addEventListener("change", (event) => {
        filterLinks(event.target.checked, "City-Infection");
    });

    function filterLinks(visible, type) {
        svgGroup.selectAll("line")
            .filter(d => d.type === type)
            .attr("visibility", visible ? "visible" : "hidden");
    }
});

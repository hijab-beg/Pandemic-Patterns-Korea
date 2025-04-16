// Set up dimensions for the Sunburst Chart
const container = document.getElementById("chart-container");
const width = container.clientWidth;
const height = container.clientHeight;
const radius = Math.min(width, height) / 6; 

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

d3.csv("data/cleaned_covid_map_data.csv").then(data => {
    const hierarchyData = d3.group(
        data,
        d => d.province,  // Top level: Province
        d => d.city,      // Second level: City
        d => d.sex        // Third level: Gender
    );

    function buildHierarchy(group) {
        return Array.from(group, ([key, value]) => {
            if (value instanceof Map) {
                return { name: key, children: buildHierarchy(value) };
            } else {
                return {
                    name: key,
                    value: d3.sum(value, d => +d.gender_confirmed || 0)
                };
            }
        });
    }

    const rootData = { name: "Root", children: buildHierarchy(hierarchyData) };

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, rootData.children.length + 1));

    const hierarchy = d3.hierarchy(rootData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each(d => (d.current = d));

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .attr("fill-opacity", d => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
        .attr("pointer-events", d => (arcVisible(d.current) ? "auto" : "none"))
        .attr("d", d => arc(d.current));

    path.append("title").text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);

    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

        function clicked(event, p) {
            parent.datum(p.parent || root);
        
            root.each(d => (d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            }));
        
            const t = svg.transition().duration(750);
        
            svg.selectAll("path").remove();
            svg.selectAll("text").remove();
        
            const path = svg.append("g")
                .selectAll("path")
                .data(root.descendants().slice(1))
                .join("path")
                .attr("fill", d => {
                    while (d.depth > 1) d = d.parent;
                    return color(d.data.name);
                })
                .attr("fill-opacity", d => (arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0))
                .attr("pointer-events", d => (arcVisible(d.target) ? "auto" : "none"))
                .attr("d", d => arc(d.target));
        
            path.append("title").text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);
        
            path.filter(d => d.children)
                .style("cursor", "pointer")
                .on("click", clicked);
        
            const label = svg.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .style("user-select", "none")
                .selectAll("text")
                .data(root.descendants().slice(1))
                .join("text")
                .attr("dy", "0.35em")
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attr("transform", d => labelTransform(d.target))
                .text(d => d.data.name);
        
            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => (d.current = i(t));
                })
                .filter(d => arcVisible(d.target))
                .attrTween("d", d => () => arc(d.current));
        
            label.transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }
        

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        const chartArea = width * height; // Calculate the chart area
        const segmentArea = (d.x1 - d.x0) * (d.y1 - d.y0) * Math.PI * Math.pow(radius, 2); // Calculate segment area
        return d.y1 <= 3 && d.y0 >= 1 && segmentArea / chartArea > 0.01; // Adjust threshold dynamically
    }
    

    function labelTransform(d) {
        const x = ((d.x0 + d.x1) / 2) * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
});

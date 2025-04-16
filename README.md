# Interactive Data Visualization Dashboard Report

## Introduction
This report outlines the insights derived from an interactive data visualization dashboard created using D3.js. The dashboard uses a cleaned dataset from a COVID-19 analysis in South Korea, focusing on the relationships between geographic locations, infection types, and timestamps. This document provides an explanation of the visualizations included, their purpose, and the key findings.

## Visualization Descriptions

### 1. Force-Directed Graph
Maps relationships between provinces, cities, and infection types.  
**Key Features:**
- Interactive zoom and drag capabilities
- Tooltips on hover for detailed entity information
- Click actions for node exploration
- Checkbox filters to toggle relationship types

### 2. Geographic Map
Visualizes spatial distribution of COVID-19 cases using colored markers.  
**Key Features:**
- Zoom and pan navigation
- Tooltips with city-specific information
- Region and cluster filters
- Marker click actions for deeper exploration

### 3. Timeline Visualization
Animated time-series view of confirmed cases over time.  
**Key Features:**
- Dynamic line chart by province
- Tooltip with confirmed, released, and deceased data
- Interactive legend for filtering
- Slider and animation controls
- Adaptive y-axis (logarithmic/linear)

### 4. Sunburst Chart
Displays hierarchical structure of province > city > gender case data.  
**Key Features:**
- Zoom on click with transition animations
- Breadcrumb navigation
- Tooltips revealing hierarchical path and value

### 5. Tree Map
Represents hierarchical data (Province > City > Infection Case).  
**Key Features:**
- Interactive zoom, pan, and reset
- Tooltips with case count and percentage
- Color legend scaling dynamically

## Columns Used
- `Date`
- `Province`
- `City`
- `infection_case`
- `province_confirmed`
- `province_released`
- `province_deceased`

## Insights Derived

### 1. Geographic Clusters and Case Distribution
Seoul and Daegu stand out as major case hubs. Targeted public health responses can focus on these hotspots for maximum impact.

### 2. Temporal Trends in Case Growth
Spikes in the timeline align with public events or holidays, suggesting the need for preventive measures during such times.

### 3. Gender Dynamics
Gender-specific trends emerge in different provinces, highlighting the need for tailored awareness and support initiatives.

### 4. Relationship Mapping Between Regions and Infection Types
Clustered infections dominate urban centers, while imported cases are spread across transit-heavy areas, calling for different containment strategies.

### 5. Hierarchical Contribution of Regions
A few provinces contribute to the majority of the case count. The Tree Map emphasizes focusing healthcare resources on these key regions.

---
**Dataset:** `cleaned_covid_map_data.csv`  
**Technologies Used:** D3.js, HTML, CSS, JavaScript

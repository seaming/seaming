let labels = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[155, 15],[180,9],[-140, -8],[-105,-25]] },
            "properties": { "label": "Pacific Ocean" }},
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[-46,24],[-25,0],[-7,-30]] },
            "properties": { "label": "Atlantic Ocean" }},
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[56,-4],[98,-15]] },
            "properties": { "label": "Indian Ocean" }}
    ]
};
let labels = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[-138, 5.5],[-130.8, 3.5],[-120.8, 1],[-115.6, 0]] },
            "properties": { "label": "Cities of the Demon Lords" }},
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[-121, 26.25],[-102,7],[-85,-22]] },
            "properties": { "label": "Haganna Peskudaz" }},
        { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[-170, 25],[-154.5, 2.5],[-135,-16]] },
            "properties": { "label": "The Opal Ocean" }}
    ]
};
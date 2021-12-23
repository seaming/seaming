function stellar_class_round(n) {
    // Round to an integer or a half integer
    var x = Math.floor(n);
    if (n-x < 0.25) return x;
    if (n-x < 0.75) return x + 0.5;
    else return x+1;
}

function stellar_classification(T,L) {
    // Temperature classification bands are those given by
    //   http://hyperphysics.phy-astr.gsu.edu/hbase/Starlog/staspe.html

    var x = {classification: ''};

    if (T < 3500)
        x.classification += 'M' + stellar_class_round(lerp(0, 9, 3500, 0, T));
    else if (T < 5000)
        x.classification += 'K' + stellar_class_round(lerp(3500, 9, 5000, 0, T));
    else if (T < 6000)
        x.classification += 'G' + stellar_class_round(lerp(5000, 9, 6000, 0, T));
    else if (T < 7500)
        x.classification += 'F' + stellar_class_round(lerp(6000, 9, 7500, 0, T));
    else if (T < 10000)
        x.classification += 'A' + stellar_class_round(lerp(7500, 9, 10000, 0, T));
    else if (T < 30000)
        x.classification += 'B' + stellar_class_round(lerp(10000, 9, 30000, 0, T));
    else if (T < 60000)
        x.classification += 'O' + stellar_class_round(lerp(30000, 9, 60000, 0, T));

    x.color = blackbody_color(T);
    return x;
}

// Blackbody colors are those given by http://www.vendian.org/mncharity/dir3/blackbody/
const BLACKBODY_COLOR_DATA = [
    [1000, '#ff3800'],
    [1200, '#ff5300'],
    [1400, '#ff6500'],
    [1600, '#ff7300'],
    [1800, '#ff7e00'],
    [2000, '#ff8912'],
    [2200, '#ff932c'],
    [2400, '#ff9d3f'],
    [2600, '#ffa54f'],
    [2800, '#ffad5e'],
    [3000, '#ffb46b'],
    [3200, '#ffbb78'],
    [3400, '#ffc184'],
    [3600, '#ffc78f'],
    [3800, '#ffcc99'],
    [4000, '#ffd1a3'],
    [4200, '#ffd5ad'],
    [4400, '#ffd9b6'],
    [4600, '#ffddbe'],
    [4800, '#ffe1c6'],
    [5000, '#ffe4ce'],
    [5200, '#ffe8d5'],
    [5400, '#ffebdc'],
    [5600, '#ffeee3'],
    [5800, '#fff0e9'],
    [6000, '#fff3ef'],
    [6200, '#fff5f5'],
    [6400, '#fff8fb'],
    [6600, '#fef9ff'],
    [6800, '#f9f6ff'],
    [7000, '#f5f3ff'],
    [7200, '#f0f1ff'],
    [7400, '#edefff'],
    [7600, '#e9edff'],
    [7800, '#e6ebff'],
    [8000, '#e3e9ff'],
    [8200, '#e0e7ff'],
    [8400, '#dde6ff'],
    [8600, '#dae4ff'],
    [8800, '#d8e3ff'],
    [9000, '#d6e1ff'],
    [9200, '#d3e0ff'],
    [9400, '#d1dfff'],
    [9600, '#cfddff'],
    [9800, '#cedcff'],
    [10000, '#ccdbff'],
    [10200, '#cadaff'],
    [10400, '#c9d9ff'],
    [10600, '#c7d8ff'],
    [10800, '#c6d8ff'],
    [11000, '#c4d7ff'],
    [11200, '#c3d6ff'],
    [11400, '#c2d5ff'],
    [11600, '#c1d4ff'],
    [11800, '#c0d4ff'],
    [12000, '#bfd3ff'],
    [12200, '#bed2ff'],
    [12400, '#bdd2ff'],
    [12600, '#bcd1ff'],
    [12800, '#bbd1ff'],
    [13000, '#bad0ff'],
    [13200, '#b9d0ff'],
    [13400, '#b8cfff'],
    [13600, '#b7cfff'],
    [13800, '#b7ceff'],
    [14000, '#b6ceff'],
    [14200, '#b5cdff'],
    [14400, '#b5cdff'],
    [14600, '#b4ccff'],
    [14800, '#b3ccff'],
    [15000, '#b3ccff'],
    [15200, '#b2cbff'],
    [15400, '#b2cbff'],
    [15600, '#b1caff'],
    [15800, '#b1caff'],
    [16000, '#b0caff'],
    [16200, '#afc9ff'],
    [16400, '#afc9ff'],
    [16600, '#afc9ff'],
    [16800, '#aec9ff'],
    [17000, '#aec8ff'],
    [17200, '#adc8ff'],
    [17400, '#adc8ff'],
    [17600, '#acc7ff'],
    [17800, '#acc7ff'],
    [18000, '#acc7ff'],
    [18200, '#abc7ff'],
    [18400, '#abc6ff'],
    [18600, '#aac6ff'],
    [18800, '#aac6ff'],
    [19000, '#aac6ff'],
    [19200, '#a9c6ff'],
    [19400, '#a9c5ff'],
    [19600, '#a9c5ff'],
    [19800, '#a9c5ff'],
    [20000, '#a8c5ff'],
    [20200, '#a8c5ff'],
    [20400, '#a8c4ff'],
    [20600, '#a7c4ff'],
    [20800, '#a7c4ff'],
    [21000, '#a7c4ff'],
    [21200, '#a7c4ff'],
    [21400, '#a6c3ff'],
    [21600, '#a6c3ff'],
    [21800, '#a6c3ff'],
    [22000, '#a6c3ff'],
    [22200, '#a5c3ff'],
    [22400, '#a5c3ff'],
    [22600, '#a5c3ff'],
    [22800, '#a5c2ff'],
    [23000, '#a4c2ff'],
    [23200, '#a4c2ff'],
    [23400, '#a4c2ff'],
    [23600, '#a4c2ff'],
    [23800, '#a4c2ff'],
    [24000, '#a3c2ff'],
    [24200, '#a3c1ff'],
    [24400, '#a3c1ff'],
    [24600, '#a3c1ff'],
    [24800, '#a3c1ff'],
    [25000, '#a3c1ff'],
    [25200, '#a2c1ff'],
    [25400, '#a2c1ff'],
    [25600, '#a2c1ff'],
    [25800, '#a2c1ff'],
    [26000, '#a2c0ff'],
    [26200, '#a2c0ff'],
    [26400, '#a1c0ff'],
    [26600, '#a1c0ff'],
    [26800, '#a1c0ff'],
    [27000, '#a1c0ff'],
    [27200, '#a1c0ff'],
    [27400, '#a1c0ff'],
    [27600, '#a1c0ff'],
    [27800, '#a0c0ff'],
    [28000, '#a0bfff'],
    [28200, '#a0bfff'],
    [28400, '#a0bfff'],
    [28600, '#a0bfff'],
    [28800, '#a0bfff'],
    [29000, '#a0bfff'],
    [29200, '#a0bfff'],
    [29400, '#9fbfff'],
    [29600, '#9fbfff'],
    [29800, '#9fbfff'],
]

function blackbody_color(T) {
    var i = BLACKBODY_COLOR_DATA.findIndex(x => x[0] > T);
    if (i == 0)
        return BLACKBODY_COLOR_DATA[0][1];
    else if (i == -1)
        return BLACKBODY_COLOR_DATA.at(-1)[1];

    var [T1,c1] = BLACKBODY_COLOR_DATA[i-1];
    var [T2,c2] = BLACKBODY_COLOR_DATA[i];
    return blend_colors(c1, c2, (T-T1)/(T2-T1));
}

function hex_to_RGB(hex) {
    var [r,g,b] = hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    return { r:r, g:g, b:b };
}

function RGB_to_hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function blend_colors(a, b, blend) {
    var a = hex_to_RGB(a);
    var b = hex_to_RGB(b);
    return RGB_to_hex(
        Math.round(a.r * blend + (1 - blend) * b.r),
        Math.round(a.g * blend + (1 - blend) * b.g),
        Math.round(a.b * blend + (1 - blend) * b.b),
    );
}
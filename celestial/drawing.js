var HR_diagram;
var spectra_graph;
var spectra_loading_symbol;

const PLANCK_CONSTANT = 6.62607015e-34;
const BOLTZMANN_CONSTANT = 1.380649e-23;
const WIENS_DISPLACEMENT_CONSTANT = 2.897771955e-3;

function set_diagram() {
    var HR_object = document.querySelector('#HR-diagram');
    HR_diagram = HR_object.contentDocument.querySelector('svg');

    var spectra_object = document.querySelector('#spectra-graph');
    spectra_graph = spectra_object.contentDocument.querySelector('svg');
    spectra_loading_symbol = spectra_graph.getElementById('loading-symbol');
}

function drag_event(node, f) {
    node.addEventListener('mousedown', () => HR_diagram.addEventListener('mousemove', f));
    HR_diagram.addEventListener('mouseup', () => HR_diagram.removeEventListener('mousemove', f));
    HR_diagram.addEventListener('mouseleave', () => HR_diagram.removeEventListener('mousemove', f));
}

function update_HR_diagram() {
    if (HR_diagram == null) return;

    [...HR_diagram.querySelectorAll('.marker')].forEach(x => x.remove())

    var reference_text = HR_diagram.getElementById('class-label-O');
    var box = HR_diagram.getElementById('plot-area').getBBox();

    var ymax = [-5, HR_diagram.getElementById('luminosity-min').getBBox().y];
    var ymin = [5, HR_diagram.getElementById('luminosity-max').getBBox().y];

    [...document.querySelectorAll('#primaries .body-entry')].forEach(body => {

        var luminosity = get_standard_value(body.querySelector('input[name=luminosity]'));
        var temperature = get_standard_value(body.querySelector('input[name=surface-temperature]'));
        var radius = get_standard_value(body.querySelector('input[name=radius]'));

        if (luminosity == undefined || temperature == undefined) return;

        luminosity = unit_converter('W', 'L☉')(luminosity);
        radius = unit_converter('m', 'R☉')(radius) || 1;

        var x = Math.pow((temperature - 32461.5) / -15271.5, 1/0.129729) + 30.5; // magic equation
        if (!isFinite(x)) return;

        var y = lerp(...ymin, ...ymax, Math.log10(luminosity));
        var r = Math.max(5 + Math.log10(radius) * 2, 1);

        if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) return;

        var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.classList.add('marker');
        dot.setAttributeNS(null, 'r', r);
        dot.setAttributeNS(null, 'cx', x);
        dot.setAttributeNS(null, 'cy', y);
        dot.setAttributeNS(null, 'fill', blackbody_color(temperature));
        dot.setAttributeNS(null, 'stroke', '#505050');
        dot.setAttributeNS(null, 'stroke-width', 0.5);

        HR_diagram.appendChild(dot);

        var name = body.querySelector('input[name=name]').value;

        if (typeof name == 'string' && name.length > 0) {
            var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.classList.add('marker');
            label.setAttributeNS(null, 'style', reference_text.style.cssText);

            var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttributeNS(null, 'style', reference_text.firstChild.style.cssText);
            tspan.appendChild(document.createTextNode(name));

            label.appendChild(tspan);
            HR_diagram.appendChild(label);

            var lb = label.getBBox();
            label.setAttributeNS(null, 'x', x + (x-lb.x < 3*box.width/4 ? r+2 : -(r+2+lb.width)));
            label.setAttributeNS(null, 'y', y + lb.height / 3);
        }

        function drag_point(e) {
            var pt = HR_diagram.createSVGPoint();
            pt.x = e.pageX;
            pt.y = e.pageY;
            var svgP = pt.matrixTransform(HR_diagram.getScreenCTM().inverse());
            var x = svgP.x;
            var y = svgP.y;

            if (x < 30.5 || x > box.x + box.width || y < box.y || y > box.y + box.height) return;

            [...body.querySelectorAll('input[data-type=number]')].forEach(x => {
                x.disabled = false;
                x.value = '';
            });

            var luminosity = Math.pow(10, lerp(ymin[1], ymin[0], ymax[1], ymax[0], y));
            var temperature = -15271.5 * Math.pow(x - 30.5, 0.129729) + 32461.5; // magic equation
            
            var luminosity_input = body.querySelector('input[name=luminosity]');
            luminosity_input.disabled = false;

            var temperature_input = body.querySelector('input[name=surface-temperature]');
            temperature_input.disabled = false;

            luminosity_input.value = format_sf(luminosity, parseFloat(luminosity_input.dataset.sf));
            luminosity_input.nextElementSibling.innerText = 'L☉';

            temperature_input.value = format_sf(temperature, parseFloat(temperature_input.dataset.sf));
            temperature_input.nextElementSibling.innerText = 'K';

            luminosity_input.dispatchEvent(new Event('input'));
        }

        drag_event(dot, drag_point);
    });
}

function update_spectra_select() {
    var selector = document.getElementById('spectra-planet-select');
    var value = parseFloat(selector.value);
    selector.innerHTML = '';

    var bodies = [...document.getElementsByClassName('secondary')];
    if (bodies.length == 0) {
        var opt = document.createElement('option');
        opt.value = 0;
        selector.appendChild(opt);
        return;
    }

    value = Math.min(value, bodies.length+1);

    bodies.forEach((body, i) => {
        var opt = document.createElement('option');
        opt.value = i+1;
        if (i+1 == value) opt.selected = true;
        opt.innerText = body.querySelector('input[name=name]').value || 'Unnamed planet #' + (i+1);
        selector.appendChild(opt);
    });
}

var update_spectra_timeout = null;
function update_spectra() {
    if (spectra_loading_symbol == undefined) set_diagram();

    spectra_loading_symbol.setAttributeNS(null, 'style', 'display:unset;');
    if (update_spectra_timeout != null)
        clearTimeout(update_spectra_timeout);
    update_spectra_timeout = setTimeout(() => {
        _update_spectra();
        spectra_loading_symbol.setAttributeNS(null, 'style', 'display:none;');
    }, 0);
}

function _update_spectra() {
    update_spectra_timeout = null;

    let selector = document.getElementById('spectra-planet-select');
    if (selector.value == '0') return;

    let body = [...document.getElementsByClassName('secondary')][parseFloat(selector.value)-1];
    let body_temperature = get_standard_value(body.querySelector('input[name=equilibrium-temperature]'));
    if (!isFinite(body_temperature)) return;

    let primaries = document.getElementsByClassName('primary');
    let primary_temperatures = [...primaries].map(
        x => get_standard_value(x.querySelector('input[name=surface-temperature]')));
    if (!primary_temperatures.every(isFinite)) return;

    [...spectra_graph.querySelectorAll('.spectrum-graph')].forEach(x => x.remove());

    function blackbody(T) {
        return (f) => {
            return (
                (8 * Math.PI * PLANCK_CONSTANT / Math.pow(SPEED_OF_LIGHT, 3)) * Math.pow(f, 3)
                / (Math.exp(PLANCK_CONSTANT / BOLTZMANN_CONSTANT * f / T) - 1) );
        };
    }

    let blackbody_peak_radiance = (T) => {
        let peak_wavelength = WIENS_DISPLACEMENT_CONSTANT / T;
        return blackbody(T)(SPEED_OF_LIGHT / peak_wavelength);
    };

    let max_incoming_radiance = blackbody_peak_radiance(Math.max(...primary_temperatures));
    let max_outgoing_radiance = blackbody_peak_radiance(body_temperature);

    let primary_blackbodies = primary_temperatures.map(x => blackbody(x));
    let primary_blackbody = (f) => primary_blackbodies.reduce((acc, B) => B(f) + acc, 0);
    let body_blackbody = blackbody(body_temperature);

    let plot_area = spectra_graph.getElementById('plot-area')
    let box = plot_area.getBBox();

    // Smooth graph drawing functions (`line`, `controlPoint`, `straightLine`, `bezier`, and `svgPath`)
    //   are from https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

    // const smoothing = 0.2

    // const line = (pointA, pointB) => {
    //     const lengthX = pointB[0] - pointA[0]
    //     const lengthY = pointB[1] - pointA[1]
    //     return {
    //         length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    //         angle: Math.atan2(lengthY, lengthX)
    //     }
    // }

    // const controlPoint = (current, previous, next, reverse) => {
    //     const p = previous || current
    //     const n = next || current
    //     const o = line(p, n)
    //     const angle = o.angle + (reverse ? Math.PI : 0)
    //     const length = o.length * smoothing
    //     const x = current[0] + Math.cos(angle) * length
    //     const y = current[1] + Math.sin(angle) * length
    //     return [x, y]
    // }

    // const bezier = (point, i, a) => {
    //     const cps = controlPoint(a[i - 1], a[i - 2], point)
    //     const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    //     return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`
    // }

    const straightLine = point => `L ${point[0]} ${point[1]}`

    const svgPath = (points) => {
        return points.reduce((acc, point, i, a) => i === 0
            ? `M ${point[0]},${point[1]}`
            : `${acc} ${straightLine(point, i, a)}`
        , '');
    }

    // End smooth graph drawing functions;

    const TEXT_STYLE = "font-size:2px;line-height:1.2;font-family:sans-serif;";
    const TSPAN_STYLE = "text-align:center;text-anchor:middle;fill:#000000;fill-opacity:1;stroke-width:0.264583";
    const BLACKBODY_CURVE_STYLE = "fill:none;stroke:#353535;stroke-width:0.260937;stroke-dasharray:1 1";
    const SPECTRUM_CURVE_STYLE = "fill:#ff000030;stroke:none";

    let num_points = 1000;
    let min_x = 0.2;
    let max_x = 70;

    var x_to_Hz = (x) => SPEED_OF_LIGHT / (x * 1e-6);

    while (primary_blackbody(x_to_Hz(min_x)) > 0.05 * max_incoming_radiance) min_x -= 50;
    min_x = Math.max(0.05, min_x);

    while (body_blackbody(x_to_Hz(max_x)) > 0.05 * max_outgoing_radiance) max_x += 500;

    let log_min_x = Math.log10(min_x);
    let log_max_x = Math.log10(max_x);

    x_to_Hz = (x) => SPEED_OF_LIGHT / (Math.pow(10, x) * 1e-6);

    let distribute = (a,b,n) => [...Array(n).keys()].map(x => (b-a) * (x/(n-1)) + a);
    let xpoints = distribute(log_min_x, log_max_x, num_points);

    let x_to_box = (x) => lerp(log_min_x, box.x, log_max_x, box.x + box.width, x);

    let integers = (a,b) => distribute(a, b, b-a+1);
    let xticks = (integers(Math.floor(log_min_x), Math.ceil(log_max_x))
        .reduce((acc,x) => acc.concat(distribute(Math.pow(10, x-1), Math.pow(10, x), 10)).slice(1), [])
        .map(x => parse_float(format_sf(x, 1)))
        .filter(x => x >= min_x && x <= max_x));

    xticks.forEach(x => {
        let graph_x = x_to_box(Math.log10(x));

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('spectrum-graph');
        path.setAttributeNS(null, 'd', `M ${graph_x},${box.y+box.height} v 2`);
        path.setAttributeNS(null, 'style', plot_area.style.cssText);
        spectra_graph.appendChild(path);

        let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.classList.add('spectrum-graph');
        label.setAttributeNS(null, 'style', TEXT_STYLE);
        label.setAttributeNS(null, 'x', graph_x);

        let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttributeNS(null, 'style', TSPAN_STYLE);
        tspan.appendChild(document.createTextNode(x));

        label.appendChild(tspan);
        spectra_graph.appendChild(label);

        label.setAttributeNS(null, 'y', box.y+box.height+2.1+tspan.getBBox().height);
    });

    let make_coords = (xs, ys, ymax) => {
        let max_y = ymax || Math.max(...ys);
        let coords = [];
        xs.forEach((x,i) => {
            if (x < log_max_x)
                coords.push([
                    x_to_box(x),
                    lerp(0, box.y + box.height, max_y*1.05, box.y, ys[i])
                ]);
        });
        return coords;
    };

    let make_path = (coords, style) => {
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('spectrum-graph');
        path.setAttributeNS(null, 'd', svgPath(coords));
        path.setAttributeNS(null, 'style', style || BLACKBODY_CURVE_STYLE);
        return path;
    };

    // Calculate transmission function

    [xpoints, transmission] = calculate_atmospheric_transmission(xpoints.map(x => Math.pow(10,x)));
    xpoints = xpoints.map(Math.log10);

    var points = xpoints.map((x,i) => [x, transmission[i]]);
    points.sort((a,b) => a[0] - b[0]);
    [xpoints, transmission] = [points.map(x => x[0]), points.map(x => x[1])];

    // Draw primary spectrum

    var ypoints = xpoints.map(x => primary_blackbody(x_to_Hz(x)));
    var ymax = Math.max(...ypoints);

    spectra_graph.appendChild(make_path(make_coords(xpoints, ypoints)));

    var ypoints = ypoints.map((y,i) => y * transmission[i]);
    spectra_graph.appendChild(make_path(make_coords(xpoints, ypoints, ymax), SPECTRUM_CURVE_STYLE));

    // Draw body spectrum

    var ypoints = xpoints.map(x => body_blackbody(x_to_Hz(x)));
    var ymax = Math.max(...ypoints);

    spectra_graph.appendChild(make_path(make_coords(xpoints, ypoints)));

    var ypoints2 = ypoints.map((y,i) => y * transmission[i]);
    spectra_graph.appendChild(make_path(make_coords(xpoints, ypoints2, ymax), SPECTRUM_CURVE_STYLE));

    // Update description
    setTimeout(update_greenhouse_effect_paragraph, 0, body_temperature, xpoints, ypoints, ypoints2);

    // Notify user
    alert('Spectra graph has been updated.')
}

function calculate_atmospheric_transmission(samples) {

    let selector = document.getElementById('spectra-planet-select');
    let body = [...document.getElementsByClassName('secondary')][parseFloat(selector.value)-1];

    let temperature = get_standard_value(body.querySelector('input[name=equilibrium-temperature]'));
    let g = get_standard_value(body.querySelector('input[name=surface-gravity]'));

    let gases = get_atmosphere_data(temperature);

    let transmission = Array(samples.length).fill(1);
    if (g == undefined || gases.length == 0) return [samples, transmission];

    let average_molar_mass = gases.reduce((acc,x) => acc + x.fraction * x.molar_mass, 0);
    let total_pressure = gases[0].pressure / gases[0].fraction;
    var reference_pressure = 0.03; // Pa

    if (!isFinite(total_pressure)) return [samples, transmission];

    samples = samples.map(x => 1e4/x); // convert to reciprocal cm

    // height calculation based on the barometric formula with a constant lapse rate
    const lapse_rate = -0.0065;
    let height = (
        ( Math.pow(reference_pressure/total_pressure,
            -GAS_CONSTANT * lapse_rate / (g * average_molar_mass))
        - 1 ) * temperature / lapse_rate );

    var reference_pressure = 101325; // Pa; for spectroscopic data
    let reference_temperature = 296; // K; for spectroscopic data

    let temperature_ratio = temperature / reference_temperature;

    let intensity_k0 = PLANCK_CONSTANT * SPEED_OF_LIGHT / (BOLTZMANN_CONSTANT * reference_temperature);
    let intensity_k1 = PLANCK_CONSTANT * SPEED_OF_LIGHT / (BOLTZMANN_CONSTANT * temperature);

    let transmission_functions = [];

    gases.forEach(gas => {
        let k = -g * average_molar_mass / (GAS_CONSTANT * temperature) * height;
        let average_pressure = gas.pressure * (Math.exp(k) - 1) / k;
        let mass_path = gas.fraction * height * average_pressure / (BOLTZMANN_CONSTANT * temperature);

        let pressure_ratio = average_pressure / reference_pressure;

        for (let line of GAS_SPECTRA[gas.gas] || []) {
            let delta = gas.fraction * line.delta_self + (1 - gas.fraction) * line.delta_air;
            let nu_c = line.nu + delta * pressure_ratio;

            samples.push(nu_c);

            let lorentz_halfwidth = (
                (1 - gas.fraction) * line.gamma_air * Math.pow(temperature_ratio, line.n_air)
                + gas.fraction * line.gamma_self * Math.pow(temperature_ratio, line.n_self)
            ) * pressure_ratio;

            let lorentz_halfwidth_squared = lorentz_halfwidth * lorentz_halfwidth;
            let lineshape_adjust_denominator = Math.tanh(intensity_k1 * nu_c / 2);

            let lineshape = (nu) => {
                let shape = (lorentz_halfwidth / Math.PI) * (nu / nu_c)
                    * (1 / (Math.pow(nu - nu_c, 2) + lorentz_halfwidth_squared)
                        + 1 / (Math.pow(nu + nu_c, 2) + lorentz_halfwidth_squared));
                let adjust = (nu / nu_c) * (
                    Math.tanh(intensity_k1 * nu / 2) / lineshape_adjust_denominator );
                return shape * adjust;
            };

            let line_intensity = (line.sw
                * Math.exp(line.elower * (intensity_k1 - intensity_k0))
                * (1 - Math.exp(-intensity_k1 * nu_c)) / (1 - Math.exp(-intensity_k0 * nu_c)));

            let T = (nu) => Math.exp(-mass_path * line_intensity * lineshape(nu));

            transmission_functions.push(T);
        }
    });

    transmission = samples.map(x => {
        let t = 1;
        transmission_functions.forEach(f => { t *= f(x); });
        return t;
    });

    samples = samples.map(x => 1e4/x); // convert back to micrometers
    return [samples, transmission];
}

var greenhouse_effect_paragraph;

function update_greenhouse_effect_paragraph(T, xpoints, ys1, ys2) {
    function integrate(xs, ys) {
        return [...Array(xs.length-1).keys()].map(i =>
            (xs[i+1] - xs[i]) * (ys[i+1] + ys[i]) / 2
        ).reduce((acc,x) => acc+x, 0);
    }

    xpoints = xpoints.map(x => Math.pow(10,x));

    var ideal_power = integrate(xpoints, ys1);
    var actual_power = integrate(xpoints, ys2);

    console.log(ideal_power, actual_power);

    var percentage_kept = round_dp(100 * (1 - actual_power/ideal_power), 0);

    if (percentage_kept == 0) {
        greenhouse_effect_paragraph.innerText = '';
    } else {
        surface_temperature = T * Math.pow(actual_power/ideal_power, -1/4);
        greenhouse_effect_paragraph.innerText = ('Around ' + percentage_kept
            + '% of the energy radiated from the surface is reabsorbed by the atmosphere. '
            + 'This results in a surface temperature of '
            + format_sf(unit_converter('K','°C')(surface_temperature), 3) + '°C.');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    greenhouse_effect_paragraph = document.getElementById('greenhouse-effect-paragraph');
});
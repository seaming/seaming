var ruler;

const VOLUME_CONST = 4.0 / 3.0 * Math.PI;
const PI_SQ = Math.PI * Math.PI;
const GRAVITATIONAL_CONSTANT = 6.67430e-11;
const STEFAN_BOLTZMANN_CONSTANT = 5.670374419e-8;
const SPEED_OF_LIGHT = 299792458;

const MASS = ['kg', 'M🜨', 'M☉'];
const LENGTH = ['m', 'km', 'R🜨', 'R☉', 'AU'];
const DURATION = ['s', 'hour', 'day', 'year'];
const TEMPERATURE = ['K', '°C', '°F'];
const LUMINOSITY = ['W', 'L☉'];
const DENSITY = ['kg/m³', 'g/cm³'];
const FREQUENCY = ['Hz', 'per hour', 'per day', 'per year'];
const ACCELERATION = ['m/s²', 'g'];
const ANGLE = ['degrees', 'radians'];
const PRESSURE = ['Pa', 'kPa', 'bar', 'atm'];
const DIMENSIONLESS = [];

const SYMBOL_TABLE = {
    'kg': 1.0,
    'M🜨': 5.97237e24, // kg
    'M☉': 1.98847e30, // kg
    'm': 1.0,
    'km': 1000.0,
    'R🜨': 6371000.0, // m
    'R☉': 695700000.0, // m
    'AU': 149597870700.0, // m
    'g/cm³': 1000.0,
    'kg/m³': 1.0,
    's': 1.0,
    'hour': 3600.0, // s
    'day': 86400.0, // s
    'year': 31557600.0, // s
    'Hz': 1.0,
    'per hour': 1.0 / 60.0, // Hz
    'per day': 1.0 / 86400.0, // Hz
    'per year': 1.0 / 31557600.0, // Hz
    'm/s²': 1.0,
    'g': 9.80665, // m s⁻²
    'degrees': 1.0,
    'radians': Math.PI / 180.0, // degrees
    'K': 1.0, // K
    '°C': [1.0, 273.15], // K
    '°F': [5/9, 459.67], // K
    'W': 1.0,
    'L☉': 3.828e26, // W
    'Pa': 1,
    'kPa': 1000.0, // Pa
    'bar': 100000, // Pa
    'atm': 101325, // Pa
}

function lerp(x1, y1, x2, y2, x) {
    return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
}

function round_dp(x,n) {
    if (!isFinite(n))
        return x;
    return Math.round((x + Number.EPSILON) * Math.pow(10,n)) / Math.pow(10,n);
}

function format_sf(x,n) {
    if (!isFinite(x) || !isFinite(n))
        return x;

    if (x == 0)
        return '0' + (n > 1 ? '.' + '0'.repeat(n-1) : '');

    var e = Math.floor(Math.log10(Math.abs(x)));
    var x = round_dp(x / Math.pow(10,e), n-1) * Math.pow(10,e);

    if (Math.abs(e) >= 50)
        return x.toString();

    // Comma-inserting regex from
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript

    x = x.toString();
    var [pre,post] = x.includes('.') ? x.split('.') : [x,''];
    if (pre.includes('e'))
        [pre, post] = [pre.split('e')[0], ''];

    if (e >= 21) {
        post = post.split('e')[0].slice(0, n-pre.length);
        return (pre + post + '0'.repeat(e-n+1)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else if (e <= -7) {
        var tail = '0'.repeat(Math.abs(e) - pre.length) + pre + post.split('e')[0] + '0'.repeat(n);
        var leading_zeros = tail.length > 0 ? tail.match(/(0*)[^0]/)[1].length : 0;
        return '0.' + tail.slice(0, n + leading_zeros);
    }

    var tail = post + '0'.repeat(n);
    var leading_zeros = post.length > 0 ? post.match(/(0*)[^0]/)[1].length : 0;
    tail = tail.slice(0, Math.max(0, n + leading_zeros - (e < 0 ? 0 : pre.length)));
    pre = pre.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (pre || '0') + (tail.length > 0 ? '.' + tail : '');
}

function parse_float(s) {
    // I can't believe I have to do this but the builtin `parseFloat` can't hanndle commas.
    return parseFloat(s.replaceAll(',', ''));
}

function is_number(n) {
    return typeof n === 'number' && isFinite(n);
}

function unit_converter(a,b) {
    if (a === b)
        return x => x;
    if (dimension(a) !== dimension(b))
        console.error('Cannot convert a ' + a + ' into a ' + b + '.');
    var a = SYMBOL_TABLE[a];
    var fa = (typeof a == 'object') ? (x => x*a[0]+a[1]) : (x => x*a);
    var b = SYMBOL_TABLE[b];
    var fb = (typeof b == 'object') ? (x => x/b[0]-b[1]) : (x => x/b);
    return x => fb(fa(x));
}

function dimension(unit) {
    if (unit == 'dimensionless') return ['dimensionless'];
    return [
        MASS, LENGTH, DURATION, TEMPERATURE, LUMINOSITY, PRESSURE,
        DENSITY, FREQUENCY, ACCELERATION, ANGLE, DIMENSIONLESS
    ].find(x => x.includes(unit));
}

function get_units(input) {
    var unit = input.nextElementSibling;
    if (unit != null && unit.classList.contains('units'))
        return unit.innerText;
    return 'dimensionless';
}

function get_standard_value(input) {
    var unit = get_units(input);
    if (input.value == undefined) return undefined;
    var raw = parse_float(input.value);
    if (isFinite(raw))
        return unit_converter(unit, dimension(unit)[0])(raw);
    return undefined;
}

function measure_text_length(text) {
    ruler.innerText = text;
    return ruler.offsetWidth;
}

function delete_button() {
    var button = document.createElement('span');
    button.classList.add('delete');
    button.innerText = '×';

    button.onclick = () => {
        button.parentNode.remove();
        if (button.parentElement.classList.contains('primary')) {
            num_primaries -= 1;
            check_primaries();
        } else if (button.parentElement.classList.contains('secondary'))
            update_spectra_select();
    }

    return button;
}

function make_row_label(label) {
    var el = document.createElement('div');
    el.classList.add('input-row-label');
    el.innerText = label;
    return el;
}

function make_input_pair(name, params) {
    var container = document.createElement('div');
    container.classList.add('input-pair');

    var input = document.createElement('input');

    input.type = 'text'; // We always have to have it be text so validation doesn't complain.
    input.dataset.type = params['type'] || 'number'

    input.name = name.toLowerCase().split('(')[0].trim().replace(' ','-');
    if (params['prepend-name'] === false && params['placeholder'] !== false)
        input.placeholder = name;

    if (typeof params['sf'] == 'number')
        input.dataset.sf = params['sf'];

    input.oninput = () => {
        if (input.value.length > 0)
            input.style.width = measure_text_length(input.value) + "px";
        else if (params['prepend-name'] === false)
            input.style.width = measure_text_length(name) + "px";
        else
            input.style.width = "3em";
    }
    input.oninput();

    if (params['prepend-name'] !== false)
        container.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('input-pair-label')
            el.innerText = name + ':';
            return el;
        })());

    container.appendChild(input);

    var units = params['units'];
    if (units !== undefined && units.length > 0) {
        var unitbox = document.createElement('button');
        unitbox.classList.add('units');
        unitbox.innerText = units[0];

        unitbox.addEventListener('click', () => {
            if (!unitbox.classList.contains('locked')) {
                var currentIndex = units.findIndex(x => x == unitbox.innerText);
                unitbox.innerText = units[(currentIndex + 1) % units.length];
            }
        });

        container.appendChild(unitbox);
    }

    return container;
}

var num_primaries = 0;
var num_primaries_warning;
var primary_watchers = [];

function check_primaries() {
    if (num_primaries > 0) {
        num_primaries_warning.classList.add('hidden');
        (document.getElementById('secondaries')
            .querySelectorAll('.body-entry, input, .units')
            .forEach(x => x.classList.remove('locked')));
    } else {
        num_primaries_warning.classList.remove('hidden');
        (document.getElementById('secondaries')
            .querySelectorAll('.body-entry, input, .units')
            .forEach(x => x.classList.add('locked')));
    };
}

function add_primary(caller) {
    var el = document.createElement('div');
    el.classList.add('body-entry', 'primary');

    var name = make_input_pair('Name', {'prepend-name': false, 'type': 'text'});
    el.appendChild(name);

    var mass = make_input_pair('Mass', { units: MASS, sf: 6 });
    var radius = make_input_pair('Radius', { units: LENGTH, sf: 6 });
    var temperature = make_input_pair('Surface temperature', { units: TEMPERATURE, sf: 4 });
    var luminosity = make_input_pair('Luminosity', { units: LUMINOSITY, sf: 6 });
    var stellar_class = make_input_pair('Stellar class', { 'type': 'text' });
    stellar_class.classList.add('stellar-class');
    
    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(temperature);
    fields.appendChild(luminosity);
    fields.appendChild(stellar_class);

    // Mass-luminosity equation values used are those given by
    //   https://en.wikipedia.org/wiki/Mass–luminosity_relation
    linked_pair(mass, luminosity,
        L => {
            var Lsun = unit_converter('W', 'L☉')(L);
            var f = unit_converter('M☉', 'kg');
            if (Lsun < 0.23 * Math.pow(0.43, 2.3))
                return f(Math.pow(Lsun / 0.23, 1/2.3));
            else if (Lsun < 16)
                return f(Math.pow(Lsun, 1/4));
            else if (Lsun < 176000)
                return f(Math.pow(Lsun / 1.4, 1/3.5));
            else
                return f(Lsun / 3200);
        },
        M => {
            var Msun = unit_converter('kg', 'M☉')(M);
            var f = unit_converter('L☉', 'W');
            if (Msun < 0.43)
                return f(0.23 * Math.pow(Msun, 2.3));
            else if (Msun < 2)
                return f(Math.pow(Msun, 4));
            else if (Msun < 55)
                return f(1.4 * Math.pow(Msun, 3.5));
            else
                return f(3200 * Msun);
        });

    linked_triple(radius, temperature, luminosity,
        (T,L) => Math.sqrt(L / (4 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * T*T*T*T)),
        (R,L) => Math.pow(L / (4 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * R*R), 1/4),
        (R,T) => 4 * Math.PI * R*R * STEFAN_BOLTZMANN_CONSTANT * T*T*T*T);
    
    computed_value(stellar_class, (L,T) => {
        if (L == undefined || T == undefined) return;
        var Lsun = unit_converter('W', 'L☉')(L);
        var c = stellar_classification(T, Lsun);
        var x = stellar_class.querySelector('input');
        x.style['background-color'] = c.color;
        x.style['border'] = '1px solid #505050';
        return c.classification;
    }, luminosity, temperature);

    stellar_class.querySelector('input').addEventListener('input', e => {
        var x = e.target;
        if (x.value.length < 1) {
            x.style['background-color'] = null;
            x.style['border'] = null;
        }
    });

    var black_hole_warning = document.createElement('div');
    black_hole_warning.classList.add('description', 'info', 'warning');
    live_text(black_hole_warning, (n,m,r) => {
        if (m == undefined || r == undefined) return;
        var schwarzschild_radius = 2 * GRAVITATIONAL_CONSTANT * m / Math.pow(SPEED_OF_LIGHT, 2);
        if (schwarzschild_radius < r) return;
        var text = (n || 'This body') + " is too dense!";
        text += " Its mass and radius are such that it would collapse into a black hole.";

        var mi = mass.querySelector('input')
        var mu = get_units(mi);
        text += (" Either its mass must be less than "
            + format_sf(unit_converter(MASS[0], mu)(r * Math.pow(SPEED_OF_LIGHT, 2) / GRAVITATIONAL_CONSTANT),
                parseFloat(mi.dataset.sf))
            + ' ' + mu);

        var ri = radius.querySelector('input');
        var ru = get_units(ri);
        text += (", or its radius greater than "
            + format_sf(unit_converter(LENGTH[0], ru)(schwarzschild_radius),
                parseFloat(ri.dataset.sf))
            + ' ' + ru);

        return text + '.';
    }, name, mass, radius);
    fields.appendChild(black_hole_warning);
    
    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    num_primaries += 1;
    check_primaries();
    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);

    for (var field of [name, radius, luminosity, temperature]) {
        var x = field.querySelector('input');
        x.addEventListener('input', update_HR_diagram);
        var unit = x.nextElementSibling;
        if (unit != null && unit.classList.contains('units'))
            unit.addEventListener('click', update_HR_diagram);

    }
    
    update_HR_diagram();

    for (var [field, f] of primary_watchers) {
        for (var input of document.querySelectorAll('#primaries .body-entry input[name='+field+']')) {
            input.addEventListener('input', f);
            var unit = input.nextElementSibling;
            if (unit != null && unit.classList.contains('units'))
                unit.addEventListener('click', f);
        }
    }

    compute_angular_sizes();
}

function total_primary_property(caller, property) {
    var x;
    if (caller.parentNode.parentNode.tagName == 'BODY')
        x = document.getElementById('primaries').querySelectorAll('input[name='+property+']');
    else
        x = [caller.parentNode.parentNode.querySelector('input[name='+property+']')];

    x = Array.from(x).map(a => {
        if (a.dataset.type == 'number') {
            return get_standard_value(a);
        } else return a.value;
    });
    return x.reduce((partial, v) => partial + v, 0) || undefined;
}

// function calc_primary_property(caller, f, ...properties) {
//     var x;
//     if (caller.parentNode.parentNode.tagName == 'BODY')
//         x = document.getElementById('primaries').querySelectorAll('input');
//     else
//         x = caller.parentNode.parentNode.querySelectorAll('input');
    
//     var values = properties.map(p => Array.from(x).filter(a => a.name == p).map(a => {
//         if (a.dataset.type == 'number') {
//             var unit = get_units(a);
//             return unit_converter(unit, dimension(unit)[0])(parseFloat(a.value));
//         } else return a.value;
//     }));
//     var rows = values[0].map((_,c) => values.map(p => p[c]));
//     return rows.map(x => f(...x));
// }

function add_secondary(caller) {
    if (num_primaries < 1) return;

    var el = document.createElement('div');
    el.classList.add('body-entry', 'secondary');

    var name = make_input_pair('Name', {'prepend-name': false, 'type': 'text'});
    el.appendChild(name);

    var mass = make_input_pair('Mass', { units: MASS, sf: 6 });
    var radius = make_input_pair('Radius', { units: LENGTH, sf: 6 });
    var density = make_input_pair('Density', { units: DENSITY, sf: 6 });
    var surface_gravity = make_input_pair('Surface gravity', { units: ACCELERATION, sf: 6 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(density);
    fields.appendChild(surface_gravity);

    linked_triple(mass, radius, density,
        (r,d) => VOLUME_CONST*r*r*r * d,
        (m,d) => Math.pow((m/d) / VOLUME_CONST, 1/3),
        (m,r) => m / (VOLUME_CONST*r*r*r));

    linked_triple(mass, radius, surface_gravity,
        (r,g) => r*r*g / GRAVITATIONAL_CONSTANT,
        (m,g) => Math.sqrt(GRAVITATIONAL_CONSTANT * m / g),
        (m,r) => GRAVITATIONAL_CONSTANT * m / (r*r))
    
    linked_triple(radius, density, surface_gravity,
        (d,g) => 3 * g / (4 * Math.PI * GRAVITATIONAL_CONSTANT * d),
        (r,g) => 3 * g / (4 * Math.PI * GRAVITATIONAL_CONSTANT * r),
        (r,d) => 4 * Math.PI / 3 * GRAVITATIONAL_CONSTANT * d * r);

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var rotation_period = make_input_pair('Rotation period', { units: DURATION, sf: 6 });
    var flattening_coefficient = make_input_pair('Flattening coefficient', { units: DIMENSIONLESS, sf: 6 });
    var axial_tilt = make_input_pair('Axial tilt', { units: ANGLE, sf: 6 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(rotation_period);
    fields.appendChild(flattening_coefficient);
    fields.appendChild(axial_tilt);

    linked_triple(density, rotation_period, flattening_coefficient,
        (n,f) => 15*Math.PI/4 * 1/(GRAVITATIONAL_CONSTANT * n*n * f),
        (d,f) => Math.sqrt(4 * f / (15 * Math.PI) * GRAVITATIONAL_CONSTANT * d),
        (d,n) => 15*Math.PI/4 * 1/(GRAVITATIONAL_CONSTANT * n*n * d));

    var rotational_properties = document.createElement('div');
    rotational_properties.classList.add('input-row');
    rotational_properties.appendChild(make_row_label('Rotational properties'));
    rotational_properties.append(fields);
    el.appendChild(rotational_properties);

    var semimajor_axis = make_input_pair('Semi-major axis', { units: LENGTH, sf: 8 });
    var periapsis = make_input_pair('Periastron', { units: LENGTH, sf: 8 });
    var apoapsis = make_input_pair('Apoastron', { units: LENGTH, sf: 8 });
    var eccentricity = make_input_pair('Eccentricity', { units: DIMENSIONLESS, sf: 8 });
    var period = make_input_pair('Orbital period', { units: DURATION, sf: 8 });
    var inclination = make_input_pair('Orbital inclination', { units: ANGLE, sf: 8 });
    var hill_radius = make_input_pair('Hill radius', { units: LENGTH, sf: 4 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(semimajor_axis);
    fields.appendChild(periapsis);
    fields.appendChild(apoapsis);
    fields.appendChild(eccentricity);
    fields.appendChild(period);
    fields.appendChild(inclination);
    fields.appendChild(hill_radius);

    var roche_limit_warning = document.createElement('div');
    roche_limit_warning.classList.add('description', 'info', 'warning');
    live_text(roche_limit_warning, (n,m,r,a) => {
        var p_m = total_primary_property(el, 'mass');
        if (p_m == undefined || m == undefined || r == undefined || a == undefined) return;
        var roche_distance = r * Math.pow(2 * p_m / m, 1/3);
        if (roche_distance < a) return;
        var text = (n || 'This body') + " is too close to its primary!";
        text += " It orbits within the Roche limit of the primary and will be torn apart by tidal forces.";
        return text;
    }, name, mass, radius, semimajor_axis);
    fields.appendChild(roche_limit_warning);

    computed_value(hill_radius, (m,a,e) => {
        var M = total_primary_property(el, 'mass');
        return a * (1 - (e || 0)) * Math.pow(m / (3*M), 1/3);
    }, mass, semimajor_axis, eccentricity);

    var year_length = document.createElement('div');
    year_length.classList.add('description');
    live_text(year_length, (n,year,day) => {
        if (year == undefined || day == undefined) return;
        var n = n || '';
        return (
            "A sidereal year " + (n!==''?"on "+n:"") + " is " + round_dp(year/day, 4) + " local sidereal days, or "
            + round_dp((year - day)/day, 4) + " local solar days long.");
    }, name, period, rotation_period);
    fields.appendChild(year_length);

    var day_length = document.createElement('div');
    day_length.classList.add('description');
    live_text(day_length, (n,year,day) => {
        if (year == undefined || day == undefined) return;
        var n = n || '';
        var u = unit_converter('s', 'hour');
        var solar_day = year * day / (year - day);
        return (
            "A sidereal day " + (n!==''?"on "+n:"") + " is " + round_dp(u(day), 4) + " hours long. "
            + "A solar day is " + round_dp(u(solar_day), 4) + " hours long.");
    }, name, period, rotation_period);
    fields.appendChild(day_length);

    var f = linked_pair(semimajor_axis, period,
        t => Math.pow(t*t/(4*PI_SQ) * total_primary_property(caller, 'mass') * GRAVITATIONAL_CONSTANT, 1/3),
        a => 2 * Math.PI * Math.sqrt(a*a*a/(GRAVITATIONAL_CONSTANT * total_primary_property(caller, 'mass'))),
        { 'watch': document.getElementById('primaries').querySelectorAll('input[name=mass]') });

    primary_watchers.push(['mass', f]);

    linked_triple(semimajor_axis, periapsis, apoapsis,
        (p,a) => (p+a) / 2.0,
        (sma,a) => 2.0 * sma - a,
        (sma,p) => 2.0 * sma - p);
    
    linked_triple(semimajor_axis, periapsis, eccentricity,
        (p,e) => p / (1-e),
        (a,e) => a * (1-e),
        (a,p) => 1 - p/a);

    var orbital_properties = document.createElement('div');
    orbital_properties.classList.add('input-row');
    orbital_properties.appendChild(make_row_label('Orbital properties'));
    orbital_properties.append(fields);
    el.appendChild(orbital_properties);

    var albedo = make_input_pair('Albedo', { units: DIMENSIONLESS, sf: 6 });
    var equilibrium_temperature = make_input_pair('Equilibrium temperature', { units: TEMPERATURE, sf: 4 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(albedo);
    fields.appendChild(equilibrium_temperature);

    var f = linked_triple(semimajor_axis, albedo, equilibrium_temperature,
        (a,T) => Math.sqrt( total_primary_property(caller, 'luminosity') * (1-a)
            / (16 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * Math.pow(T,4)) ),
        (d,T) => 1 - 16 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * d*d * Math.pow(T,4)
            / total_primary_property(caller, 'luminosity'),
        (d,a) => Math.pow( total_primary_property(caller, 'luminosity') * (1-a)
            / (16 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * d*d), 1/4),

        { 'watch': document.getElementById('primaries').querySelectorAll('input[name=luminosity]') });

    primary_watchers.push(['luminosity', f]);

    var surface_properties = document.createElement('div');
    surface_properties.classList.add('input-row');
    surface_properties.appendChild(make_row_label('Surface properties'));
    surface_properties.append(fields);
    el.appendChild(surface_properties);

    {
        var x = document.createElement('div');
        x.innerHTML = '<div class="body-list"><button class="add-another" onclick="add_tertiary(this)">Add moon</button></div>';
        el.appendChild(x.firstChild);
    }

    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);

    update_spectra_select();
    name.querySelector('input').addEventListener('input', update_spectra_select);

    compute_angular_sizes();
}

function add_tertiary(caller) {
    var el = document.createElement('div');
    el.classList.add('body-entry', 'tertiary');

    var name = make_input_pair('Name', {'prepend-name': false, 'type': 'text'});
    el.appendChild(name);

    var mass = make_input_pair('Mass', { units: MASS, sf: 6 });
    var radius = make_input_pair('Radius', { units: LENGTH, sf: 6 });
    var density = make_input_pair('Density', { units: DENSITY, sf: 6 });
    var surface_gravity = make_input_pair('Surface gravity', { units: ACCELERATION, sf: 6 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(density);
    fields.appendChild(surface_gravity);

    linked_triple(mass, radius, density,
        (r,d) => VOLUME_CONST*r*r*r * d,
        (m,d) => Math.pow((m/d) / VOLUME_CONST, 1/3),
        (m,r) => m / (VOLUME_CONST*r*r*r));

    linked_triple(mass, radius, surface_gravity,
        (r,g) => r*r*g / GRAVITATIONAL_CONSTANT,
        (m,g) => Math.sqrt(GRAVITATIONAL_CONSTANT * m / g),
        (m,r) => GRAVITATIONAL_CONSTANT * m / (r*r));
    
    linked_triple(radius, density, surface_gravity,
        (d,g) => 3 * g / (4 * Math.PI * GRAVITATIONAL_CONSTANT * d),
        (r,g) => 3 * g / (4 * Math.PI * GRAVITATIONAL_CONSTANT * r),
        (r,d) => 4 * Math.PI / 3 * GRAVITATIONAL_CONSTANT * d * r);

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var semimajor_axis = make_input_pair('Semi-major axis', { units: LENGTH, sf: 8 });
    var periapsis = make_input_pair('Periapsis', { units: LENGTH, sf: 8 });
    var apoapsis = make_input_pair('Apoapsis', { units: LENGTH, sf: 8 });
    var eccentricity = make_input_pair('Eccentricity', { units: DIMENSIONLESS, sf: 8 });
    var period = make_input_pair('Orbital period', { units: DURATION, sf: 8 });
    var inclination = make_input_pair('Orbital inclination', { units: ANGLE, sf: 8 });

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(semimajor_axis);
    fields.appendChild(periapsis);
    fields.appendChild(apoapsis);
    fields.appendChild(eccentricity);
    fields.appendChild(period);
    fields.appendChild(inclination);

    var primary_name = caller.parentNode.parentNode.querySelector('input[name=name]');
    primary_name = primary_name.parentNode;

    var primary_radius = caller.parentNode.parentNode.querySelector('input[name=radius]');
    primary_radius = primary_radius.parentNode;

    var primary_density = caller.parentNode.parentNode.querySelector('input[name=density]');
    primary_density = primary_density.parentNode;

    var roche_limit_warning = document.createElement('div');
    roche_limit_warning.classList.add('description', 'info', 'warning');
    live_text(roche_limit_warning, (n,p_n,p_r,p_d,d,a) => {
        if (p_r == undefined || p_d == undefined || d == undefined || a == undefined) return;
        var roche_distance = p_r * Math.pow(2 * p_d / d, 1/3);
        if (roche_distance < a) return;
        var text = (n || 'This body') + " is too close to " + (p_n || 'its primary') + '!';
        text += " It orbits within the Roche limit of " + (p_n || 'the primary') + " and will be torn apart by tidal forces.";
        return text;
    }, name, primary_name, primary_radius, primary_density, density, semimajor_axis);
    fields.appendChild(roche_limit_warning);

    var primary_hill_radius = caller.parentNode.parentNode.querySelector('input[name=hill-radius]');
    primary_hill_radius = primary_hill_radius.parentNode;

    var hill_sphere_warning = document.createElement('div');
    hill_sphere_warning.classList.add('description', 'info', 'warning');
    live_text(hill_sphere_warning, (n,p_n,h,a) => {
        if (h == undefined || a == undefined) return;
        if (a < h) return;
        var text = (n || 'This body') + " is too far from " + (p_n || 'its primary') + '!';
        text += " It orbits outside the Hill sphere of " + (p_n || 'the primary') + " and will be pulled out of its orbit.";
        return text;
    }, name, primary_name, primary_hill_radius, semimajor_axis);
    fields.appendChild(hill_sphere_warning);

    var primary_year = caller.parentNode.parentNode.querySelector('input[name=orbital-period]');
    primary_year = primary_year.parentNode;

    var primary_day = caller.parentNode.parentNode.querySelector('input[name=rotation-period]');
    primary_day = primary_day.parentNode;

    var sidereal_month_length = document.createElement('div');
    sidereal_month_length.classList.add('description');
    live_text(sidereal_month_length, (n,p_n,p_year,p_day,T) => {
        if (p_day == undefined || T == undefined) return;
        var text = ("A sidereal month " + (n?"of "+n:"") + " is "
            + round_dp(T/p_day,4) + " local "  + (p_n?p_n+' ':'') + " sidereal days" );
        if (p_year != undefined) {
            var solar_day = p_year * p_day / (p_year - p_day);
            text += ", or " + round_dp(T/solar_day,4) + " local " + (p_n?p_n+' ':'') + " solar days long."
            text += (" There are " + round_dp(p_year/T,4) + " sidereal months in a sidereal year.")
        } else text += " long.";
        return text;
    }, name, primary_name, primary_year, primary_day, period);
    fields.appendChild(sidereal_month_length);

    var lunar_month_length = document.createElement('div');
    lunar_month_length.classList.add('description');
    live_text(lunar_month_length, (n,p_n,p_year,p_day,T) => {
        if (p_day == undefined || p_year == undefined || T == undefined) return;
        var lunar_month = p_year * T / (p_year - T);
        var text = ("A lunation (lunar month) " + (n?"of "+n:"") + " is "
            + round_dp(lunar_month/p_day,4) + " local "  + (p_n?p_n+' ':'') + " sidereal days" );
        var solar_day = p_year * p_day / (p_year - p_day);
        text += ", or " + round_dp(lunar_month/solar_day,4) + " local " + (p_n?p_n+' ':'') + " solar days long."
        text += (" There are " + round_dp(p_year/lunar_month,4) + " lunations in a sidereal year.")
        return text;
    }, name, primary_name, primary_year, primary_day, period);
    fields.appendChild(lunar_month_length);

    linked_pair(semimajor_axis, period,
        t => Math.pow(t*t/(4*PI_SQ) * total_primary_property(caller, 'mass') * GRAVITATIONAL_CONSTANT, 1/3),
        a => 2 * Math.PI * Math.sqrt(a*a*a/(GRAVITATIONAL_CONSTANT * total_primary_property(caller, 'mass'))),
        { 'watch': caller.parentNode.parentNode.querySelectorAll('input[name=mass]') });

    linked_triple(semimajor_axis, periapsis, apoapsis,
        (p,a) => (p+a) / 2.0,
        (sma,a) => 2.0 * sma - a,
        (sma,p) => 2.0 * sma - p);
    
    linked_triple(semimajor_axis, periapsis, eccentricity,
        (p,e) => p / (1-e),
        (a,e) => a * (1-e),
        (a,p) => 1 - p/a);

    var orbital_properties = document.createElement('div');
    orbital_properties.classList.add('input-row');
    orbital_properties.appendChild(make_row_label('Orbital properties'));
    orbital_properties.append(fields);
    el.appendChild(orbital_properties);

    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);

    compute_angular_sizes();
}

function live_text(node, compute, ...sources) {
    node.classList.add('hidden');
    sources = sources.map(x => x.getElementsByTagName('input')[0]);
    function f() {
        var values = sources.map(x => {
            if (x.dataset.type === 'number') {
                var v = get_standard_value(x);
                return is_number(v) ? v : undefined;
            } else return x.value || undefined;
        });
        var text = compute(...values);
        if (typeof text === 'string' && text.length > 0) {
            node.classList.remove('hidden');
            node.innerText = text;
        } else
            node.classList.add('hidden');
    }
    for (var source of sources) {
        source.addEventListener('input', f);
        var unit = source.nextElementSibling;
        if (unit != null && unit.classList.contains('units'))
            unit.addEventListener('click', f);
    }
}

function computed_value(node, compute, ...sources) {
    var input = node.getElementsByTagName('input')[0];
    input.disabled = true;

    sources = sources.map(x => x.getElementsByTagName('input')[0]);
    function f() {
        var values = sources.map(x => {
            if (x.dataset.type == 'number') {
                var v = get_standard_value(x);
                return is_number(v) ? v : undefined;
            } else return x.value;
        });

        var value = compute(...values);
        if (value == undefined)
            input.value = '';
        else {
            if (input.dataset.type == 'number') {
                var unit = get_units(input);
                if (is_number(value)) {
                    var v = unit_converter(dimension(unit)[0], unit)(value);
                    input.value = format_sf(v, parseFloat(input.dataset.sf));
                }
            } else
                input.value = value;    
        }
        
        var e = new Event('input');
        input.dispatchEvent(e);
    }

    var unit = input.nextElementSibling;
    if (unit != null && unit.classList.contains('units'))
        unit.addEventListener('click', f);

    for (var source of sources) {
        source.addEventListener('input', f);
        var unit = source.nextElementSibling;
        if (unit != null && unit.classList.contains('units'))
            unit.addEventListener('click', f);
    }

}

var sync_lock = 0;

function linked_pair(a, b, f_a, f_b, params) {
    var id = sync_lock;
    sync_lock += 1;

    var a = {
        'input': a.getElementsByTagName('input')[0],
        'units': a.getElementsByClassName('units')[0],
    };
    
    var b = {
        'input': b.getElementsByTagName('input')[0],
        'units': b.getElementsByClassName('units')[0],
    };

    function f(event) {
        if (event.source_id != undefined && event.source_id.includes(id)) return;

        var has_data = x => x.input.value.length > 0 && x.input.dataset.locked_by != id;
        var filled = x => x.input.value.length != 0 && !x.input.disabled;

        a.value = parse_float(a.input.value);
        a.unit = a.units !== undefined ? a.units.innerText : 'dimensionless';
        b.value = parse_float(b.input.value);
        b.unit = b.units !== undefined ? b.units.innerText : 'dimensionless';

        var e = new Event('input');
        e.source_id = event.source_id || [];
        e.source_id.push(id);

        if (has_data(a) && !filled(b)) {
            var value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value)
            ));
            if (value != undefined && isFinite(value)) {
                b.input.value = format_sf(value, parseFloat(b.input.dataset.sf));
                b.input.disabled = true;
                b.input.dataset.locked_by = id;
                b.input.dispatchEvent(e);
            }
        } else if (has_data(b) && !filled(a)) {
            var value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
            ));
            if (value != undefined && isFinite(value)) {
                a.input.disabled = true;
                a.input.dataset.locked_by = id;
                a.input.value = format_sf(value, parseFloat(a.input.dataset.sf));
                a.input.dispatchEvent(e);
            }
        } else {
            if (a.input.dataset.locked_by == id) {
                a.input.disabled = false;
                delete a.input.dataset.locked_by;
                a.input.value = '';
                a.input.dispatchEvent(e);
            }
            if (b.input.dataset.locked_by == id) {
                b.input.disabled = false;
                delete b.input.dataset.locked_by;
                b.input.value = '';
                b.input.dispatchEvent(e);
            }
        }
    }

    a.input.addEventListener('input', f);
    if (a.units !== undefined)
        a.units.addEventListener('click', f);
    b.input.addEventListener('input', f);
    if (b.units !== undefined)
        b.units.addEventListener('click', f);

    if (params !== undefined) {
        if ('watch' in params) {
            params['watch'].forEach(input => {
                input.addEventListener('input', f);
                var units = input.nextElementSibling;
                if (units.classList.contains('units'))
                    units.addEventListener('click', f);
            });
        }
    }
    
    return f;
}

function linked_triple(a, b, c, f_a, f_b, f_c, params) {
    var id = sync_lock;
    sync_lock += 1;

    var a = {
        'input': a.getElementsByTagName('input')[0],
        'units': a.getElementsByClassName('units')[0],
    };
    
    var b = {
        'input': b.getElementsByTagName('input')[0],
        'units': b.getElementsByClassName('units')[0],
    };

    var c = {
        'input': c.getElementsByTagName('input')[0],
        'units': c.getElementsByClassName('units')[0],
    };

    function f(event) {
        if (event.source_id != undefined && event.source_id.includes(id)) return;

        var has_data = x => x.input.value.length > 0 && x.input.dataset.locked_by != id;
        var filled = x => x.input.value.length != 0 && !x.input.disabled;
        
        a.value = parse_float(a.input.value);
        a.unit = a.units !== undefined ? a.units.innerText : 'dimensionless';
        b.value = parse_float(b.input.value);
        b.unit = b.units !== undefined ? b.units.innerText : 'dimensionless';
        c.value = parse_float(c.input.value);
        c.unit = c.units !== undefined ? c.units.innerText : 'dimensionless';

        var e = new Event('input');
        e.source_id = event.source_id || [];
        e.source_id.push(id);

        if (has_data(a) && has_data(b) && !filled(c)) {
            var value = unit_converter(dimension(c.unit)[0], c.unit)(f_c(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(b.unit, dimension(b.unit)[0])(b.value)
            ));
            if (value != undefined && isFinite(value)) {
                c.input.value = format_sf(value, parseFloat(c.input.dataset.sf));
                c.input.disabled = true;
                c.input.dataset.locked_by = id;
                c.input.dispatchEvent(e);
            }
        } else if (has_data(b) && has_data(c) && !filled(a)) {
            var value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            if (value != undefined && isFinite(value)) {
                a.input.value = format_sf(value, parseFloat(a.input.dataset.sf));
                a.input.disabled = true;
                a.input.dataset.locked_by = id;
                a.input.dispatchEvent(e);
            }
        } else if (has_data(a) && has_data(c) && !filled(b)) {
            var value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            if (value != undefined && isFinite(value)) {
                b.input.value = format_sf(value, parseFloat(b.input.dataset.sf));
                b.input.disabled = true;
                b.input.dataset.locked_by = id;
                b.input.dispatchEvent(e);
            }
        } else {
            if (a.input.dataset.locked_by == id) {
                a.input.disabled = false;
                delete a.input.dataset.locked_by;
                a.input.value = '';
                a.input.dispatchEvent(e);
            }
            if (b.input.dataset.locked_by == id) {
                b.input.disabled = false;
                delete b.input.dataset.locked_by;
                b.input.value = '';
                b.input.dispatchEvent(e);
            }
            if (c.input.dataset.locked_by == id) {
                c.input.disabled = false;
                delete c.input.dataset.locked_by;
                c.input.value = '';
                c.input.dispatchEvent(e);
            }
        }

        a.input.oninput();
        b.input.oninput();
        c.input.oninput();
    }

    a.input.addEventListener('input', f);
    if (a.units !== undefined)
        a.units.addEventListener('click', f);
    b.input.addEventListener('input', f);
    if (b.units !== undefined)
        b.units.addEventListener('click', f);
    c.input.addEventListener('input', f);
    if (c.units !== undefined)
        c.units.addEventListener('click', f);
    
    if (params !== undefined) {
        if ('watch' in params) {
            params['watch'].forEach(input => {
                input.addEventListener('input', f);
                var units = input.nextElementSibling;
                if (units.classList.contains('units'))
                    units.addEventListener('click', f);
            });
        }
    }
    
    return f;
}

var angular_sizes_warning;

function compute_angular_sizes() {
    // var bodies = document.getElementsByClassName('body-entry');
    // if (bodies.length >= 2)
    //     angular_sizes_warning.classList.add('hidden');
    // else {
    //     angular_sizes_warning.classList.remove('hidden');
    //     return;
    // }
}

window.addEventListener('DOMContentLoaded', () => {
    ruler = document.getElementById('ruler');
    num_primaries_warning = document.getElementById('at-least-one-primary-warning');
    angular_sizes_warning = document.getElementById('at-least-two-bodies-warning');
});
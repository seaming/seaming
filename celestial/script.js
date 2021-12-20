var ruler;

const VOLUME_CONST = 4.0 / 3.0 * Math.PI;
const PI_SQ = Math.PI * Math.PI;
const GRAVITATIONAL_CONSTANT = 6.67430e-11;
const STEFAN_BOLTZMANN_CONSTANT = 5.670374419e-8;

const MASS = ['kg', 'M🜨', 'M☉'];
const LENGTH = ['m', 'km', 'R🜨', 'R☉', 'AU'];
const DURATION = ['s', 'hour', 'day', 'year'];
const TEMPERATURE = ['K', '°C', '°F'];
const LUMINOSITY = ['W', 'L⊙'];
const DENSITY = ['kg/m³', 'g/cm³'];
const FREQUENCY = ['Hz', 'per hour', 'per day', 'per year'];
const ACCELERATION = ['m/s²', 'g'];
const ANGLE = ['degrees', 'radians'];
const DIMENSIONLESS = [];

const SYMBOL_TABLE = {
    'kg': 1.0,
    'M🜨': 5.97237e24, // kg
    'M☉': 1.98847e30, // kg
    'm': 1.0,
    'km': 1000.0,
    'R🜨': 6371000.0, // m
    'R☉': 696340000.0, // m
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
    'L⊙': 3.828e26, // W
}

function round(x,n) {
    return Math.round((x + Number.EPSILON) * Math.pow(10,n)) / Math.pow(10,n);
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
        MASS, LENGTH, DURATION, TEMPERATURE, LUMINOSITY,
        DENSITY, FREQUENCY, ACCELERATION, ANGLE, DIMENSIONLESS
    ].find(x => x.includes(unit));
}

function measure_text_length(text) {
    ruler.innerText = text;
    return ruler.offsetWidth;
}

function div_wrap(x) {
    var wrapper = document.createElement('div');
    wrapper.appendChild(x);
    return wrapper;
}

function delete_button(is_primary) {
    var button = document.createElement('span');
    button.classList.add('delete');
    button.innerText = '×';

    button.onclick = () => {
        button.parentNode.remove();
        if (is_primary === true) {
            num_primaries -= 1;
            check_primaries();
        }
    }

    return button;
}

function make_row_label(label) {
    var el = document.createElement('div');
    el.classList.add('input-row-label');
    el.innerText = label;
    return el;
}

function make_input_pair(name, units, prepend_name) {
    var container = document.createElement('div');
    container.classList.add('input-pair');

    var input = document.createElement('input');
    input.type = prepend_name ? 'number' : 'text';
    input.name = name.toLowerCase().split('(')[0].trim().replace(' ','-');
    if (prepend_name !== true)
        input.placeholder = name;

    input.oninput = () => {
        if (input.value.length > 0)
            input.style.width = measure_text_length(input.value) + "px";
        else if (!prepend_name)
            input.style.width = measure_text_length(name) + "px";
        else
            input.style.width = "3em";
    }
    input.oninput();

    if (prepend_name === true)
        container.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('input-pair-label')
            el.innerText = name + ':';
            return el;
        })());

    container.appendChild(input);

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
    el.classList.add('body-entry');

    el.appendChild(make_input_pair('Name'));

    var mass = make_input_pair('Mass', MASS, true);
    var radius = make_input_pair('Radius', LENGTH, true);
    var temperature = make_input_pair('Surface temperature', TEMPERATURE, true);
    var luminosity = make_input_pair('Luminosity', LUMINOSITY, true);
    
    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(mass);
    fields.appendChild(radius);
    fields.appendChild(temperature);
    fields.appendChild(luminosity);

    linked_pair(mass, luminosity,
        L => {
            var Lsun = unit_converter('W', 'L⊙')(L);
            return unit_converter('M☉', 'kg')(Math.pow(Lsun, 1/3.5));
        },
        M => {
            var Msun = unit_converter('kg', 'M☉')(M);
            return unit_converter('L⊙', 'W')(Math.pow(Msun, 3.5));
        });

    linked_triple(radius, temperature, luminosity,
        (T,L) => Math.sqrt(L / (4 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * T*T*T*T)),
        (R,L) => Math.pow(L / (4 * Math.PI * STEFAN_BOLTZMANN_CONSTANT * R*R), 1/4),
        (R,T) => 4 * Math.PI * R*R * STEFAN_BOLTZMANN_CONSTANT * T*T*T*T);
    
    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    num_primaries += 1;
    check_primaries();
    el.appendChild(delete_button(true));

    caller.parentNode.insertBefore(el, caller);

    for (var [field, f] of primary_watchers) {
        for (var input of document.querySelectorAll('#primaries .body-entry input[name='+field+']')) {
            input.addEventListener('input', f);
            input.nextSibling.addEventListener('click', f);
        }
    }
}

function total_primary_property(caller, property) {
    var x;
    if (caller.parentNode.parentNode.tagName == 'BODY')
        x = document.getElementById('primaries').querySelectorAll('input[name='+property+']');
    else
        x = caller.parentNode.parentNode.querySelectorAll('input[name='+property+']');

    x = Array.from(x).map(a => {
        if (a.type == 'number') {
            var unit = a.nextSibling.classList.contains('units') ? a.nextSibling.innerText : 'dimensionless';
            return unit_converter(unit, dimension(unit)[0])(parseFloat(a.value));
        } else return a.value;
    });
    return x.reduce((partial, v) => partial + v, 0) || 0;
}

function calc_primary_property(caller, f, ...properties) {
    var x;
    if (caller.parentNode.parentNode.tagName == 'BODY')
        x = document.getElementById('primaries').querySelectorAll('input');
    else
        x = caller.parentNode.parentNode.querySelectorAll('input');
    
    var values = properties.map(p => Array.from(x).filter(a => a.name == p).map(a => {
        if (a.type == 'number') {
            var unit = a.nextSibling.classList.contains('units') ? a.nextSibling.innerText : 'dimensionless';
            return unit_converter(unit, dimension(unit)[0])(parseFloat(a.value));
        } else return a.value;
    }));
    var rows = values[0].map((_,c) => values.map(p => p[c]));
    return rows.map(x => f(...x));
}

function add_secondary(caller) {
    if (num_primaries < 1) return;

    var el = document.createElement('div');
    el.classList.add('body-entry');

    var name = make_input_pair('Name');
    el.appendChild(name);

    var mass = make_input_pair('Mass', MASS, true);
    var radius = make_input_pair('Radius', LENGTH, true);
    var density = make_input_pair('Density', DENSITY, true);
    var surface_gravity = make_input_pair('Surface gravity', ACCELERATION, true);

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

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var rotation_period = make_input_pair('Rotation period', DURATION, true);
    var flattening_coefficient = make_input_pair('Flattening coefficient', DIMENSIONLESS, true);
    var axial_tilt = make_input_pair('Axial tilt', ANGLE, true);

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

    var semimajor_axis = make_input_pair('Semi-major axis', LENGTH, true);
    var periapsis = make_input_pair('Periastron', LENGTH, true);
    var apoapsis = make_input_pair('Apoastron', LENGTH, true);
    var eccentricity = make_input_pair('Eccentricity', DIMENSIONLESS, true);
    var period = make_input_pair('Orbital period', DURATION, true);
    var inclination = make_input_pair('Orbital inclination', ANGLE, true);

    var fields = document.createElement('div');
    fields.classList.add('input-fields');
    fields.appendChild(semimajor_axis);
    fields.appendChild(periapsis);
    fields.appendChild(apoapsis);
    fields.appendChild(eccentricity);
    fields.appendChild(period);
    fields.appendChild(inclination);

    var year_length = document.createElement('div');
    year_length.classList.add('description');
    live_text(year_length, (n,year,day) => {
        return (
            "A sidereal year " + (n!==''?"on "+n:"") + " is " + round(year/day, 4) + " local sidereal days, or"
            + round((year - day)/day, 4) + " local solar days long.");
    }, name, period, rotation_period);
    fields.appendChild(year_length);

    var day_length = document.createElement('div');
    day_length.classList.add('description');
    live_text(day_length, (n,year,day) => {
        var u = unit_converter('s', 'hour');
        var solar_day = year * day / (year - day);
        return (
            "A sidereal day " + (n!==''?"on "+n:"") + " is " + round(u(day), 4) + " hours long. "
            + "A solar day is " + round(u(solar_day), 4) + " hours long.");
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

    var albedo = make_input_pair('Albedo', DIMENSIONLESS, true);
    var equilibrium_temperature = make_input_pair('Equilibrium temperature', TEMPERATURE, true);

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
        x.innerHTML = '<div class="body-list"><div class="add-another" onclick="add_tertiary(this)">Add moon</div></div>';
        el.appendChild(x.firstChild);
    }

    el.appendChild(delete_button());

    caller.parentNode.insertBefore(el, caller);
}

function add_tertiary(caller) {
    var el = document.createElement('div');
    el.classList.add('body-entry');

    var name = make_input_pair('Name');
    el.appendChild(name);

    var mass = make_input_pair('Mass', MASS, true);
    var radius = make_input_pair('Radius', LENGTH, true);
    var density = make_input_pair('Density', DENSITY, true);
    var surface_gravity = make_input_pair('Surface gravity', ACCELERATION, true);

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

    var physical_properties = document.createElement('div');
    physical_properties.classList.add('input-row');
    physical_properties.appendChild(make_row_label('Physical properties'));
    physical_properties.append(fields);
    el.appendChild(physical_properties);

    var semimajor_axis = make_input_pair('Semi-major axis', LENGTH, true);
    var periapsis = make_input_pair('Periapsis', LENGTH, true);
    var apoapsis = make_input_pair('Apoapsis', LENGTH, true);
    var eccentricity = make_input_pair('Eccentricity', DIMENSIONLESS, true);
    var period = make_input_pair('Orbital period', DURATION, true);
    var inclination = make_input_pair('Orbital inclination', ANGLE, true);

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

    var primary_year = caller.parentNode.parentNode.querySelector('input[name=orbital-period]');
    primary_year = primary_year.parentNode;

    var primary_day = caller.parentNode.parentNode.querySelector('input[name=rotation-period]');
    primary_day = primary_day.parentNode;

    var sidereal_month_length = document.createElement('div');
    sidereal_month_length.classList.add('description');
    live_text(sidereal_month_length, (n,p_n,p_year,p_day,T) => {
        var solar_day = p_year * p_day / (p_year - p_day);
        return (
            "A sidereal month " + (n!==''?"of "+n:"") + " is " + round(T/p_day,4) + " local "
            + (p_n!==''?p_n+' ':'') + " sidereal days, or " + round(T/solar_day,4) + " local "
            + (p_n!==''?p_n+' ':'') + " solar days long. There are " + round(p_year/T,4)
            + " sidereal months in a sidereal year." );
    }, name, primary_name, primary_year, primary_day, period);
    fields.appendChild(sidereal_month_length);

    var lunar_month_length = document.createElement('div');
    lunar_month_length.classList.add('description');
    live_text(lunar_month_length, (n,p_n,p_year,p_day,T) => {
        var solar_day = p_year * p_day / (p_year - p_day);
        var lunar_month = p_year * T / (p_year - T);
        return (
            "A lunation (lunar month) " + (n!==''?"of "+n:"") + " is " + round(lunar_month/p_day, 4) + " local "
            + (p_n!==''?p_n+' ':'') + " sidereal days long, or " + round(lunar_month/solar_day, 4) + " local "
            + (p_n!==''?p_n+' ':'') + " solar days. There are " + round(p_year/lunar_month,4)
            + " lunations in a sidereal year." );
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
}

function live_text(node, compute, ...sources) {
    node.classList.add('hidden');
    sources = sources.map(x => x.getElementsByTagName('input')[0]);
    function f() {
        var values = sources.map(x => {
            if (x.type === 'number') {
                var unit = x.nextSibling.classList.contains('units') ? x.nextSibling.innerText : 'dimensionless';
                return unit_converter(unit, dimension(unit)[0])(parseFloat(x.value));
            } else return x.value;
        });
        if (values.some(x => Number.isNaN(x) || x == undefined))
            node.classList.add('hidden');
        else {
            node.classList.remove('hidden');
            node.innerText = compute(...values);
        }
    }
    for (var source of sources) {
        source.addEventListener('input', f);
        var unit = source.nextSibling;
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
        if (event.source_id == id) return;

        a.value = parseFloat(a.input.value);
        a.unit = a.units !== undefined ? a.units.innerText : 'dimensionless';
        b.value = parseFloat(b.input.value);
        b.unit = b.units !== undefined ? b.units.innerText : 'dimensionless';

        var e = new Event('input');
        e.source_id = id;

        if (a.input.value.length > 0 && a.input.dataset.locked_by != id) {
            b.input.disabled = true;
            b.input.dataset.locked_by = id;
            b.input.value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value)
            ));
            b.input.dispatchEvent(e);
        } else if (b.input.value.length > 0 && b.input.dataset.locked_by != id) {
            a.input.disabled = true;
            a.input.dataset.locked_by = id;
            a.input.value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
            ));
            a.input.dispatchEvent(e);
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
    a.units.addEventListener('click', f);
    b.input.addEventListener('input', f);
    b.units.addEventListener('click', f);

    if (params !== undefined) {
        if ('watch' in params) {
            params['watch'].forEach(input => {
                input.addEventListener('input', f);
                var units = input.nextSibling;
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
        if (event.source_id == id) return;

        var a_filled = a.input.value.length > 0 && a.input.dataset.locked_by != id;
        var b_filled = b.input.value.length > 0 && b.input.dataset.locked_by != id;
        var c_filled = c.input.value.length > 0 && c.input.dataset.locked_by != id;
        
        a.value = parseFloat(a.input.value);
        a.unit = a.units !== undefined ? a.units.innerText : 'dimensionless';
        b.value = parseFloat(b.input.value);
        b.unit = b.units !== undefined ? b.units.innerText : 'dimensionless';
        c.value = parseFloat(c.input.value);
        c.unit = c.units !== undefined ? c.units.innerText : 'dimensionless';

        var e = new Event('input');
        e.source_id = id;

        if (a_filled && b_filled) {
            c.input.disabled = true;
            c.input.dataset.locked_by = id;
            c.input.value = unit_converter(dimension(c.unit)[0], c.unit)(f_c(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(b.unit, dimension(b.unit)[0])(b.value)
            ));
            c.input.dispatchEvent(e);
        } else if (b_filled && c_filled) {
            a.input.disabled = true;
            a.input.dataset.locked_by = id;
            a.input.value = unit_converter(dimension(a.unit)[0], a.unit)(f_a(
                unit_converter(b.unit, dimension(b.unit)[0])(b.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            a.input.dispatchEvent(e);
        } else if (a_filled && c_filled) {
            b.input.disabled = true;
            b.input.dataset.locked_by = id;
            b.input.value = unit_converter(dimension(b.unit)[0], b.unit)(f_b(
                unit_converter(a.unit, dimension(a.unit)[0])(a.value),
                unit_converter(c.unit, dimension(c.unit)[0])(c.value)
            ));
            b.input.dispatchEvent(e);
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
                var units = input.nextSibling;
                console.log(input, units);
                if (units.classList.contains('units'))
                    units.addEventListener('click', f);
            });
        }
    }
    
    return f;
}

window.onload = () => {
    ruler = document.getElementById('ruler');
    num_primaries_warning = document.getElementById('at-least-one-primary-warning');
};
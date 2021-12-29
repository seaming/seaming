var GAS_SPECTRA = {
    'N2': NITROGEN_SPECTRUM,
    'NO2': NITROGEN_DIOXIDE_SPECTRUM,
    'NO': NITRIC_OXIDE_SPECTRUM,
    'N2O': NITROUS_OXIDE_SPECTRUM,
    'CO2': CARBON_DIOXIDE_SPECTRUM,
    'CO': CARBON_MONOXIDE_SPECTRUM,
    'CH4': METHANE_SPECTRUM,
    'H2O': WATER_VAPOR_SPECTRUM,
    'O2': OXYGEN_SPECTRUM,
    'O3': OZONE_SPECTRUM,
};

// The spectroscopic data used are only for the most common isotopologue of each
// gas species. The line intensities are weighted by isotopologue abundance, so
// we use these values to undo that weighting.
const ISOTOPOLOGUE_ABUNDANCES = {
    'N2': 0.992687,
    'NO2': 0.991616,
    'NO': 0.993974,
    'N2O': 0.990333,
    'CO2': 0.984204,
    'CO': 0.986544,
    'CH4': 0.988274,
    'H2O': 0.997317,
    'O2': 0.992901,
    'O3': 0.992901,
};

[...Object.entries(GAS_SPECTRA)].forEach(([k,v]) => {
    if (v.length == 0) return;
    keys = ['nu', 'sw', 'elower', 'delta_air', 'delta_self', 'gamma_air', 'gamma_self', 'n_air', 'n_self'];
    GAS_SPECTRA[k] = v.map(l => Object.fromEntries(l.map((x,i) => [keys[i], x])));
    GAS_SPECTRA[k].forEach(x => x.sw /= ISOTOPOLOGUE_ABUNDANCES[k]);
});

var atmosphere_properties;

function add_gas_species(e) {
    var self = e.target;

    var delete_button = document.createElement('div');
    delete_button.classList.add('delete');
    delete_button.innerText = '×';

    delete_button.onclick = () => {
        var x = delete_button.nextElementSibling;
        while (!x.classList.contains('delete') && x.tagName != 'BUTTON') {
            var tmp = x.nextElementSibling;
            x.remove();
            x = tmp;
        }
        delete_button.remove();
        calculate_total_pressure(undefined);
        update_spectra();
    }

    self.parentNode.insertBefore(delete_button, self);

    var species = document.createElement('input')
    species.setAttribute('list', 'gas-species');
    self.parentNode.insertBefore(species, self);

    var partial_pressure = make_input_pair('Partial pressure',
        { 'prepend-name': false, 'placeholder': false, units: PRESSURE, sf: 6 });
    self.parentNode.insertBefore(partial_pressure, self);

    var percent = make_input_pair('Percent',
        { 'prepend-name': false, 'placeholder': false, units: DIMENSIONLESS, sf: 6 });
    self.parentNode.insertBefore(percent, self);

    var total_pressure = self.parentNode.querySelector('input[name=total-pressure]');
    
    [partial_pressure, percent].forEach(x => {
        var input = x.querySelector('input');
        input.addEventListener('input', calculate_total_pressure);
        input.addEventListener('input', update_spectra);
        var units = input.nextElementSibling;
        if (units != null && units.classList.contains('units')) {
            units.addEventListener('click', calculate_total_pressure);
            units.addEventListener('click', update_spectra);
        }
    });

    linked_pair(partial_pressure, percent,
        percent => percent / 100 * (get_standard_value(total_pressure) || 0),
        pressure => 100 * pressure / get_standard_value(total_pressure),
        { 'watch': [total_pressure] });
}

var greater_than_100_percent_warning;

function calculate_total_pressure(event) {
    if (event != undefined && event.source_id != undefined && event.source_id.includes('loop')) return;

    var total_pressure = document.querySelector('#atmosphere input[name=total-pressure]');
    var unit = get_units(total_pressure);
    var sf = parseFloat(total_pressure.dataset.sf);

    var rows = [...atmosphere_properties.querySelectorAll('.delete')].map(x => ({
        'pressure': x.nextElementSibling.nextElementSibling.querySelector('input'),
        'percent': x.nextElementSibling.nextElementSibling.nextElementSibling.querySelector('input')
    }));
    
    var known_pressure = rows.map(x => x.pressure.disabled ? 0 : get_standard_value(x.pressure));
    known_pressure = known_pressure.reduce((acc,x) => acc+x, 0) || 0;

    var total_percentage = rows.map(x => x.percent.disabled ? 0 : get_standard_value(x.percent));
    total_percentage = total_percentage.reduce((acc,x) => acc+x/100, 0) || 0;

    var calculated_percentage = rows.map(x => get_standard_value(x.percent));
    calculated_percentage = calculated_percentage.reduce((acc,x) => acc+x/100, 0) || 0;

    if (calculated_percentage > 1) {
        greater_than_100_percent_warning.classList.remove('hidden');
    } else
        greater_than_100_percent_warning.classList.add('hidden');

    var percent = document.querySelector('#atmosphere input[name=atmosphere-percentage]');
    percent.value = format_sf(calculated_percentage*100, sf);

    if (total_pressure.value != '' && !total_pressure.disabled)
        return;
    else if (known_pressure == 0) {
        total_pressure.disabled = false;
        total_pressure.value = '';
    } else {
        total_pressure.disabled = true;
        total_pressure.value = format_sf(
            unit_converter(PRESSURE[0], unit)(known_pressure / (1 - total_percentage)),
            sf);
    }
    
    var e = new Event('input');
    e.source_id = ['loop'];
    total_pressure.dispatchEvent(e);
}

window.addEventListener('DOMContentLoaded', () => {
    atmosphere_properties = document.getElementById('atmosphere');
    atmosphere_properties.querySelector('.add-another').addEventListener('click', add_gas_species);

    greater_than_100_percent_warning = document.getElementById('greater-than-100-percent-warning');

    var x = atmosphere_properties.querySelector('.input-pair');
    var total_pressure = make_input_pair('Total pressure',
        { 'prepend-name': false, 'placeholder': false, units: PRESSURE, sf: 6 });

    total_pressure.querySelector('.units').addEventListener('click', calculate_total_pressure);

    x.replaceWith(total_pressure);
});

const GAS_CONSTANT = 8.31446261815324;

function get_atmosphere_data(temperature) {
    var gas_properties = (x) => {return {
        'Diatomic nitrogen (N₂)': ['N2', 28.0134],
        'Diatomic oxygen (O₂)': ['O2', 31.9988],
        'Ozone (O₃)': ['O3', 47.9982],
        'Water vapor (H₂O)': ['H2O', 18.01534],
        'Carbon dioxide (CO₂)': ['CO2', 44.0098],
        'Carbon monoxide (CO)': ['CO', 28.0104],
        'Methane (CH₄)': ['CH4', 16.04288],
        'Nitrous oxide (N₂O)': ['N2O', 44.0128],
        'Nitric oxide (NO)': ['NO', 30.0061],
        'Nitrogen dioxide (NO₂)': ['NO2', 46.0055]
    }[x]};

    var rows = [...atmosphere_properties.querySelectorAll('.delete')].map(x => {
        var gas = gas_properties(x.nextElementSibling.value);
        var pressure = get_standard_value(x.nextElementSibling.nextElementSibling.querySelector('input'));
        if (gas == undefined || !isFinite(pressure)) return;
        var [name, molar_mass] = gas;
        molar_mass *= 0.001; // convert to kg/mol
        return {
            'gas': name,
            'pressure': pressure,
            'molar_mass': molar_mass,
            'density': pressure * molar_mass / (GAS_CONSTANT * temperature),
        };
    }).filter(x => x != null);

    var total_pressure = get_standard_value(
        document.querySelector('#atmosphere input[name=total-pressure]'));
    rows.forEach(x => x.fraction = x.pressure / total_pressure);

    return rows;
}
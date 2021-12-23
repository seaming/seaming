var HR_diagram;

function set_diagram(obj) {
    var HR_object = document.querySelector('#HR-diagram');
    HR_diagram = HR_object.contentDocument.querySelector('svg');
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

        var x = 30.5 + Math.pow(10, (20000 - temperature) / 7700 ); // magic equation
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

        if (typeof name == 'string' || name.length > 0) {
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
    });
}
function range(n, m) {
    return [...Array(Math.abs(n-m)+1).keys()].map(x => x * Math.sign(m-n) + n);
}

function mouse_pos(e) {
    var CTM = draw.node.getScreenCTM();
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
}
// Values from https://sites.uni.edu/morgans/astro/course/Notes/section2/spectraltemps.html
// Colors from http://www.vendian.org/mncharity/dir3/starcolor/ Some values are intermediates
//   calculated from values given there.
const STELLAR_CLASSIFICATION_DATA = [
    {classification: 'A0I', T: 9400, L: 50600, color: '#b6c9ff'},
    {classification: 'A0V', T: 9600, L: 24, color: '#b6c9ff'},
    {classification: 'A1I', T: 9100, L: 44000, color: '#baccff'},
    {classification: 'A1V', T: 9330, L: 20, color: '#baccff'},
    {classification: 'A2I', T: 8900, L: 40000, color: '#bdcfff'},
    {classification: 'A2V', T: 9040, L: 17, color: '#bdcfff'},
    {classification: 'A3V', T: 8750, L: 14, color: '#c0d1ff'},
    {classification: 'A4V', T: 8480, L: 12, color: '#c5d5ff'},
    {classification: 'A5I', T: 8300, L: 36000, color: '#cad8ff'},
    {classification: 'A5V', T: 8310, L: 11, color: '#cad8ff'},
    // A6 #cfdbff
    {classification: 'A7V', T: 7920, L: 8.8, color: '#d4deff'},
    // A8 #dae2ff, A9 #dfe5ff
    {classification: 'B0I', T: 21000, L: 320000, color: '#a0b7ff'},
    {classification: 'B0V', T: 29200, L: 24000, color: '#a0b7ff'},
    {classification: 'B1I', T: 16000, L: 280000, color: '#a2b9ff'},
    {classification: 'B1V', T: 23000, L: 5550, color: '#a2b9ff'},
    {classification: 'B2I', T: 14000, L: 220000, color: '#a5bbff'},
    {classification: 'B2V', T: 21000, L: 3190, color: '#a5bbff'},
    {classification: 'B3I', T: 12800, L: 180000, color: '#a7bcff'},
    {classification: 'B3V', T: 17600, L: 1060, color: '#a7bcff'},
    // B4 #a9beff
    {classification: 'B5I', T: 11500, L: 140000, color: '#aabfff'},
    {classification: 'B5V', T: 15200, L: 380, color: '#aabfff'},
    {classification: 'B6I', T: 11000, L: 98000, color: '#acc0ff'},
    {classification: 'B6V', T: 14300, L: 240, color: '#acc0ff'},
    {classification: 'B7I', T: 10500, L: 82000, color: '#adc2ff'},
    {classification: 'B7V', T: 13500, L: 140, color: '#adc2ff'},
    {classification: 'B8I', T: 10000, L: 73000, color: '#afc3ff'},
    {classification: 'B8V', T: 12300, L: 73, color: '#afc3ff'},
    {classification: 'B9I', T: 9700, L: 61000, color: '#b3c6ff'},
    {classification: 'B9V', T: 11400, L: 42, color: '#b3c6ff'},
    {classification: 'F0I', T: 7500, L: 20000, color: '#e4e8ff'},
    {classification: 'F0V', T: 7350, L: 5.1, color: '#e4e8ff'},
    // F1 #e9ebff
    {classification: 'F2I', T: 7200, L: 18000, color: '#edeeff'},
    {classification: 'F2V', T: 7050, L: 3.8, color: '#edeeff'},
    {classification: 'F3V', T: 6850, L: 3.2, color: '#f2f1ff'},
    // F4 #f6f5ff
    {classification: 'F5I', T: 6800, L: 16000, color: '#fbf8ff'},
    {classification: 'F5V', T: 6700, L: 2.7, color: '#fbf8ff'},
    {classification: 'F6V', T: 6550, L: 2, color: '#fcf8fd'},
    {classification: 'F7V', T: 6400, L: 1.5, color: '#fef9fb'},
    {classification: 'F8I', T: 6150, L: 12000, color: '#fff9f9'},
    {classification: 'F8V', T: 6300, L: 1.4, color: '#fff9f9'},
    // F9 #fff8f6
    {classification: 'G0I', T: 5800, L: 9600, color: '#fff7f3'},
    {classification: 'G0V', T: 6050, L: 1.2, color: '#fff7f3'},
    {classification: 'G1V', T: 5930, L: 1.1, color: '#fff6ef'},
    {classification: 'G2I', T: 5500, L: 9500, color: '#fff5ec'},
    {classification: 'G2V', T: 5800, L: 1, color: '#fff5ec'},
    // G3 #fff5eb, G4 #fff4e9
    {classification: 'G5I', T: 5100, L: 9800, color: '#fff4e8'},
    {classification: 'G5III', T: 5010, L: 127, color: '#fff4e8'},
    {classification: 'G5V', T: 5660, L: 0.73, color: '#fff4e8'},
    // G6 #fff3e5, G7 #fff2e2
    {classification: 'G8I', T: 5050, L: 11000, color: '#fff1df'},
    {classification: 'G8III', T: 4870, L: 113, color: '#fff1df'},
    {classification: 'G8V', T: 5440, L: 0.51, color: '#fff1df'},
    // G9 #ffeed8
    {classification: 'K0I', T: 4900, L: 12000, color: '#ffebd1'},
    {classification: 'K0III', T: 4720, L: 96, color: '#ffebd1'},
    {classification: 'K0V', T: 5240, L: 0.38, color: '#ffebd1'},
    {classification: 'K1I', T: 4700, L: 13500, color: '#ffe6c8'},
    {classification: 'K1III', T: 4580, L: 82, color: '#ffe6c8'},
    {classification: 'K1V', T: 5110, L: 0.32, color: '#ffe6c8'},
    {classification: 'K2I', T: 4500, L: 15200, color: '#ffe1c0'},
    {classification: 'K2III', T: 4460, L: 70, color: '#ffe1c0'},
    {classification: 'K2V', T: 4960, L: 0.29, color: '#ffe1c0'},
    {classification: 'K3I', T: 4300, L: 17000, color: '#ffdcb7'},
    {classification: 'K3III', T: 4210, L: 58, color: '#ffdcb7'},
    {classification: 'K3V', T: 4800, L: 0.24, color: '#ffdcb7'},
    {classification: 'K4I', T: 4100, L: 18300, color: '#ffd7ae'},
    {classification: 'K4III', T: 4010, L: 45, color: '#ffd7ae'},
    {classification: 'K4V', T: 4600, L: 0.18, color: '#ffd7ae'},
    {classification: 'K5I', T: 3750, L: 20000, color: '#ffd1a4'},
    {classification: 'K5III', T: 3780, L: 32, color: '#ffd1a4'},
    {classification: 'K5V', T: 4400, L: 0.15, color: '#ffd1a4'},
    // K6 #ffcc9a
    {classification: 'K7V', T: 4000, L: 0.11, color: '#ffc690'},
    // K8 #ffc48d, K9 #ffc389
    {classification: 'M0I', T: 3660, L: 50600, color: '#ffc186'},
    {classification: 'M0III', T: 3660, L: 15, color: '#ffc186'},
    {classification: 'M0V', T: 3750, L: 0.08, color: '#ffc186'},
    {classification: 'M1I', T: 3600, L: 52000, color: '#ffc082'},
    {classification: 'M1III', T: 3600, L: 13, color: '#ffc082'},
    {classification: 'M1V', T: 3700, L: 0.055, color: '#ffc082'},
    {classification: 'M2I', T: 3500, L: 53000, color: '#ffbe7f'},
    {classification: 'M2III', T: 3500, L: 11, color: '#ffbe7f'},
    {classification: 'M2V', T: 3600, L: 0.035, color: '#ffbe7f'},
    {classification: 'M3I', T: 3300, L: 54000, color: '#ffbd7d'},
    {classification: 'M3III', T: 3300, L: 9.5, color: '#ffbd7d'},
    {classification: 'M3V', T: 3500, L: 0.027, color: '#ffbd7d'},
    {classification: 'M4I', T: 3100, L: 56000, color: '#ffbb7b'},
    {classification: 'M4III', T: 3100, L: 7.4, color: '#ffbb7b'},
    {classification: 'M4V', T: 3400, L: 0.022, color: '#ffbb7b'},
    {classification: 'M5I', T: 2950, L: 58000, color: '#ffbb7b'},
    {classification: 'M5III', T: 2950, L: 5.1, color: '#ffbb7b'},
    {classification: 'M5V', T: 3200, L: 0.011, color: '#ffbb7b'},
    {classification: 'M6III', T: 2800, L: 3.3, color: '#ffbb7b'},
    {classification: 'M6V', T: 3100, L: 0.0051, color: '#ffbb7b'},
    {classification: 'M7V', T: 2900, L: 0.0032, color: '#ffbb7b'},
    {classification: 'M8V', T: 2700, L: 0.002, color: '#ffbb7b'},
    {classification: 'O5V', T: 54000, L: 200000, color: '#9db4ff'},
    {classification: 'O6V', T: 45000, L: 140000, color: '#9db4ff'},
    {classification: 'O7V', T: 43300, L: 120000, color: '#9db4ff'},
    {classification: 'O8V', T: 40600, L: 80000, color: '#9db4ff'},
    {classification: 'O9V', T: 37800, L: 55000, color: '#9db4ff'},
];

function stellar_classification(T,L) {
    // Note that this function assumes the incoming luminosity is in solar luminosities.
    return STELLAR_CLASSIFICATION_DATA.sort((a,b) => {
        var a_dist = Math.pow(a.T-T, 2) + Math.pow(a.L-L, 2);
        var b_dist = Math.pow(b.T-T, 2) + Math.pow(b.L-L, 2);
        return a_dist - b_dist;
    })[0];
}

function stellar_color(classification) {
    return STELLAR_CLASSIFICATION_DATA.find(x => x.classification == classification).color;
}
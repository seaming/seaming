var titles = document.querySelectorAll(".body-content > h2, .body-content > h3, .body-content > h4, .body-content > h5, .body-content > h6");
var navlinks = document.getElementById("nav-links");

for (var i = 0; i < titles.length; i++) {
    var titleTag = titles[i];

    var wrapper = document.createElement('div');
    wrapper.setAttribute("class", "section " + titleTag.tagName.toLowerCase());
    titles[i].parentNode.insertBefore(wrapper, titles[i]);
    wrapper.appendChild(titleTag);

    titleTag.id = replaceDiacritics(
        titleTag.textContent.replace(/&[a-z]+;/g, '').replace(/\s+/g, '_')
    ).replace(/\W/gi, '')
        .toLowerCase();

    var navlink = document.createElement("a");

    navlink.setAttribute("class", titleTag.tagName.toLowerCase());
    navlink.setAttribute("href", "#" + titleTag.id);

    navlink.innerHTML = titleTag.innerHTML.replace(/ and /g, ' & ');
    navlinks.appendChild(navlink.cloneNode(true));

    var hoverShow = document.createElement('span');
    hoverShow.setAttribute('class', 'title-hoverlink');
    hoverShow.innerHTML = '#';
    titleTag.insertBefore(hoverShow, titleTag.firstChild);

    var l = document.createElement("a");
    l.innerHTML = titleTag.innerHTML;

    l.setAttribute("href", "#" + titleTag.id);
    titleTag.innerHTML = '';
    titleTag.appendChild(l);
}

var translations = document.querySelectorAll(".body-content > translation, .body-content > transgroup");
var numbering = [];

for (var i = 0; i < translations.length; i++) {

    if (translations[i].tagName == "TRANSLATION") {

        var row = document.createElement('div');
        row.setAttribute('class', 'row-2 translation-block');

        var col = document.createElement('div');
        col.setAttribute('class', 'col translation-number');

        var lb = translations[i].getElementsByTagName("lb")[0];
        if (lb != undefined) {
            col.innerHTML = replaceDiacritics(lb.innerHTML).toLowerCase();
            lb.remove();
        }

        numbering.push(col);
        row.appendChild(col);

        var t = translations[i].parentNode.replaceChild(row, translations[i]);

        var col = document.createElement('div');
        col.setAttribute('class', 'col');

        while (t.childNodes.length > 0) {
            col.appendChild(t.childNodes[0]);
        }

        row.appendChild(col);

    } else {
        var group = document.createElement('div');
        numbering.push([]);

        var col = document.createElement('div');
        col.setAttribute('class', 'squished translation-number');
        numbering[numbering.length - 1].push(col);
        group.appendChild(col);

        var lb = Array.from(translations[i].childNodes).filter(n => n.tagName == "LB")[0];
        if (lb != undefined) {
            col.innerHTML = replaceDiacritics(lb.innerHTML).toLowerCase();
            lb.remove();
        }

        var children = Array.from(translations[i].childNodes).filter(n => n.tagName == "TRANSLATION");
        for (var j = 0; j < children.length; j++) {
            if (children[j].nodeType != 1) {
                continue;
            }

            var child = translations[i].removeChild(children[j]);

            var child_row = document.createElement('div');
            child_row.setAttribute('class', 'row-2 translation-block');

            var child_col = document.createElement('div');
            child_col.setAttribute('class', 'translation-number');

            var lb = child.getElementsByTagName("lb")[0];
            if (lb != undefined) {
                child_col.innerHTML = replaceDiacritics(lb.innerHTML).toLowerCase();
                lb.remove();
            }

            numbering[numbering.length - 1].push(child_col);
            child_row.appendChild(child_col);

            var new_child = document.createElement('div');

            while (child.childNodes.length > 0) {
                new_child.appendChild(child.childNodes[0]);
            }

            child_row.appendChild(new_child);

            var col = document.createElement('div');
            col.setAttribute('class', 'col');
            col.appendChild(child_row);

            group.appendChild(col);
        }

        if (translations[i].classList.contains('stack')) {
            group.setAttribute('class', 'transgroup translation-block row-2 stack');

            for (var j = 2; j < group.children.length; j++) {
                group.insertBefore(document.createElement('div'), group.children[j]);
                j++;
            }
        } else {
            group.setAttribute('class', 'transgroup translation-block row-' + (children.length + 1));
        }

        translations[i].parentNode.replaceChild(group, translations[i]);
    }
}

for (var i = 0; i < numbering.length; i++) {
    var refs = document.getElementsByTagName('ref');

    if (numbering[i].length == undefined) {

        for (var j = 0; j < refs.length; j++) {
            var matcht = replaceDiacritics(refs[j].innerHTML).toLowerCase();
            if (matcht == numbering[i].innerHTML) {
                var a = document.createElement('a');
                a.setAttribute('href', '#example-' + (i + 1));
                a.setAttribute('class', 'ref');
                a.innerHTML = "(" + (i + 1) + ")";

                refs[j].replaceWith(a);
            }
        }

        numbering[i].innerHTML = '(' + (i + 1) + ')';
        numbering[i].setAttribute('id', 'example-' + (i + 1));

    } else {
        for (var j = 0; j < numbering[i].length; j++) {

            for (var k = 0; k < refs.length; k++) {
                var matcht = replaceDiacritics(refs[k].innerHTML).toLowerCase();

                if (matcht == numbering[i][j].innerHTML) {
                    var a = document.createElement('a');

                    console.log(numbering[i][j]);

                    if (numbering[i][j].parentNode.classList.contains('transgroup')) {
                        a.setAttribute('href', '#example-' + (i + 1));
                        a.setAttribute('class', 'ref');
                        a.innerHTML = "(" + (i + 1) + ")";
                    } else {
                        a.setAttribute('href', '#example-' + (i + 1) + numberToLowercase(j - 1));
                        a.setAttribute('class', 'ref');
                        a.innerHTML = "(" + (i + 1) + numberToLowercase(j - 1) + ")";
                    }

                    refs[k].replaceWith(a);
                }
            }

            if (j > 0) {
                numbering[i][j].innerHTML = numberToLowercase(j - 1) + '.';
                numbering[i][j].setAttribute('id', 'example-' + (i + 1) + numberToLowercase(j - 1));
            }
        }

        numbering[i][0].innerHTML = '(' + (i + 1) + ')';
    }
}

var glosses = document.getElementsByTagName("gloss");
while (glosses.length) {
    var g = document.createElement("table");
    g.setAttribute("class", "gloss");

    var text = glosses[0].innerHTML.split("\n").filter(s => s.length > 0);
    for (var j = 0; j < text.length; j++) {
        text[j] = text[j].split(/\s+/).filter(s => s.length > 0);
        for (var k = 0; k < text[j].length; k++) text[j][k] = text[j][k].replace(/^\s+|\s+$/g, '').replace('Ø', '<null></null>');

        if (text[j].filter(s => s.length > 0).length < 1) continue;

        var row = document.createElement("tr");
        row.setAttribute("class", "gloss")
        if (j == 0) row.setAttribute("class", "morphemes");

        for (var k = 0; k < text[j].length; k++) {
            var cell = document.createElement("td");

            cell.innerHTML = (j == 0) ? text[j][k] : text[j][k].replace(/\b([0-9A-Z]+)\b/g, '<span class="sc">$1</span>').toLowerCase();
            row.appendChild(cell);
        }

        g.appendChild(row);
    }

    glosses[0].parentNode.replaceChild(g, glosses[0]);
}

function replaceDiacritics(s) {
    var chars = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', '_'];
    var diacritics = [
        /[\300-\306]/g, /[\340-\346]/g,  // A, a
        /[\310-\313]/g, /[\350-\353]/g,  // E, e
        /[\314-\317]/g, /[\354-\357]/g,  // I, i
        /[\322-\330]/g, /[\362-\370]/g,  // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /\s+/g
    ];

    for (var i = 0; i < diacritics.length; i++) {
        s = s.replace(diacritics[i], chars[i]);
    }

    return s;
}

function numberToLowercase(i) {
    return 'abcdefghijklmnopqrstuvwxyz'[i];
}
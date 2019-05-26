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
    l.setAttribute("class", "section-link");
    l.innerHTML = titleTag.innerHTML;

    l.setAttribute("href", "#" + titleTag.id);
    titleTag.innerHTML = '';
    titleTag.appendChild(l);
}

var translations = document.querySelectorAll(".body-content > translation, .body-content > transgroup");
var numbering = [];

for (var i = 0; i < translations.length; i++) {

    if (translations[i].tagName == "TRANSLATION") {

        var ungrammatical = translations[i].classList.contains('ungrammatical');

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
        if (ungrammatical) {
            col.setAttribute('class', 'ungrammatical');
        }

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

            var ungrammatical = children[j].classList.contains('ungrammatical');

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
            if (ungrammatical) {
                new_child.setAttribute('class', 'ungrammatical');
            }

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

        if (translations[i].classList.contains('no-gloss')) {
            group.classList += ' no-gloss';
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

            for (var k = refs.length - 1; k >= 0; k--) {
                var matcht = replaceDiacritics(refs[k].innerHTML).toLowerCase();

                if (matcht == numbering[i][j].innerHTML) {
                    var a = document.createElement('a');

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

    for (var j = 0; j < text.length; j++) text[j] = text[j]
        .replace(/\[([0-9A-Z\.]+?) +/g, '$1___')
        .replace(/ +\]/g, '___]')
        .split(/\s+/).filter(s => s.length > 0);

    for (var j = 0; j < text.length; j++) {

        for (var k = 0; k < text[j].length; k++) text[j][k] = text[j][k]
            .replace(/^\s+|\s+$/g, '')
            .replace('Ø', '<null></null>');

        if (j == 0) {
            for (var k = 0; k < text[j].length; k++) {

                if ((text.length > 1) && (k <= text[1].length) && (/([0-9A-Z\.]+)___/g.test(text[j][k]))) {
                    // assuming text[1] is the gloss row lmao
                    var replacement = text[j][k]
                        .match(/(?:([0-9A-Za-z\.]+)___(?!]))+?/g);
                    for (var l = 0; l < replacement.length; l++) replacement[l] = replacement[l]
                        .replace(/_/g, '')
                        .replace(/^(.*)$/g, '<span class="open-bracket"><sub>$1</sub></span>');
                    text[1][k] = replacement.join('') + text[1][k]
                }

                text[j][k] = text[j][k]
                    .replace('Ø', '<null></null>')
                    .replace(/([0-9A-Z\.]+)___(?!])/g, '<span class="open-bracket"><sub>$1</sub></span>')
                    .replace(/___]/g, '<span class="close-bracket"></span>');
            }
        }

        if (text[j].filter(s => s.length > 0).length < 1) continue;

        var row = document.createElement("tr");
        row.setAttribute("class", "gloss")
        if (j == 0) row.setAttribute("class", "morphemes");

        for (var k = 0; k < text[j].length; k++) {
            var cell = document.createElement("td");

            // transformations on gloss text
            cell.innerHTML = (j == 0) ? text[j][k] : text[j][k]
                .replace(/\b([0-9A-Z]+)\b/g, '<span class="sc">$1</span>')
                .toLowerCase();
            row.appendChild(cell);
        }

        g.appendChild(row);
    }

    glosses[0].parentNode.replaceChild(g, glosses[0]);
}

var links = document.querySelectorAll("a:not([class])");
for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href', 2);
    if (href.startsWith('#')) {
        var nav_item = document.querySelector('a[class^="h"][href="' + href + '"]');
        links[i].innerHTML = '§' + nav_item.innerHTML;
    }
}

var ortho = document.querySelectorAll("or");
for (var i = 0; i < ortho.length; i++) {
    ortho[i].innerHTML = ortho[i].innerHTML.replace('Ø', '<null></null>');
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


(function() {
    'use strict';
  
    var section = document.querySelectorAll(".section");
    var sections = {};
    var i = 0;
  
    Array.prototype.forEach.call(section, function(e) {
      sections[e.id] = e.offsetTop;
    });
  
    window.onscroll = function() {
      var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
  
      for (i in sections) {
        if (sections[i] <= scrollPosition) {
          document.querySelector('.active').setAttribute('class', ' ');
          document.querySelector('a[href*=' + i + ']').setAttribute('class', 'active');
        }
      }
    };
  })();
/*jslint browser: true*/
/*global document */
/*global $ */
/*global Modernizr */

// Foundation JavaScript
$(document).foundation();

// SVG / PNG
  if(!Modernizr.svg) {
    $('img[src*="svg"]').attr('src', function () {
        return $(this).attr('src').replace('.svg', '.png');
    });
  }

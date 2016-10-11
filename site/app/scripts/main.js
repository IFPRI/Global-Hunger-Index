/*jslint browser: true*/
/*jshint camelcase: false */
/*global L */
/*global $ */

function getColor(d) {
  if (d === '-') { return '#808080'; }
  if (d === '<5') { return '#4caf45'; }
  return d >= 50 ? '#ab0635' :
    d >= 35  ? '#e9841d' :
    d >= 20  ? '#fbe0c7' :
    d >= 10  ? '#bedcb3' :
    d >= 0   ? '#4caf45' :
    '#eaeaea';
}

function getSeverity(d, lang) {
  if (lang === 'de') {
    if (d === '-') { return 'Keine Angaben'; }
    if (d === '<5') { return 'Wenig'; }
    return d >= 50 ? 'Gravierend' :
      d >= 35  ? 'Sehr ernst' :
      d >= 20  ? 'Ernst' :
      d >= 10  ? 'Mäßig' :
      d >= 0   ? 'Wenig' :
      'Nicht berechnet';
  } else {
    if (d === '-') { return 'No data'; }
    if (d === '<5') { return 'Low'; }
    return d >= 50 ? 'Extremely alarming' :
      d >= 35  ? 'Alarming' :
      d >= 20  ? 'Serious' :
      d >= 10  ? 'Moderate' :
      d >= 0   ? 'Low' :
      'Not calculated';
  }
}

function getSeverityClass(d) {
  if (d === '-') { return 'no-data'; }
  if (d === '<5') { return 'low'; }
  return d >= 50 ? 'extra-alarming' :
    d >= 35  ? 'alarming' :
    d >= 20  ? 'serious' :
    d >= 10  ? 'moderate' :
    d >= 0   ? 'low' :
    'not-calculated';
}
var messages_en = {
  findout: 'Find out more',
  insuf_data: 'INSUFFICIENT DATA',
  not_calculated: 'Not calculated',
  score: 'Score',
  level: 'Level'
};
var messages_de = {
  findout: 'Mehr erfahren',
  insuf_data: 'UNZUREICHENDE DATEN',
  not_calculated: 'Nicht berechnet',
  score: 'Punkte',
  level: 'Wert'
};

(function (window, document, L, undefined) {
  'use strict';

  L.Icon.Default.imagePath = 'images/';

  /* create leaflet map */
  var map = L.map('map', {
    center: [32.5377, 13.3958],
    maxBounds: [[90, 180], [-90, -180]],
    scrollWheelZoom: false,
    boxZoom: false,
    // worldCopyJump: true,
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: false
  });
  map.addControl(new L.Control.ZoomMin());

  // new L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png', {
  new L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      subdomains: '0123',
      }).addTo(map);

  var geojsonLayer;

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.score),
      weight: feature.properties.score ? 1 : 0,
      opacity: 0.3,
      color: 'white',
      dashArray: '',
      fillOpacity: feature.properties.score ? 0.7 : 0
    };
  }

  // Interaction logic from https://jsfiddle.net/eaj6h/11/
  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: 'white',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }

    // info.update(layer.feature.properties);
  }


  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    // info.update();
  }

  //function zoomToFeature(e) {
  //  map.fitBounds(e.target.getBounds());
  //}
  


  function onEachFeature(feature, layer) {
    // set up popups
    var url = window.location.href;
    var m;
    var name;
    var level;
    if (url.indexOf('/de') > -1) {
      m = messages_de;
      name = feature.properties.name_de;
      level = getSeverity(feature.properties.score, 'de');
    } else {
      m = messages_en;
      name = feature.properties.name;
      level = getSeverity(feature.properties.score, 'en');
    }

    var popupContent = '<h4 id=' + feature.id + '>' + name + '</h4>';

    if (feature.properties.score === '-') {
      popupContent += '<p><strong>' + m.insuf_data + '</strong></p>';
    } else if (feature.properties.score === 'nc') {
      popupContent += '<p>' + m.score + ': <strong>' + m.not_calculated + '</strong></p>';
    } else {
      popupContent += '<p>' + m.score + ': <strong>' + feature.properties.score + '</strong></p>';
      popupContent += '<p>' + m.level + ': <strong>' + level + '</strong></p>';
    }

    if (feature.properties.score !== 'nc') {
      if (url.indexOf('embed') > -1) {
        popupContent += '<p><a class="button small radius" target="_blank" href="../countries/' + feature.id + '">' + m.findout + '</a></p>';
      } else {
        popupContent += '<p><a class="button small radius" href="countries/' + feature.id + '">' + m.findout + '</a></p>';
      }
    }
    // done with popup setup

    layer.bindPopup(popupContent, {autopan: true});
    // set up mouseover highlights
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });
    // make features accessible by id
    // https://stackoverflow.com/a/28618177
    layer._leaflet_id = feature.id;
  }

  // https://gis.stackexchange.com/a/102125
  var urlbase = '';
  if (window.location.href.indexOf('de/') > -1) {
    urlbase += '../';
  }
  if (window.location.href.indexOf('embed') > -1) {
    urlbase += '../';
  }
  var jsonfile = urlbase + 'data/countrydata-2016.geo.json';
  geojsonLayer = new L.GeoJSON.AJAX(jsonfile, {
    style: style,
    onEachFeature: onEachFeature
  });       
  geojsonLayer.addTo(map);

  // zoom on click
  // https://stackoverflow.com/a/24529886
  map.on('popupopen', function(centerMarker) {
          var cM = map.project(centerMarker.popup._latlng);
          cM.y -= centerMarker.popup._container.clientHeight/8;
          map.setView(map.unproject(cM),map.getZoom(), {animate: true});
      });

  function populateTable(year) {
    // reload table
    var urlbase = '';
    if (window.location.href.indexOf('/de') > -1) {
      urlbase += '../';
    }
    if (window.location.href.indexOf('embed') > -1) {
      urlbase += '../';
    }
    var jsonroot = urlbase + 'data/countrydata-';
    $.getJSON( jsonroot + year + '.geo.json', function( data ) {
      $('#country-table tbody').empty();
      $.each( data.features, function( key, c ) {
        var name;
        if (window.location.href.indexOf('/de') > -1) {
          name = c.properties.name_de;
        } else {
          name = c.properties.name;
        }
        if (c.properties.score !== 'nc' && c.properties.score !== '-') {
          $('<tr>').attr('id', 'table-' + c.id)
            .attr('class', getSeverityClass(c.properties.score))
            .attr('role', 'row')
            .append(
                $('<td class="name">').text(name).wrapInner('<span />'),
                $('<td class="score">').text(c.properties.score).wrapInner('<span />')
                ).appendTo('#country-table');
        }
      });
    });

    $('#country-table').on( 'click', 'tr', function () {
      // clicking on a country in the table focuses the map on it
      var f = geojsonLayer.getLayer(this.id.replace('table-', ''));
      map.setView(f.getBounds().getCenter());
      f.openPopup();
    });

    map.on('popupopen', function(e) {
      $('#table-container tr').removeClass('highlight');
      // https://stackoverflow.com/questions/12701240/how-to-identify-leaflets-marker-during-a-popupopen-event#comment50813535_12712987
      var country_id = e.popup._contentNode.childNodes[0].id;
      if ($('#table-' + country_id).length) {
        var container = $('#table-container');
        // https://stackoverflow.com/a/2906009
        var scroll_offset = $('#table-' + country_id).offset().top - container.offset().top + container.scrollTop();
        $('#table-container').animate({
          scrollTop: scroll_offset,
        }, 300);
        $('#table-' + country_id).addClass('highlight');
      }
    });

  }

  $(document).ready(function() {    
    if (window.location.href.indexOf('/de') > -1) {
      urlbase += '../';
    }
    if (window.location.href.indexOf('embed') > -1) {
      urlbase += '../';
    }
    populateTable('2016');
    $('#year-drop li a').click( function() {
      // year dropdown refreshes map
      var year = this.className;
      var jsonroot = urlbase + 'data/countrydata-';
      geojsonLayer.clearLayers();geojsonLayer = new L.GeoJSON.AJAX(jsonroot + year + '.geo.json', {
        style: style,
        onEachFeature: onEachFeature
      });       
      geojsonLayer.addTo(map);
      $('#year-button').text(year);
      populateTable(year);
    });
  });
}(window, document, L));


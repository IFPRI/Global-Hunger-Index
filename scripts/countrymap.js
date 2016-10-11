/*jslint browser: true*/
/*jshint camelcase: false */
/*global L */

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
    scrollWheelZoom: false,
    boxZoom: false,
    zoom: 5,
    minZoom: 5,
    maxZoom: 5,
    zoomControl: false
  });
  // map.addControl(new L.Control.ZoomMin())

  //new L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png', {
  new L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      subdomains: '0123',
      }).addTo(map);

  //var info = L.control();
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
  }

  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
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
        popupContent += '<p><a class="button small radius" target="_blank" href="../' + feature.id + '">' + m.findout + '</a></p>';
      } else {
        popupContent += '<p><a class="button small radius" href="../' + feature.id + '">' + m.findout + '</a></p>';
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
  var jsonfile;
  if (window.location.href.indexOf('/de') > -1) {
    jsonfile = '../../../data/countrydata-2016.geo.json';
  } else {
    jsonfile = '../../data/countrydata-2016.geo.json';
  }
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

  // focus map on open country
  geojsonLayer.on('data:loaded', function() {
    var urlparts = window.location.href.split('/');
    var country_id = urlparts[urlparts.length-2];
    var f = geojsonLayer.getLayer(country_id);
    map.setView(f.getBounds().getCenter(), map.getZoom(), { animate: false });
    f.openPopup();
  });

}(window, document, L));


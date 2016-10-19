/*jslint browser: true*/
/*jshint camelcase: false */
/*global L */
/*global $ */
var no_data_sig_concern_country_list_2016 = ['BDI','COM','COD','ERI','LBY','PNG','SOM','SSD','SDN','SYR'];
// Default Stripes.
var stripes = null;

function getPattern(cntry_id){
	if( no_data_sig_concern_country_list_2016.indexOf(cntry_id) === -1 ) {
	  return null; 
	}
    else  {
		return stripes; 
	}
}	
		
function getColor(d,cntry_id) {
	//YJ: add parameter contry_id
  //if (d === '-') { return '#808080'; }
  //if (d === '-') { return 'repeating-linear-gradient(45deg,	#606dbc,	#606dbc 10px,	#465298 10px,	#465298 20px)'; }
  if (d === '-' || d === '') { 
    if( no_data_sig_concern_country_list_2016.indexOf(cntry_id) === -1 ) {
		//console.log('0-cntry_id : ' + cntry_id);
	  return '#868889'; 
	}
    else  {
		//console.log('1-cntry_id : ' + cntry_id);
		return 'black';//'#e9841d'; 
	}
	}
  if (d === '<5') { return '#54A526'; }
  return d >= 50 ? '#AA0132' :
    d >= 35  ? '#EA8A00' :
    d >= 20  ? '#F7C589' :
    d >= 10  ? '#B5D296' :
    d >= 0   ? '#54A526' :
    '#EAEAEA';
}

function getSeverity(d, lang,cntry_id) {
  if (lang === 'de') {
    //if (d === '-') { return 'Keine Angaben'; }
	if (d === '-') {
      if( no_data_sig_concern_country_list_2016.indexOf(cntry_id) === -1 ) {
	    return 'Unzureichende Daten'; 
	  }
	  else {
		  return 'Unzureichende Daten, Anlass zu erheblicher Besorgnis'; 
	  }
	}
    if (d === '<5') { return 'Wenig'; }
    return d >= 50 ? 'Gravierend' :
      d >= 35  ? 'Sehr ernst' :
      d >= 20  ? 'Ernst' :
      d >= 10  ? 'Mäßig' :
      d >= 0   ? 'Wenig' :
      'Nicht berechnet';
  } else {
    if (d === '-') {
      if( no_data_sig_concern_country_list_2016.indexOf(cntry_id) === -1 ) {
	    return 'Insuficient data'; 
	  }
	  else {
		  return 'Insuficient data, significant concern'; 
	  }
	}
    if (d === '<5') { return 'Low'; }
    return d >= 50 ? 'Extremely alarming' :
      d >= 35  ? 'Alarming' :
      d >= 20  ? 'Serious' :
      d >= 10  ? 'Moderate' :
      d >= 0   ? 'Low' :
      'Not calculated';
  }
}

function getSeverityClass(d,cntry_id) {
  //if (d === '-') { return 'no-data'; }
  if (d === '-') {
      if( no_data_sig_concern_country_list_2016.indexOf(cntry_id) === -1 ) {
	    return 'no-data'; 
	  }
	  else {
		  return 'no-data-sig-concern'; 
	  }
	}
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
  insuf_data: 'Insufficient data',
  insuf_sigconcern: 'Insufficient data, significant concern',
  not_calculated: 'Not calculated',
  score: 'Score',
  level: 'Level'
};
var messages_de = {
  findout: 'Mehr erfahren',
  insuf_data: 'Unzureichende Daten',
  insuf_sigconcern: 'Unzureichende Daten, Anlass zu erheblicher Besorgnis',
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
  
  //YJ: add stripe pattern
  stripes = new L.StripePattern({
            /*patternContentUnits: 'objectBoundingBox',
            patternUnits: 'objectBoundingBox',
            weight: 0.1,
            spaceWeight: 0.05,
            height: 0.15, //0.2,
            angle: -45,
			color: 'gray',//work for stripe
			spaceColor: '#e9841d', //'#e9841d'
			opacity: 1.0,
			spaceOpacity: 1.0*/
			
		color: 'darkgray',
		spaceColor: '#e9841d',
		spaceOpacity: 1,
		angle: -45
        });
  stripes.addTo(map);


  // new L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png', {
  new L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      subdomains: '0123',
      }).addTo(map);

  var geojsonLayer;

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.score, feature.id),
	  fillPattern: getPattern(feature.id),
      weight: feature.properties.score ? 1 : 0,
      opacity: 1, //0.3,
      color: 'white',
      dashArray: '',
      fillOpacity: feature.properties.score ? 1 : 0 //0.7 : 0
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
      level = getSeverity(feature.properties.score, 'de', feature.id);
    } else {
      m = messages_en;
      name = feature.properties.name;
      level = getSeverity(feature.properties.score, 'en', feature.id);
    }

    var popupContent = '<h4 id=' + feature.id + '>' + name + '</h4>';

    if (feature.properties.score === '-') {
		if (name==='Bhutan' ||name ==='Qatar'||name ==='Bahrain')
			{popupContent += '<p><strong>' + m.insuf_data + '</strong></p>';	
		}		
		else {
			popupContent += '<p><strong>' + m.insuf_sigconcern + '</strong></p>';			
		}
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
            .attr('class', getSeverityClass(c.properties.score, c.id))
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


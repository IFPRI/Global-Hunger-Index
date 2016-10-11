/*jslint browser: true*/
/*jshint camelcase: false */
/*global $ */

$(document).ready(function() {
  var urlbase;
  var lang;
  if (window.location.href.indexOf('de/') > 1) { lang = 'de'; } else { lang = 'en'; }
  if (lang === 'de') {
    urlbase = '../../';
  } else {
    urlbase = '../';
  }
  var ajaxurl = urlbase + 'data/trends-2016.json';
  console.log(ajaxurl);
  var table = $('#trends-table').DataTable( {
    'ajax': ajaxurl,
    'columns': [
      { data: 'country',
        render: function (data, type) {
          var name; 
          if (lang === 'de') { name = data.name_de; } else { name = data.name; }
          return type === 'display' ? '<a href="../countries/' + data.id + '">' + name + '</a>' : name;
        }
      },
      { data: 'undernourished', 
        render: function (data, type) {
            // https://datatables.net/manual/orthogonal-data
            if ( type === 'display' || type === 'filter' ) { return data; }
            if (data === '-') { return 0; }
            if (data.indexOf('*') > -1) { data = data.replace('*', ''); }
            return parseFloat(data);
        }
      },
      { data: 'wasting', 
        render: function (data, type) {
            if ( type === 'display' || type === 'filter' ) { return data; }
            if (data === '-') { return 0; }
            if (data.indexOf('*') > -1) { data = data.replace('*', ''); }
            return parseFloat(data);
        }
      },
      { data: 'stunting', 
        render: function (data, type) {
            if ( type === 'display' || type === 'filter' ) { return data; }
            if (data === '-') { return 0; }
            if (data.indexOf('*') > -1) { data = data.replace('*', ''); }
            return parseFloat(data);
        }
      },
      { data: 'mortality', 
        render: function (data, type) {
            if ( type === 'display' || type === 'filter' ) { return data; }
            if (data === '-') { return 0; }
            return parseFloat(data);
        }
      },
      { data: 'zone' },
      { data: 'score',
        render: function (data, type) {
            // https://datatables.net/manual/orthogonal-data
            if ( type === 'display' || type === 'filter' ) { return data; }
            if (data === '-') { return 0; }
            if (data === '<5') { return 2.5; }
            return parseFloat(data);
          
        }
      }
    ],
    'dom': '<"trends-toolbar">frtip',
    'paging': false,
    'responsive': true,
    'info': false
  } );

  var toolbarHtml;
  if (lang === 'de') {
    // Fix "Search" label
    var labelHtml = $('#trends-table_filter label').html().replace('Search:', 'Suchen:');
    $('#trends-table_filter label').html(labelHtml);
    toolbarHtml = '<div class="large-2 columns toolbar-column"><label for="year">Jahr</label> <select name="year" id="year"> <option value="2016" selected>2016</option> <option value="2008">2008</option> <option value="2000">2000</option> <option value="1992">1992</option> </select></div><div class="large-5 columns toolbar-column"><label for="zone">Zone</label> <select name="zone" id="zone"> <option value="all" selected>Alle Länder</option> <option value="MENA">Naher Osten und Nordafrika</option> <option value="WAF">West-Afrika</option> <option value="CSAF">Zentral- und Südafrika</option> <option value="EAF">Ostafrika</option> <option value="SA">Südamerika</option> <option value="CAR">Zentralamerika und Karibik</option> <option value="SEA">Südostasien</option> <option value="EEFSU">Osteuropa und Gemeinschaft Unabhängiger Staaten</option> </select></div>';
  } else {
    toolbarHtml = '<div class="large-2 columns toolbar-column"><label for="year">Year</label> <select name="year" id="year"> <option value="2016" selected>2016</option> <option value="2008">2008</option> <option value="2000">2000</option> <option value="1992">1992</option> </select></div><div class="large-5 columns toolbar-column"><label for="zone">Zone</label> <select name="zone" id="zone"> <option value="all" selected>All countries</option> <option value="MENA">Near East and North Africa</option> <option value="WAF">West Africa</option> <option value="CSAF">Central and Southern Africa</option> <option value="EAF">East Africa</option> <option value="SA">South America</option> <option value="CAR">Central America and the Caribbean</option> <option value="SEA">South, East and Southeast Asia</option> <option value="EEFSU">Eastern Europe and the Commonwealth of Independent States</option> </select></div>';
  }
  $('div.trends-toolbar').html(toolbarHtml);


  $('select#year').change(function () { 
    var year = this.value; 
    var ajaxurl = urlbase + 'data/trends-' + year + '.json';
    console.log(ajaxurl);
    table.ajax.url(ajaxurl).load();
  });

  $('select#zone').change(function () { 
    var zone = this.value; 
    if (zone === 'all') { zone = ''; } 
    table.column(5).search(zone).draw();
  });
  
  $('div#trends-table_filter').addClass('large-5 columns toolbar-column');
  $('#trends-table_wrapper .toolbar-column').wrapAll( '<div class="row" />');
  $('#trends-table').wrap( '<div class="row"><div class="large-12 columns"></div></div>');

} );


/*

<label for="year">Year</label>
<select name="year" id="year">
  <option value="2016" selected>2016</option> 
  <option value="2008">2008</option>
  <option value="2000">2000</option>
  <option value="1992">1992</option>
</select>


<label for="zone">Zone</label>
<select name="zone" id="zone">
  <option value="all" selected>Alle Länder</option> 
  <option value="MENA">Naher Osten und Nordafrika</option>
  <option value="WAF">West-Afrika</option>
  <option value="CSAF">Zentral- und Südafrika</option>
  <option value="EAF">Ostafrika</option>
  <option value="SA">Südamerika</option>
  <option value="CAR">Zentralamerika und Karibik</option>
  <option value="SEA">Südostasien</option>
  <option value="EEFSU">Osteuropa und Gemeinschaft Unabhängiger Staaten</option>
</select>



<label for="zone">Zone</label>
<select name="zone" id="zone">
  <option value="all" selected>All countries</option> 
  <option value="MENA">Near East and North Africa</option>
  <option value="WAF">West Africa</option>
  <option value="CSAF">Central and Southern Africa</option>
  <option value="EAF">East Africa</option>
  <option value="SA">South America</option>
  <option value="CAR">Central America and the Caribbean</option>
  <option value="SEA">South, East and Southeast Asia</option>
  <option value="EEFSU">Eastern Europe and the Commonwealth of Independent States</option>
</select>

*/





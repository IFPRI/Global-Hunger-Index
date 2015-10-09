/*jslint browser: true*/
/*global $ */

var urlbase;
if (window.location.href.indexOf('de') > 1) {
  urlbase = '../../';
} else {
  urlbase = '../';
}

$(document).ready(function() {
  var table = $('#trends-table').DataTable( {
    'ajax': urlbase + 'data/trends-2015.json',
    'columns': [
      { data: 'country',
        render: function (data, type) {
          return type === 'display' ? '<a href="../countries/' + data.id + '">' + data.name + '</a>' : data.name;
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
      { data: 'stunting', 
        render: function (data, type) {
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
    // hide zone column
    'columnDefs': [ {'targets': [5], 'visible': false} ],
    'dom': '<"trends-toolbar">frtip',
    'paging': false,
    'responsive': true,
    'info': false
  } );

  $('div.trends-toolbar').html('<div class="large-2 columns toolbar-column"><label for="year">Year</label> <select name="year" id="year"> <option value="2015" selected>2015</option> <option value="2005">2005</option> <option value="2000">2000</option> <option value="1995">1995</option> <option value="1990">1990</option> </select></div><div class="large-5 columns toolbar-column"><label for="zone">Zone</label> <select name="zone" id="zone"> <option value="all" selected>All countries</option> <option value="MENA">Near East and North Africa</option> <option value="WAF">West Africa</option> <option value="CSAF">Central and Southern Africa</option> <option value="EAF">East Africa</option> <option value="SA">South America</option> <option value="CAR">Central America and the Caribbean</option> <option value="SEA">South, East and Southeast Asia</option> <option value="EEFSU">Eastern Europe and the Commonwealth of Independent States</option> </select></div>');

  $('select#year').change(function () { 
    var year = this.value; 
    table.ajax.url(urlbase + 'data/trends-' + year + '.json').load();
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
  <option value="2015" selected>2015</option> 
  <option value="2005">2005</option>
  <option value="2000">2000</option>
  <option value="1995">1995</option>
  <option value="1990">1990</option>
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

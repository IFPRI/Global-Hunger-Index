#!/usr/bin/env python

import json
import unicodecsv as csv
import copy

geodata = json.loads(open("../data/ghi-countries.geo.json", "r").read())
scores = csv.DictReader(open("../data/ghi-scores.csv", "r"))
ind_reader = csv.DictReader(open("../data/ghi-indicators.csv", "r"))
country_names = csv.DictReader(open("../data/country_names.csv", "r"))
indicators = {}
for row in ind_reader:
    country = row['country']
    del row['country']
    info = row
    indicators[country] = info
    
country_codes = [entry['id'] for entry in geodata['features']]
german_names = {r['iso3']: r['country_name_de'] for r in country_names}
years = [1992, 2000, 2008, 2016]

for s in scores:
    if s['countrycode3'] in country_codes:
        exists = False
        for entry in geodata['features']:
            if entry['id'] == s['countrycode3']:
                exists = True
                entry['properties']['name'] = s['country']
                entry['properties']['name_de'] = german_names[s['countrycode3']]
                entry['properties']['score'] = {
                    'year2016': s['score2016'],
                    'year2008': s['score2008'],
                    'year2000': s['score2000'],
                    'year1992': s['score1992'],
                }
                break
        if not exists:
            print "Not in scores: " + s['country']

    else:
        print "Not found: " + s['country']

# zero out industrialized countries' scores, needed for Leaflet to parse this
# correctly
for entry in geodata['features']:
    if not entry['properties'].get('score'):
        entry['properties']['score'] = {
            'year2016': 'nc',
            'year2008': 'nc',
            'year2000': 'nc',
            'year1992': 'nc',
        }
    if not entry['properties'].get('name_de') and german_names.get(entry['id']):
        entry['properties']['name_de'] = german_names[entry['id']]

# divide into yearly files
for year in years:
    year_data = copy.deepcopy(geodata)
    year_data['features'] = []
    for entry in geodata['features']:
        # copy entry
        new_entry = copy.deepcopy(entry)
        # replace score dict with value for this year
        new_entry['properties']['score'] = new_entry['properties']['score']['year' + str(year)]
        if new_entry['properties']['score'] not in ('nc', '-'):
            if new_entry['properties']['score'] == "<5":
                new_entry['properties']['score'] = 2.5
            new_entry['properties']['score'] = float(new_entry['properties']['score']) 
        year_data['features'].append(new_entry)  
    f = open("../site/app/data/countrydata-%d.geo.json" % year, 'w')

   
  # Sort the table by score
    # https://stackoverflow.com/a/73044
    year_data['features'].sort(lambda x, y: cmp(x['properties']['score'], y['properties']['score']))
    year_data['features'].reverse()

    # Revert values
    for entry in year_data['features']:
        if entry['properties']['score'] == 2.5:
            entry['properties']['score'] = "<5"

    f.write(json.dumps(year_data, indent=2))
    f.close()


f = open("../site/app/data/countrydata.geo.json", 'w')
f.write(json.dumps(geodata, indent=2))
f.close()


# table data
table_entries = []
for entry in geodata['features']:
    if entry['properties']['score']['year2016'] == 'nc':
        continue

    country_name = entry['properties']['name']
    country_id = entry['id']
    d = {'name': country_name,
         'name_de': entry['properties']['name_de'],
         'id': country_id,
         'score': entry['properties']['score'],
         'details': {
             'undernourished_1992': {'score': indicators[country_name]['under-1992'],
                                     'estimate': bool(indicators[country_name]['under-1992-est'])},
             'undernourished_2000': {'score': indicators[country_name]['under-2000'],
                                     'estimate': bool(indicators[country_name]['under-2000-est'])},
             'undernourished_2008': {'score': indicators[country_name]['under-2008'],
                                     'estimate': bool(indicators[country_name]['under-2008-est'])},
             'undernourished_2016': {'score': indicators[country_name]['under-2016'],
                                     'estimate': bool(indicators[country_name]['under-2016-est'])},
             'stunting_1992': {'score': indicators[country_name]['stunting-1992'],
                               'estimate': bool(indicators[country_name]['stunting-1992-est'])},
             'stunting_2000': {'score': indicators[country_name]['stunting-2000'],
                               'estimate': bool(indicators[country_name]['stunting-2000-est'])},
             'stunting_2008': {'score': indicators[country_name]['stunting-2008'],
                               'estimate': bool(indicators[country_name]['stunting-2008-est'])},
             'stunting_2016': {'score': indicators[country_name]['stunting-2016'],
                               'estimate': bool(indicators[country_name]['stunting-2016-est'])},
             'wasting_1992': {'score': indicators[country_name]['wasting-1992'],
                              'estimate': bool(indicators[country_name]['wasting-1992-est'])},
             'wasting_2000': {'score': indicators[country_name]['wasting-2000'],
                              'estimate': bool(indicators[country_name]['wasting-2000-est'])},
             'wasting_2008': {'score': indicators[country_name]['wasting-2008'],
                              'estimate': bool(indicators[country_name]['wasting-2008-est'])},
             'wasting_2016': {'score': indicators[country_name]['wasting-2016'],
                              'estimate': bool(indicators[country_name]['wasting-2016-est'])},
             'mortality_1992': {'score': indicators[country_name]['mortality-1992']},
             'mortality_2000': {'score': indicators[country_name]['mortality-2000']},
             'mortality_2008': {'score': indicators[country_name]['mortality-2008']},
             'mortality_2015': {'score': indicators[country_name]['mortality-2015']},
         }}
    table_entries.append(d)

table_data = {'data': table_entries}
#print table_data
f = open("../data/country-details.json", 'w')
#f = open("../data/table_data.json", 'w')
f.write(json.dumps(table_data, indent=2))
f.close()

# Zones dataset

# Trends table

# get zones dataset
zones = list(csv.DictReader(open("../data/regions.csv", "r")))
for year in years:
    year = str(year)
    entries = []
    for row in table_entries:
        # fill out necessary fields
        from render_templates import get_level_from_score
        entry = {
            "country": {"name": row["name"], "name_de": row["name_de"], "id": row["id"]},
            "score": row["score"]["year" + year],
            "undernourished": row["details"]["undernourished_" + year]["score"],
            "stunting": row["details"]["stunting_" + year]["score"],
            "wasting": row["details"]["wasting_" + year]["score"],
            "mortality": row["details"]["mortality_" + year.replace("2016", "2015")]["score"],
        }

        entry["DT_RowClass"] = get_level_from_score(entry["score"])
        entry["undernourished"] += "*" if row["details"]["undernourished_" + year]["estimate"] else ""
        entry["stunting"] += "*" if row["details"]["stunting_" + year]["estimate"] else ""
        entry["wasting"] += "*" if row["details"]["wasting_" + year]["estimate"] else ""
        # fetch this country's zone
        for z in zones:
            if z['code'] == entry["country"]["id"]:
                entry['zone'] = z['zonecode']
                break
        if not entry.get('zone'):
            print "No zone match: " + entry["country"]['name']
            entry['zone'] = ''

        # add it to the entry list
        entries.append(entry)

    trends_data = {'data': entries}
    f = open("../site/app/data/trends-%s.json" % year, 'w')
    f.write(json.dumps(trends_data, indent=2))
    f.close()


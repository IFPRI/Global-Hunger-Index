#!/usr/bin/env python

import json
import csv
import copy

geodata = json.loads(open("../data/ghi-countries.geo.json", "r").read())
scores = csv.DictReader(open("../data/ghi-scores.csv", "r"))
ind_reader = csv.DictReader(open("../data/ghi-indicators.csv", "r"))
indicators = {}
for row in ind_reader:
    country = row['country']
    del row['country']
    info = row
    indicators[country] = info

country_codes = [entry['id'] for entry in geodata['features']]
years = [1990, 1995, 2000, 2005, 2015]

for s in scores:
    if s['countrycode3'] in country_codes:
        exists = False
        for entry in geodata['features']:
            if entry['id'] == s['countrycode3']:
                exists = True
                entry['properties']['name'] = s['country']
                entry['properties']['score'] = {
                    'year2015': s['score2015'],
                    'year2005': s['score2005'],
                    'year2000': s['score2000'],
                    'year1995': s['score1995'],
                    'year1990': s['score1990'],
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
            'year2015': 'nc',
            'year2005': 'nc',
            'year2000': 'nc',
            'year1995': 'nc',
            'year1990': 'nc',
        }

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
    if entry['properties']['score']['year2015'] == 'nc':
        continue

    country_name = entry['properties']['name']
    country_id = entry['id']
    d = {'name': country_name,
         'id': country_id,
         'score': entry['properties']['score'],
         'details': {
             'undernourished_1990': {'score': indicators[country_name]['under-1990'],
                                     'estimate': bool(indicators[country_name]['under-1990-est'])},
             'undernourished_1995': {'score': indicators[country_name]['under-1995'],
                                     'estimate': bool(indicators[country_name]['under-1995-est'])},
             'undernourished_2000': {'score': indicators[country_name]['under-2000'],
                                     'estimate': bool(indicators[country_name]['under-2000-est'])},
             'undernourished_2005': {'score': indicators[country_name]['under-2005'],
                                     'estimate': bool(indicators[country_name]['under-2005-est'])},
             'undernourished_2015': {'score': indicators[country_name]['under-2015'],
                                     'estimate': bool(indicators[country_name]['under-2015-est'])},
             'stunting_1990': {'score': indicators[country_name]['stunting-1990'],
                               'estimate': bool(indicators[country_name]['stunting-1990-est'])},
             'stunting_1995': {'score': indicators[country_name]['stunting-1995'],
                               'estimate': bool(indicators[country_name]['stunting-1995-est'])},
             'stunting_2000': {'score': indicators[country_name]['stunting-2000'],
                               'estimate': bool(indicators[country_name]['stunting-2000-est'])},
             'stunting_2005': {'score': indicators[country_name]['stunting-2005'],
                               'estimate': bool(indicators[country_name]['stunting-2005-est'])},
             'stunting_2015': {'score': indicators[country_name]['stunting-2015'],
                               'estimate': bool(indicators[country_name]['stunting-2015-est'])},
             'wasting_1990': {'score': indicators[country_name]['wasting-1990'],
                              'estimate': bool(indicators[country_name]['wasting-1990-est'])},
             'wasting_1995': {'score': indicators[country_name]['wasting-1995'],
                              'estimate': bool(indicators[country_name]['wasting-1995-est'])},
             'wasting_2000': {'score': indicators[country_name]['wasting-2000'],
                              'estimate': bool(indicators[country_name]['wasting-2000-est'])},
             'wasting_2005': {'score': indicators[country_name]['wasting-2005'],
                              'estimate': bool(indicators[country_name]['wasting-2005-est'])},
             'wasting_2015': {'score': indicators[country_name]['wasting-2015'],
                              'estimate': bool(indicators[country_name]['wasting-2015-est'])},
             'mortality_1990': {'score': indicators[country_name]['mortality-1990']},
             'mortality_1995': {'score': indicators[country_name]['mortality-1995']},
             'mortality_2000': {'score': indicators[country_name]['mortality-2000']},
             'mortality_2005': {'score': indicators[country_name]['mortality-2005']},
             'mortality_2013': {'score': indicators[country_name]['mortality-2013']},
         }}
    table_entries.append(d)

table_data = {'data': table_entries}

f = open("../data/country-details.json", 'w')
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
            "country": {"name": row["name"], "id": row["id"]},
            "score": row["score"]["year" + year],
            "undernourished": row["details"]["undernourished_" + year]["score"],
            "stunting": row["details"]["stunting_" + year]["score"],
            "wasting": row["details"]["wasting_" + year]["score"],
            "mortality": row["details"]["mortality_" + year.replace("2015", "2013")]["score"],
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




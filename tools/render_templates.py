#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
Options:

 -c Clear local repos and clone everything again
 -o Offline, don't clone or pull remote repos

TODO:
- read scripts/ dir and run the preparation scripts

'''

import os
import jinja2
import json
import unicodecsv as csv
import codecs
import markdown

# Specify the static page names to render
static_pages = ["about", "contact", "hunger", "methodology", "results"]

# set up Jinja
template_dir = "../site/jinja_templates"
env = jinja2.Environment(loader=jinja2.FileSystemLoader([template_dir]))

csvdata = list(csv.reader(open("../data/messages.csv", 'r')))
messages = {label: text for label, text, text_de in csvdata}
messages_de = {label: text_de for label, text, text_de in csvdata}


def get_level_from_score(score):
    level = ""
    if score in ("-", "null"):
        level = "no-data"
    elif score == "<5":
        level = "low"
    elif float(score) >= 50:
        level = "extra-alarming"
    elif float(score) >= 35:
        level = "alarming"
    elif float(score) >= 20:
        level = "serious"
    elif float(score) >= 10:
        level = "moderate"
    elif float(score) >= 0:
        level = "low"
    else:
        print "Unexpected score: ", score
    return level


def get_verbose_level_from_score(score, lang="en"):
    level = ""
    if lang == "de":
        if score in ("-", 'null'):
            level = "Keine Angaben"
        elif score == "<5":
            level = "Wenig"
        elif float(score) >= 50:
            level = "Gravierend"
        elif float(score) >= 35:
            level = "Sehr ernst"
        elif float(score) >= 20:
            level = "Ernst"
        elif float(score) >= 10:
            level = u"Mäßig"
        elif float(score) >= 0:
            level = "Wenig"
        else:
            print "Unexpected score: ", score
            level = "???"
    else:
        if score in ("-", 'null'):
            level = "No data"
        elif score == "<5":
            level = "Low"
        elif float(score) >= 50:
            level = "Extremely alarming"
        elif float(score) >= 35:
            level = "Alarming"
        elif float(score) >= 20:
            level = "Serious"
        elif float(score) >= 10:
            level = "Moderate"
        elif float(score) >= 0:
            level = "Low"
        else:
            print "Unexpected score: ", score
            level = "???"
    return level


def create_index_page():
    template = env.get_template("index.html")

    table_entries = json.loads(open("../data/table_data.json", "r").read())["data"]
    for entry in table_entries:
        entry['level'] = get_level_from_score(entry['score']['year2016'])

    context = {"table_entries": table_entries,
               "m": messages,
               "relpath": "",
               "linkrelpath": "",
               "lang": "en",
               }
    contents = template.render(**context)
    f = codecs.open("../site/app/html/index.html", 'w', 'utf-8')
    f.write(contents)
    f.close()
    # german language site
    context["m"] = messages_de
    context["relpath"] = '../'
    context["linkrelpath"] = '../de/'
    context["lang"] = 'de'
    contents = template.render(**context)
    dirname = "../site/app/html/de/"
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open(os.path.join(dirname, "index.html"), 'w', 'utf-8')
    f.write(contents)
    f.close()

    # also generate the embed page
    template = env.get_template("embed.html")
    context["m"] = messages
    context["relpath"] = '../'
    context["lang"] = 'en'
    contents = template.render(**context)
    dirname = '../site/app/html/embed/'
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open(dirname + "index.html", 'w', 'utf-8')
    f.write(contents)
    f.close()
    # german
    context["m"] = messages_de
    context["relpath"] = '../../'
    context["lang"] = 'de'
    contents = template.render(**context)
    dirname = '../site/app/html/de/embed/'
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open(dirname + "index.html", 'w', 'utf-8')
    f.write(contents)
    f.close()


def create_static_page(name):
    template = env.get_template("static.html")

    content = markdown.markdown(codecs.open("../data/pages/%s.md" % name, "r", 'utf-8').read(), extensions=['markdown.extensions.footnotes'])
    context = {"page_name": name,
               "md_content": content,
               "m": messages,
               "relpath": "../",
               "linkrelpath": "../",
               "lang": "en",
               }
    contents = template.render(**context)
    dirname = "../site/app/html/%s/" % name
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open(os.path.join(dirname, "index.html"), 'w', 'utf-8')
    f.write(contents)
    f.close()
    # german language site
    content = markdown.markdown(codecs.open("../data/pages/%s_de.md" % name, "r", 'utf-8').read(), extensions=['markdown.extensions.footnotes'])
    context["md_content"] = content
    context["m"] = messages_de
    context["relpath"] = '../../'
    context["linkrelpath"] = '../../de/'
    context["lang"] = 'de'
    contents = template.render(**context)
    dirname = "../site/app/html/de/%s/" % name
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open(os.path.join(dirname, "index.html"), 'w', 'utf-8')
    f.write(contents)
    f.close()


def create_country_pages():
    template = env.get_template("country.html")
    country_data = json.loads(open("../data/country-details.json", "r").read())["data"]
    country_codes = [entry['id'] for entry in country_data]

    for country_code in country_codes:
        country = None
        for c in country_data:
            if c['id'] == country_code:
                country = c
                break
        if not country:
            print "Could not find country!!"

        scores = {}
        for entry in country['score']:
            score = country['score'][entry]
            if "-" in score:
                score = "null"
            elif score not in ["<5", "-"]:
                score = float(score)
            scores[entry] = score

        scorediff = None
        if type(scores['year2016']) == float and type(scores['year2008']) == float:
            scorediff = scores['year2016'] - scores['year2008']

        context = {"score": scores,
                   "scorediff": scorediff,
                   "score_evolution": "up" if scorediff > 0 else "down",
                   "d": country['details'],
                   "name": country['name'],
                   "m": messages,
                   "level": get_verbose_level_from_score(scores['year2016']),
                   "level_class": get_level_from_score(scores['year2016']),
                   "relpath": "../../",
                   "linkrelpath": "../../",
                   "lang": "en",
                   }

        contents = template.render(**context)
        dirname = "../site/app/html/countries/%s/" % country_code
        if not os.path.exists(dirname):
            os.makedirs(dirname)
        f = codecs.open(os.path.join(dirname, "index.html"), 'w', 'utf-8')
        f.write(contents)
        f.close()
        # german language site
        context["m"] = messages_de
        context["name"] = country['name_de']
        context["relpath"] = '../../../'
        context["linkrelpath"] = '../../../de/'
        context["lang"] = 'de'
        context["level"] = get_verbose_level_from_score(scores['year2016'], lang="de")
        contents = template.render(**context)
        dirname = "../site/app/html/de/countries/%s/" % country_code
        if not os.path.exists(dirname):
            os.makedirs(dirname)
        f = codecs.open(os.path.join(dirname, "index.html"), 'w', 'utf-8')
        f.write(contents)
        f.close()


def create_trends_page():
    template = env.get_template("trends.html")
    table_entries = json.loads(open("../data/table_data.json", "r").read())["data"]

    context = {"page_name": "trends",
               "table_entries": table_entries,
               "m": messages,
               "relpath": "../",
               "linkrelpath": "../",
               "lang": "en",
               }
    contents = template.render(**context)
    dirname = "../site/app/html/trends/"
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open("../site/app/html/trends/index.html", 'w', 'utf-8')
    f.write(contents)
    f.close()
    # german
    context["m"] = messages_de
    context["relpath"] = '../../'
    context["linkrelpath"] = '../../de/'
    context["lang"] = 'de'
    contents = template.render(**context)
    dirname = "../site/app/html/de/trends/"
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    f = codecs.open("../site/app/html/de/trends/index.html", 'w', 'utf-8')
    f.write(contents)
    f.close()


if __name__ == "__main__":
    create_index_page()
    create_trends_page()
    for p in static_pages:
        create_static_page(p)
    create_country_pages()

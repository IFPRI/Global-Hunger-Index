# Project : Global Hunger Index 2015
# -----------------------------------------------------------------------------
# Author : Ricardo Lafuente <ricardo@jplusplus.org>
# -----------------------------------------------------------------------------
# License : GNU General Public License
# -----------------------------------------------------------------------------

install:
	virtualenv .env --no-site-packages --distribute --prompt=\(ghi\)
	. `pwd`/.env/bin/activate; pip install -r requirements.txt
	cd site; npm install; bower install

build:
	. `pwd`/.env/bin/activate; cd tools; python generate_geojson.py && python render_templates.py
	cd site; gulp build

serve:
	cd site; gulp watch

deploy:
	cd site; gulp deploy

clean:
	rm -fr site/dist


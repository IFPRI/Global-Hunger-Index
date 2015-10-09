# hunger-index-2015

This is a visualization of the Global Hunger Index 2015 rankings and related
data from previous years. Developed for IFPRI.

## Project setup

In order to get going, run

    make install

This will install the Python, npm and Bower dependencies.


## Working

Build the project with

    make build

**Note**: The HTML files are first generated using Jinja, and only then
processed by Gulp.  This is why the commands are run by Make and not Gulp
(which is run by Make internally).

Run a development server:

    make serve


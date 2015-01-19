personal-website
================
This is the first version of my personal website and my attempt to fiddle with
`<canvas>`, [Django](https://www.djangoproject.com/) and [Google App Engine](https://cloud.google.com/appengine/).
Feel Free to use any or all of the components for your projects, everything I added is under GPL2.
At the time of this writing you can see a live version of this code at [bafghahi.com](http://bafghahi.com).

## Structure Overview
**./libs/** has simlinks (that shouldn't work for you, you need to create your own) to libraries used by
the serverside code (Python2.7/Django). This is required because GAE has a managed python instance.

**./menthas_pw/** This servers the home page and most of the static pages. nothing fancy about it

**./pw_django/** django project module, hosts url mappings and settings.

**./templates/** I'm using a global template directory to override the blog's default template. to my knowledge
this is not the recommended way of doing this but I didn't have time to override the actual zinnia classes
so it's best if you do it the right way. I will fix this in the future versions.

**./app.yaml** GAE app configurations, the directives should be easy to understand using the GAE docs

**./appengine_config.py** this file is picked up by GAE when the app is being initialized. I'm using it to
inject the `libs` directory into `PYTHONPATH` and to fix an issue with GAE and python's `intercept` library.

**./mysel_dev.cnf** I used two different databases for dev and prod (which is the better option) and this file
will be picked up automaticaly when on a local environment. add your local mysql creds to this file.

**./requirements.txt** list of python packages required for this project. This file represents the stack that
worked for me. Unfortunately GAE only supports Django upto 1.5 (even that is experimental). so these packages
are not the latest available.

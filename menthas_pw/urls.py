from django.conf.urls import patterns, url

from menthas_pw import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
)

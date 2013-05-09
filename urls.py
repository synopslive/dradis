from django.conf.urls.defaults import patterns, include, url
import views

urlpatterns = patterns('',
    url(r'^ajax/medias', views.retreive_medias),
    url(r'^ajax/currentPlaylist', views.current_playlist),
    url(r'^console/index', views.redirect_to_new_dradis),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login'),
    url(r'^$', views.interface),
)
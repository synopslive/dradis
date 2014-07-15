from django.conf.urls import patterns, include, url
from dradis.api import *
import views

sydroid_media_resource = SydroidMediaResource()
sydroid_playlist_resource = SydroidPlaylistResource()
sydroid_playlist_element_resource = SydroidPlaylistElementResource()

urlpatterns = patterns('',
    url(r'^ajax/medias', views.retreive_medias),
    url(r'^ajax/currentPlaylist', views.current_playlist),
    url(r'^console/index', views.redirect_to_new_dradis),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login'),
    url(r'^api/', include(sydroid_media_resource.urls)),
    url(r'^api/', include(sydroid_playlist_resource.urls)),
    url(r'^api/', include(sydroid_playlist_element_resource.urls)),
    url(r'^$', views.interface),
)
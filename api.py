from tastypie.resources import ModelResource
from dradis.models import SydroidMedia, SydroidPlaylist, SydroidPlaylistElement


class SydroidMediaResource(ModelResource):
    class Meta:
        always_return_data = True
        queryset = SydroidMedia.objects.all()
        resource_name = 'media'


class SydroidPlaylistResource(ModelResource):
    class Meta:
        always_return_data = True
        queryset = SydroidPlaylist.objects.all()
        resource_name = 'playlist'


class SydroidPlaylistElementResource(ModelResource):
    class Meta:
        always_return_data = True
        queryset = SydroidPlaylistElement.objects.all()
        resource_name = 'playlist-element'
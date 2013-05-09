# Create your views here.
from django.core import serializers
from django.db.models.query_utils import Q
from django.forms.models import model_to_dict
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from dradis.models import SydroidCurrentStack, SydroidPersistantStatus, SydroidMedia
import json, re

from django.conf import settings

def underscoreToCamel(match):
    return match.group()[0] + match.group()[2].upper()

def camelize(data):
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            new_key = re.sub(r"[a-z]_[a-z]", underscoreToCamel, key)
            new_dict[new_key] = camelize(value)
        return new_dict
    if isinstance(data, (list, tuple)):
        for i in range(len(data)):
            data[i] = camelize(data[i])
        return data
    return data

def retreive_medias(request):

    nb_count = int(request.GET.get('nb', 20))
    nb_from = int(request.GET.get('from', 0))
    search = request.GET.get('search', '')
    orderby = request.GET.get('orderby', 'id')
    if orderby == '': orderby = 'added_at'

    query = SydroidMedia.objects.filter(
        Q(filename__icontains = search) |
        Q(title__icontains = search) |
        Q(artist__icontains = search) |
        Q(album__icontains = search)
    ).order_by(orderby)

    json_serializer = serializers.get_serializer("json")()
    serialized = json.loads(json_serializer.serialize(query[nb_from:nb_from+nb_count], ensure_ascii=False))
    finalist = []
    for el in serialized:
        el['fields']['id'] = el['pk']
        finalist.append(el['fields'])

    raw = { 'countAll': query.count(), 'medias': camelize(finalist), 'from': nb_from, 'nb': nb_count }

    response = HttpResponse(json.dumps(raw, ensure_ascii=False), content_type="application/json; charset=utf-8")

    return response

def current_playlist(request):

    #slug = request.GET.get('slug', 'stA')

    #.filter(studio__slug = slug)
    curpos = SydroidPersistantStatus.objects.all()[0].curpos

    query = SydroidCurrentStack.objects.order_by("position").filter(position__gte = curpos - 3)

    finalist = []
    for el in query.all():
        obj = model_to_dict(el, fields=[field.name for field in el._meta.fields])
        if el.media_id:
            obj['media'] = model_to_dict(el.media, fields=[field.name for field in el.media._meta.fields])
        if el.action_id:
            obj['action'] = model_to_dict(el.action, fields=[field.name for field in el.action._meta.fields])
        finalist.append(obj)

    raw = { 'countAll': query.count(), 'stackElements': camelize(finalist) }

    response = HttpResponse(json.dumps(raw), content_type="application/json; charset=utf-8")

    return response

@login_required
def interface(request):
    return render(request, "interface.html", {'dradis_api_key': settings.SYDROID_API_KEY})


def redirect_to_new_dradis(request):
    return redirect("/")
from django.db import models

# Create your models here.
class SydroidPersistantStatus(models.Model):
    id = models.IntegerField(primary_key=True)
    curpos = models.IntegerField()
    class Meta:
        db_table = u'persistantstatus'


class SydroidMedia(models.Model):
    id = models.IntegerField(primary_key=True)
    path = models.CharField(max_length=500)
    filename = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255)
    length = models.IntegerField()
    added_at = models.IntegerField()
    updated_at = models.IntegerField()
    class Meta:
        db_table = u'media'

class SydroidAction(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=100)
    command = models.CharField(max_length=100)
    class Meta:
        db_table = u'action'

class SydroidCurrentStack(models.Model):
    id = models.IntegerField(primary_key=True)
    position = models.IntegerField()
    status = models.CharField(max_length=8)
    is_action = models.BooleanField()
    added_at = models.IntegerField()
    edited_at = models.IntegerField()
    on_air_since = models.IntegerField()
    #done_since = models.IntegerField()
    #skipped = models.BooleanField()
    #length_hint = models.IntegerField()
    commentaire = models.TextField()
    media = models.ForeignKey(SydroidMedia)
    action = models.ForeignKey(SydroidAction)
    #playlist = models.ForeignKey(SydroidPlaylist)
    class Meta:
        db_table = u'currentstack'
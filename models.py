from django.db import models


class SydroidPlaylist(models.Model):
    id = models.IntegerField(primary_key=True)
    curpos = models.IntegerField()
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=200)

    class Meta:
        db_table = u'sy_playlist'


class SydroidMedia(models.Model):
    id = models.IntegerField(primary_key=True)
    path = models.CharField(max_length=500)
    filename = models.CharField(max_length=255)
    title = models.CharField(max_length=255, null=True)
    artist = models.CharField(max_length=255, null=True)
    album = models.CharField(max_length=255, null=True)
    length = models.IntegerField()
    added_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = u'sy_media'


class SydroidAction(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=100)
    command = models.CharField(max_length=100)

    class Meta:
        db_table = u'sy_action'


class SydroidPlaylistElement(models.Model):
    id = models.IntegerField(primary_key=True)
    position = models.IntegerField()
    status = models.CharField(max_length=8)
    added_at = models.DateTimeField()
    edited_at = models.DateTimeField()
    on_air_since = models.DateTimeField()
    done_since = models.DateTimeField()
    skipped = models.BooleanField()
    length_hint = models.IntegerField()
    comment = models.TextField()
    media = models.ForeignKey(SydroidMedia)
    action = models.ForeignKey(SydroidAction)
    playlist = models.ForeignKey(SydroidPlaylist)

    class Meta:
        db_table = u'sy_playlist_element'


class SydroidStudio(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=10)
    jukebox = models.ForeignKey(SydroidPlaylist)
    jukebox_liqname = models.CharField(max_length=100)
    bed_id = models.ForeignKey(SydroidMedia)
    bed_on_air_since = models.DateTimeField()
    bed_liqname = models.CharField(max_length=100)

    fx_liqname = models.CharField(max_length=100)

    rec_show_liqname = models.CharField(max_length=100)
    rec_show_enabled = models.BooleanField()
    rec_show_active = models.BooleanField()
    rec_gold_liqname = models.CharField(max_length=100)
    rec_gold_enabled = models.BooleanField()
    rec_gold_active = models.BooleanField()

    selected = models.BooleanField()

    last_changed_at = models.DateTimeField()

    class Meta:
        db_table = u'sy_studio'
var zeroFill = function (number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(String(number)) ? 2 : 1)).join('0') + number;
    }
    return number;
}

Ember.onLoad('Ember.Application', function(Application) {
  Application.initializer({
    name: "tastypieModelAdapter",

    initialize: function(container, application) {
      application.register('serializer:application', DS.DjangoTastypieSerializer);
      application.register('serializer:_djangoTastypie', DS.DjangoTastypieSerializer);
      application.register('adapter:_djangoTastypie', DS.DjangoTastypieAdapter);
    }
  });
});

App = Ember.Application.create();

/* Models */

App.ApplicationAdapter = DS.DjangoTastypieAdapter.extend({
    namespace: 'api'
});

App.Media = DS.Model.extend({
    title: DS.attr(),
    album: DS.attr(),
    artist: DS.attr(),
    filename: DS.attr()
});

/* Routing */

App.Router.map(function() {
    this.resource('studio');
    this.resource('status');
});

/* Components */

App.Status = Ember.Object.extend({
    serverTime: 0,
    listeners: '?',

    _uri: 'ws://dradis.deux.synopslive.net/sydroid/',
    _ws: null,

    connect: function() {
        this._ws = new WebSocket(this._uri);

        this._ws.onopen = function() {
          console.log('Connected.');
          this.send("LOGIN=" + $("body").data("dradis-api-key"));
        };
        this._ws.onclose = function() {
          console.log('Disconnected.');
        };
        this._ws.onmessage = function(e) {
          var data = e.data;
          if(App.DEBUG == true) console.log(data);
          this.setProperties(JSON.parse(String(data)));
        }.bind(this);
    },

    sendMessage: function(message) {
        console.log("Sending", message);
        this._ws.send(JSON.stringify(message));
    },

    humanTime: function(){
        if(this.get('serverTime') > 0) {
            var date = new Date();
            date.setTime(+this.get('serverTime') * 1000);

            return zeroFill(date.getHours().toString(), 2)
                    + ":" + zeroFill(date.getMinutes().toString(), 2)
                    + ":" + zeroFill(date.getSeconds().toString(), 2);
        } else {
            return "??:??"
        }
    }.property('serverTime'),

    init: function() {
        this.connect();

        this._super();
    }
});

/* Main */

App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
        this.transitionTo('studio');
    }
});

App.StudioRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('media', {limit: 50});
    },

    renderTemplate: function() {
        this.render('components/play-list', {
            outlet: 'left'
        });
        this.render('studio', {
            outlet: 'main'
        });
    }
});

App.StudioController = Ember.ObjectController.extend({
   needs: ['statusBar'],
   actions: {
       refresh: function() {
          console.log("Refreshing...");
          this.get('controllers.statusBar.model').sendMessage({'command': 'rescan', 'id': 12});
       }
   }
});

App.StatusBarController = Ember.ObjectController.extend({
    status: Ember.computed.alias('model'),
    model: App.Status.create({})
});

App.MediaElementComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['media-element']
});


/*
TODO:
-better serialization/deserialization
-error handling if firebase contains malformed data, since we're not the only
ones who can write to it.
-multi part keys
*/

foam.CLASS({
  package: 'com.firebase',
  name: 'FirebaseDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.dao.ArraySink',
    'foam.net.HTTPRequest',
    'foam.net.EventSource'
  ],
  properties: [
    'of',
    'apppath',
    'secret',
    'eventSource_',
    {
      name: 'basepath',
      expression: function(apppath, of) {
        return apppath + of.id.replace(/\./g, '/');
      }
    }
  ],
  methods: [
    function put(obj) {
      var req = this.HTTPRequest.create();
      req.method = "PUT";
      req.url = this.basepath
        + "/"
        + encodeURIComponent(obj.id) + ".json";
      if ( this.secret ) {
        req.url += '?auth=' + encodeURIComponent(this.secret);
      }

      req.payload = JSON.stringify({ data: foam.json.stringify(obj) });
      req.headers['content-type'] = 'application/json';
      req.headers['accept'] = 'application/json';

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        return foam.json.parse(foam.json.parseString(JSON.parse(payload).data));
      }, function(resp) {
        // TODO: Handle various errors.
        return Promise.reject(foam.dao.InternalException.create());
      });
    },
    function remove(obj) {
      var req = this.HTTPRequest.create();
      req.method = "DELETE",
      req.url = this.basepath + "/" + encodeURIComponent(obj.id) + ".json";

      if ( this.secret ) {
        req.url += "?auth=" + encodeURIComponent(this.secret);
      }

      return req.send().then(function() {
        return Promise.resolve();
      }, function() {
        return Promise.reject(foam.dao.InternalException.create());
      });
    },
    function find(id) {
      var req = this.HTTPRequest.create();
      req.method = "GET";
      req.url = this.basepath + "/" + encodeURIComponent(id) + ".json";
      if ( this.secret ) {
        req.url += "?auth=" + encodeURIComponent(this.secret);
      }

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(data) {
        if ( data == "null" ) {
          return Promise.reject(foam.dao.ObjectNotFoundException.create({ id: id }));
        }
        try {
          return foam.json.parse(
            foam.json.parseString(
              JSON.parse(data).data));
        } catch(e) {
          return Promise.reject(foam.dao.InternalException.create());
        }
      });
    },
    function startEvents() {
      if ( this.eventSource_ ) {
        return;
      }

      this.eventSource_ = this.EventSource.create({
        uri: this.basepath + '.json?auth=' + this.secret
      })
      this.eventSource_.message.put.sub(this.onPut);
      this.eventSource_.message.patch.sub(this.onPatch);
      this.eventSource_.start();
    },
    function stopEvents() {
      if ( this.eventSource_ ) {
        this.eventSource_.close();
        this.eventSource_.message.put.unsub(this.onPut);
        this.eventSource_.message.patch.unsub(this.onPatch);
        this.clearProperty('eventSource_');
      }
    },
    function select(sink, skip, limit, order, predicate) {
      var req = this.HTTPRequest.create();
      req.method = "GET";
      req.url = this.basepath + ".json";
      if ( this.secret ) req.url += "?auth=" + encodeURIComponent(this.secret);

      // TODO: This should be streamed for better handling of large responses.
      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        var resultSink = sink || this.ArraySink.create();
        sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

        var data = JSON.parse(payload);
        var fc = this.FlowControl.create();

        for ( var key in data ) {
          if ( fc.stopped ) break;
          if ( fc.errorEvt ) {
            sink.error && sink.error(fc.errorEvt);
            future.set(sink);
            break;
          }

          var obj = foam.json.parse(
            foam.json.parseString(data[key].data));
          sink.put(obj, null, fc);
        }
        sink.eof();

        return resultSink;
      }.bind(this), function(resp) {
        var e = foam.dao.InternalException.create();
        sink.error(e);
        return Promise.reject(e);
      });
    },
    function sub(firstTopic) {
      this.SUPER.apply(this, arguments);

      if ( firstTopic === 'on' ) {
        // TODO: No reliably way to detect unsubscribes yet
        // so we don't know when to stop streaming events.
        this.startEvents();
      }
    },
  ],
  listeners: [
    function onPut(s, _, _, data) {
      // PATH is one of
      // / -> new objects
      // /key -> new object
      // /key/data -> updated object

      var path = data.path;
      if ( path == "/" ) {
        // All data removed?
        if ( data.data == null ) {
          this.on.reset.pub();
          return;
        }

        for ( var key in data.data ) {
          var obj = foam.json.parse(foam.json.parseString(data.data[key].data));
          this.on.put.pub(obj);
        }
        return;
      } else if ( path.lastIndexOf('/') === 0 ) {
        if ( data.data == null ) {
          var obj = this.of.create();
          obj.id = path.substring(1)
          this.on.remove.pub(obj);
          return;
        }
        var obj = foam.json.parse(foam.json.parseString(data.data.data));
        this.on.put.pub(obj);
      } else if ( path.indexOf('/data') === path.length - 5 ) {
        var obj = foam.json.parse(foam.json.parseString(data.data));
        this.on.put.pub(obj);
      } else {
        debugger;
      }
    },
    function onPatch(s, _, _, data) {
          // TODO: What does a patch even look like?
      debugger;
    },
    function onEvent(s, _, event) {
      // TODO: handle removes.
      if ( event.name == "put" ) {
        console.log("*** Received event", event);
        event.data = JSON.parse(event.data);
        var path = event.data.path;

        if ( event.data.data == null ) {
          this.notify_("remove", [this.of.create({ id: path.split('/')[1] })]);
        } else if ( path == '/' ) {
          for ( var key in event.data.data ) {
            this.find(key, {
              put: function(obj) {
                this.notify_("put", [obj]);
              }.bind(this),
              error: function() {
                console.error("Failed to find object after notification", event);
              }
            });
          }
        } else {
          path = path.split('/');
          var id = path[1];

          this.find(id, {
            put: function(obj) {
              this.notify_("put", [obj]);
            }.bind(this),
            error: function() {
              console.error("Failed to find object after notification", event);
            }
          });
        }
      } else if ( event.name == "patch" ) {
        // TODO
      } else {
        console.log("Ignored event", event.name);
      }
    }
  ]
});

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
TODO:
-better serialization/deserialization
-error handling if firebase contains malformed data, since we're not the only
ones who can write to it.
-multi part keys
*/

foam.CLASS({
  package: 'com.firebase',
  name: 'ExpectedObjectNotFound',
  extends: 'foam.dao.InternalException'
});

foam.CLASS({
  package: 'com.firebase',
  name: 'FirebaseDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.net.web.HTTPRequest',
    'com.firebase.FirebaseEventSource',
    'foam.mlang.predicate.Gt',
    'foam.mlang.Constant'
  ],

  properties: [
    'of',
    'apppath',
    'secret',
    'eventSource_',
    {
      name: 'timestampProperty'
    },
    {
      name: 'basepath',
      expression: function(apppath, of) {
        return apppath + of.id.replace(/\./g, '/');
      }
    },
    {
      class: 'Boolean',
      name: 'enableStreaming',
      value: true
    },
    'startEventsAt_'
  ],

  methods: [
    function put_(x, obj) {
      var req = this.HTTPRequest.create();

      if ( obj.id ) {
        req.method = "PUT";
        req.url = this.basepath
          + "/"
          + encodeURIComponent(obj.id) + ".json";
      } else {
        throw new Error('Server generated IDs not supported.');
        // req.method = 'POST';
        // req.url = this.basepath + '.json';
      }

      if ( this.secret ) {
        req.url += '?auth=' + encodeURIComponent(this.secret);
      }

      req.payload = JSON.stringify({
        data: foam.json.stringify(obj),
        lastUpdate: {
          ".sv": "timestamp"
        }
      });
      req.headers['content-type'] = 'application/json';
      req.headers['accept']       = 'application/json';

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        payload = JSON.parse(payload);

        //        if ( obj.id ) {
        var o2 = foam.json.parseString(payload.data, this);
          if ( this.timestampProperty ) {
            this.timestampProperty.set(o2, payload.lastUpdate);
          }
          return o2;
        //        } else {
        //           Server created id
        //        }
      }.bind(this), function(resp) {
        // TODO: Handle various errors.
        return Promise.reject(foam.dao.InternalException.create());
      });
    },

    function remove_(x, obj) {
      var req = this.HTTPRequest.create();
      req.method = 'DELETE',
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

    function find_(x, id) {
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
          return Promise.resolve(null);
        }
        try {
          data = JSON.parse(data);

          var obj = foam.json.parseString(data.data, this);

          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data.lastUpdate);
          }

          return obj;
        } catch(e) {
          return Promise.reject(foam.dao.InternalException.create());
        }
      }.bind(this));
    },

    function startEvents() {
      if ( this.eventSource_ || ! this.enableStreaming ) {
        return;
      }

      var params = [];
      if ( this.secret ) params.push(['auth', this.secret]);
      if ( this.startEventsAt_ ) {
        params.push(['orderBy', '"lastUpdate"']);
        params.push(['startAt', this.startEventsAt_]);
      }

      var uri = this.basepath + '.json';
      if ( params.length ) {
        uri += '?' + params.map(function(p) { return p.map(encodeURIComponent).join('='); }).join('&');
      }

      this.eventSource_ = this.FirebaseEventSource.create({
        uri: uri
      });

      this.eventSource_.put.sub(this.onPut);
      this.eventSource_.patch.sub(this.onPatch);
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

    function select_(x, sink, skip, limit, order, predicate) {
      var req = this.HTTPRequest.create();
      req.method = "GET";

      var params = [];
      if ( this.secret ) params.push(['auth', this.secret]);

      // Efficiently handle GT(lastupdate, #) queries.  Used by the SyncDAO to get
      // all changes.

      if ( predicate && this.timestampProperty &&
           this.Gt.isInstance(predicate) &&
           this.Constant.isInstance(predicate.arg2) &&
           predicate.arg1 === this.timestampProperty ) {

        // TODO: This is a hack to ensure that
        if ( ! this.startEventsAt_ )  {
          this.startEventsAt_ = predicate.arg2.f() + 1;
          this.startEvents();
        }

        params.push(['orderBy', '"lastUpdate"']);
        params.push(['startAt', predicate.arg2.f() + 1]);
      }

      var url = this.basepath + '.json';
      if ( params.length ) {
        url += '?' + params.map(function(p) { return p.map(encodeURIComponent).join('='); }).join('&');
      }

      req.url = url;

      var resultSink = sink || this.ArraySink.create();
      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      // TODO: This should be streamed for better handling of large responses.
      return req.send().then(function(resp) {
        if ( ! resp.success ) {
          return Promise.reject(foam.dao.InternalException.create());
        }
        return resp.payload;
      }).then(function(payload) {
        var data = JSON.parse(payload);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { detached = true; });

        for ( var key in data ) {
          if ( detached ) break;

          var obj = foam.json.parseString(data[key].data, this);
          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data[key].lastUpdate);
          }

          sink.put(obj, sub);
        }
        sink.eof();

        return resultSink;
      }.bind(this), function(resp) {
        var e = foam.dao.InternalException.create();
        return Promise.reject(e);
      });
    }
  ],

  listeners: [
    function onPut(s, _, data) {
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
          var obj = foam.json.parseString(data.data[key].data, this);
          if ( this.timestampProperty ) {
            this.timestampProperty.set(obj, data.data[key].lastUpdate);
          }
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
        var obj = foam.json.parseString(data.data.data, this);
        if ( this.timestampProperty ) {
          this.timestampProperty.set(obj, data.data.lastUpdate);
        }
        this.on.put.pub(obj);
      } else if ( path.indexOf('/data') === path.length - 5 ) {
        // These last two events shouldn't happen unless somebody is editing
        // the underlying firebase data by hand.

        // Data of an existing row updated.
        debugger;
        var id = path.substring(1);
        id = id.substring(0, id.indexOf('/'));
        this.find(id).then(function(obj) {
          if ( ! obj ) throw com.firebase.ExpectedObjectNotFound.create();
          this.on.put.pub(obj);
        }.bind(this));

        // var obj = foam.json.parseString(data.data, this);
        // this.on.put.pub(obj);
      } else if ( path.indexOf('/lastUpdate') === path.length - 11 ) {
        // Timestamp of an existing row updated, do anything?
        // presumably if the object itself hasn't been updated we don't care
        // if it has been updated we should get an event for that.

        debugger;
        var id = path.substring(1);
        id = id.substring(0, id.indexOf('/'));
        this.find(id).then(function(obj) {
          if ( ! obj ) throw com.firebase.ExpectedObjectNotFound.create();
          this.on.put.pub(obj);
        }.bind(this));
      }
    },

    function onPatch(s, _, __, data) {
          // TODO: What does a patch even look like?
      debugger;
    }
  ]
});


foam.CLASS({
  package: 'com.firebase',
  name: 'SafariFirebaseDAO',
  extends: 'com.firebase.FirebaseDAO',

  requires: [
    'foam.net.web.XMLHTTPRequest as HTTPRequest',
    'foam.net.web.SafariEventSource as EventSource'
  ],

  properties: [
    [ 'enableStreaming', false ]
  ]
});


foam.CLASS({
  package: 'com.firebase',
  name: 'FirebaseEventSource',

  requires: [
    'foam.net.web.EventSource'
  ],

  topics: [
    'put',
    'patch',
    'keep-alive',
    'cancel',
    'auth_revoked'
  ],

  properties: [
    {
      name: 'uri',
      required: true
    },
    {
      name: 'eventSource',
      postSet: function(old, nu) {
        nu.message.sub(this.onMessage);
      },
      factory: function() {
        return this.EventSource.create({
          uri: this.uri
        });
      }
    },
    {
      class: 'String',
      name: 'buffer'
    }
  ],

  methods: [
    function start() {
      this.eventSource.start();
    }
  ],

  listeners: [
    function onMessage(s, msg, name, data) {
      switch (name) {
      case 'put':
        this.onPut(name, data);
        break;
      case 'patch':
        this.onPatch(name, data);
        break;
      case 'keep-alive':
        this.onKeepAlive(name, data);
        break;
      case 'cancel':
        this.onCancel(name, data);
        break;
      case 'auth_revoked':
        this.onAuthRevoked(name, data);
        break;
      default:
        this.onUnknown(name, data);
      }
    },

    function onPut(name, data) {
      this.put.pub(JSON.parse(data));
      return;

      // this.buffer += data;
      // try {
      //   var payload = JSON.parse(this.buffer);
      // } catch(e) {
      //   this.__context__.warn('Failed to parse payload, assuming its incomplete.', e, this.buffer.length);
      //   return;
      // }

      // this.buffer = '';
      // this.put.pub(payload);
    },

    function onPatch() {
      debugger;
    },

    function onKeepAlive() {
    },

    function onCancel() {
    },

    function onUnknown(name, data) {
      this.__context__.warn('Unknown firebase event', name, data);
    }
  ]
});

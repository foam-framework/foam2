/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao',
  name: 'RestDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: function() {/*
    A client-side DAO for interacting with a REST endpoint.

    Sinks are managed on the client (i.e., sinks passed to
    select() will not serialize the sink and send it to the
    endpoint for server-side logic implementation).
  */},

  requires: [
    'foam.core.Serializable',
    'foam.dao.ArraySink',
    'foam.json.Outputter',
    'foam.net.HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'baseURL',
      documentation: 'URL for most rest calls. Some calls add "/<some-info>".',
      final: true,
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() {
        // NOTE: Configuration must be consistent with parser in
        // corresponding foam.net.node.RestDAOHandler.
        return this.Outputter.create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          strict: true,
          propertyPredicate: function(o, p) { return ! p.networkTransient; }
        });
      }
    }
  ],

  methods: [
    function put_(x, o) {
      /**
       * PUT baseURL
       * <network-foam-jsonified FOAM object>
       */
      return this.createRequest_({
        method: 'PUT',
        url: this.baseURL,
        payload: this.outputter.stringify(o)
      }).send().then(this.onResponse.bind(this, 'put'))
          .then(this.onPutResponse);
    },

    function remove_(x, o) {
      /**
       * DELETE baseURL/<network-foam-jsonified FOAM object id>
       */
      return this.createRequest_({
        method: 'DELETE',
        url: this.baseURL + '/' +
            encodeURIComponent(this.outputter.stringify(o.id))
      }).send().then(this.onResponse.bind(this, 'remove'))
          .then(this.onRemoveResponse);
    },

    function find_(x, key) {
      /**
       * GET baseURL/<network-foam-jsonified FOAM object id>
       */
      var id = this.of.isInstance(key) ? key.id : key;
      return this.createRequest_({
        method: 'GET',
        url: this.baseURL + '/' +
            encodeURIComponent(this.outputter.stringify(id))
      }).send().then(this.onResponse.bind(this, 'find'))
          .then(this.onFindResponse);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      /**
       * GET baseURL
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var payload = {};

      var networkSink = this.Serializable.isInstance(sink) && sink;
      if ( networkSink )
        payload.sink = networkSink;

      if ( typeof skip !== 'undefined' )
        payload.skip = skip;
      if ( typeof limit !== 'undefined' )
        payload.limit = limit;
      if ( typeof order !== 'undefined' )
        payload.order = order;
      if ( typeof predicate !== 'undefined' )
        payload.predicate = predicate;

      return this.createRequest_({
        method: 'POST',
        url: this.baseURL + ':select',
        payload: this.outputter.stringify(payload)
      }).send().then(this.onResponse.bind(this, 'select'))
          .then(this.onSelectResponse.bind(
              this, sink || this.ArraySink.create()));
    },

    function removeAll_(x, skip, limit, order, predicate) {
      /**
       * POST baseURL/removeAll
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var payload = {};
      if ( typeof skip  !== 'undefined' ) payload.skip = skip;
      if ( typeof limit !== 'undefined' ) payload.limit = limit;
      if ( typeof order !== 'undefined' ) payload.order = order;
      if ( typeof predicate !== 'undefined' ) payload.predicate = predicate;

      return this.createRequest_({
        method: 'POST',
        url: this.baseURL + ':removeAll',
        payload: this.outputter.stringify(payload)
      }).send().then(this.onResponse.bind(this, 'removeAll'))
          .then(this.onRemoveAllResponse);
    },

    function createRequest_(o) {
      // Demand that required properties are set before using DAO.
      this.validate();
      // Each request should default to a json responseType.
      return this.HTTPRequest.create(Object.assign({responseType: 'json'}, o));
    }
  ],

  listeners: [
    function onResponse(name, response) {
      if ( response.status !== 200 ) {
        throw new Error(
          'Unexpected ' + name + ' response code from REST DAO endpoint: ' +
            response.status);
      }
      return response.payload;
    },

    function onPutResponse(payload) {
      var o = foam.json.parse(payload);
      this.pub('on', 'put', o);
      return o;
    },

    function onRemoveResponse(payload) {
      var o = foam.json.parse(payload);
      if ( o !== null ) this.pub('on', 'remove', o);
      return o;
    },

    function onFindResponse(payload) {
      return foam.json.parse(payload);
    },

    function onSelectResponse(localSink, payload) {
      var wasSerializable = this.Serializable.isInstance(localSink);
      var remoteSink = foam.json.parse(payload);

      // If not proxying a local unserializable sink, just return the remote.
      if ( wasSerializable ) return remoteSink;

      var array = remoteSink.array;
      if ( ! array )
        throw new Error('Expected ArraySink from REST endpoint when proxying local sink');

      if ( localSink.put ) {
        var sub = foam.core.FObject.create();
        var detached = false;
        sub.onDetach(function() { detached = true; });
        for ( var i = 0; i < array.length; i++ ) {
          localSink.put(array[i], sub);
          if ( detached ) break;
        }
      }
      if ( localSink.eof ) localSink.eof();

      return localSink;
    },

    function onRemoveAllResponse(payload) {
      return undefined;
    }
  ]
});

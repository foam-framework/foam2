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
  package: 'com.google.cloud.datastore',
  name: 'SelectData',

  documentation: `State passed around by intermediate callbacks during a
      select() in progress. These data must be retained to notify the sink, send
      the correct payload to subsequent API calls, and return results in the
      Promise.`,

  properties: [
    {
      name: 'ctx'
    },
    {
      name: 'sink'
    },
    {
      name: 'requestPayload'
    },
    {
      class: 'Array',
      name: 'results'
    },
    {
      class: 'Boolean',
      name: 'halted'
    },
    {
      name: 'sub',
      factory: function() {
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { this.halted = true; }.bind(this));
        return sub;
      }
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DatastoreDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: `DAO implementation for the Google Cloud Datastore v1 REST API.

      https://cloud.google.com/datastore/docs/reference/rest/

      This implementation uses structured queries, not GQL queries.`,

  requires: [
    'com.google.cloud.datastore.SelectData',
    'foam.dao.ArraySink',
    'foam.net.HTTPRequest'
  ],
  imports: [
    'gcloudProjectId?',
    'datastoreNamespaceId?'
  ],

  constants: {
    INT32_MAX: Math.pow(2, 31) - 1
  },

  properties: [
    {
      class: 'String',
      name: 'projectId',
      factory: function() {
        foam.assert(this.gcloudProjectId, 'DatastoreDAO missing ' +
            '"gcloudProjectId" from context or "projectId" on construction');
        return this.gcloudProjectId;
      },
      final: true
    },
    {
      class: 'String',
      name: 'namespaceId',
      factory: function() {
        return this.datastoreNamespaceId || '';
      },
      final: true
    },
    {
      class: 'String',
      name: 'protocol',
      value: 'https',
      final: true
    },
    {
      class: 'String',
      name: 'host',
      value: 'datastore.googleapis.com',
      final: true
    },
    {
      class: 'Int',
      name: 'port',
      value: 443,
      final: true
    },
    {
      class: 'String',
      name: 'baseURL',
      factory: function() {
        return this.protocol + '://' + this.host + ':' + this.port +
            '/v1/projects/' + this.projectId;
      }
    },
    {
      name: 'partitionId_',
      factory: function() {
        return this.namespaceId ?
            { projectId: this.projectId, namespaceId: this.namespaceId } :
            { projectId: this.projectId };
      }
    }
  ],

  methods: [
    function sendRequest(name, objPayload) {
      return this.getRequest(name, objPayload && JSON.stringify(objPayload))
          .send();
    },
    function getRequest(name, payload) {
      var headers = { Accept: 'application/json' };
      if ( payload ) headers['Content-Type'] = 'application/json';
      return this.HTTPRequest.create({
        method: 'POST',
        url: this.baseURL + ':' + name,
        headers: headers,
        responseType: 'json',
        payload: payload
      });
    },

    function find_(x, idOrObj) {
      var key = foam.core.FObject.isInstance(idOrObj) ?
          idOrObj.getDatastoreKey(this.partitionId_) :
          this.getDatastoreKeyFromId_(idOrObj, this.partitionId_);
      return this.sendRequest('lookup', { keys: [ key ] })
          .then(this.onResponse.bind(this, 'find'))
          .then(this.onFindResponse.bind(this, x));
    },
    function put_(x, o) {
      return this.sendRequest('commit', {
        mode: 'NON_TRANSACTIONAL',
        mutations: [ { upsert: o.toDatastoreEntity(this.partitionId_) } ]
      }).then(this.onResponse.bind(this, 'put'))
          .then(this.onPutResponse.bind(this, x, o));
    },
    function remove_(x, o) {
      return this.sendRequest('commit', {
        mode: 'NON_TRANSACTIONAL',
        mutations: [ { delete: o.getDatastoreKey(this.partitionId_) } ]
      }).then(this.onResponse.bind(this, 'remove'))
          .then(this.onRemoveResponse.bind(this, x, o));
    },
    function select_(x, sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      var payload = { query: { kind: [
        this.of.getClassDatastoreKind()
      ] } };
      var query = payload.query;
      payload.partitionId = this.partitionId_;
      if ( predicate ) query.filter = predicate.toDatastoreFilter();
      if ( order ) query.order = order.toDatastoreOrder();
      if ( skip ) query.offset = Math.min(skip, this.INT32_MAX);
      if ( limit ) query.limit = Math.min(limit, this.INT32_MAX);
      // Optional Sink interface extension:
      // Allow datastore-aware sinks to decorate query.
      if ( sink.decorateDatastoreQuery )
        sink.decorateDatastoreQuery(query);

      return this.sendRequest('runQuery', payload)
          .then(this.onResponse.bind(this, 'select'))
          .then(this.onSelectResponse.bind(
              this, this.SelectData.create({
                ctx: x,
                sink: sink,
                requestPayload: payload
              })));
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.select_(x, undefined, skip, limit, order, predicate)
          .then(this.onRemoveAll);
    },

    {
      name: 'getDatastoreKeyFromId_',
      documentation: `Helper for find() to construct the appropriate :lookup
        Datastore query.`,
      code: function(id, partitionId) {
        return {
          partitionId: partitionId,
          path: [ {
            kind: this.of.getOwnClassDatastoreKind(),
            name: com.google.cloud.datastore.toDatastoreKeyName(id)
          } ]
        };
      }
    },
    {
      name: 'selectNextBatch_',
      documentation: `Massage data.query and re-issue Datastore :runQuery to get
        the next batch of results requested by select().`,
      code: function(data, batch) {
        var payload = data.requestPayload;
        var query = payload.query;

        payload.partitionId = this.partitionId_;

        // Update query to get next batch of results.
        if ( query.offset )
          query.offset = query.offset - ( batch.skippedResults || 0 );
        if ( query.limit ) {
          query.limit = query.limit -
              ( batch.entityResults ? batch.entityResults.length : 0 );
        }
        query.startCursor = batch.endCursor;

        return this.sendRequest('runQuery', payload)
            .then(this.onResponse.bind(this, 'select'))
            .then(this.onSelectResponse.bind(this, data));
      }
    },
    {
      name: 'resultsAreIncomplete_',
      documentation: `Determine whether or not a batch contains the last results
        in a (potentially "limit"ed) query result. Abstracted out of
        onSelectResponse() to support faked batching in tests.`,
      code: function(batch, data) {
        return ( ! data.halted ) && batch.entityResults &&
            batch.entityResults.length > 0 &&
            ( batch.moreResults === 'NOT_FINISHED' ||
              batch.moreResults === 'MORE_RESULTS_AFTER_CURSOR' );
      }
    }
  ],

  listeners: [
    function onRemoveAll(arraySink) {
      var arr = arraySink.array;
      if ( arr.length === 0 ) return undefined;

      return this.sendRequest('beginTransaction')
          .then(this.onResponse.bind(this, 'removeAll transaction'))
          .then(this.onRemoveAllTransactionResponse.bind(this, arr));
    },

    function onResponse(name, response) {
      if ( response.status !== 200 ) {
        return response.payload.then(function(payload) {
          throw new Error('Unexpected ' + name + ' response code from Cloud ' +
              'Datastore endpoint: ' + response.status + '\nPayload: ' +
              JSON.stringify(payload, null, 2));
        }, function(error) {
          throw new Error('Unexpected ' + name + ' response code from Cloud ' +
              'Datastore endpoint: ' + response.status +
              '\nError retrieving payload: ' + error);
        });
      }

      return response.payload;
    },
    function onFindResponse(x, json) {
      if ( ! ( json.found && json.found[0] && json.found[0].entity ) )
        return null;
      if ( json.found.length > 1 ) {
        throw new Error('Multiple Cloud Datastore entities match ' +
            'unique id');
      }

      return com.google.cloud.datastore.fromDatastoreEntity(
          json.found[0].entity, x);
    },
    function onPutResponse(x, o, json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Put to Cloud Datastore yielded conflict');
      }

      var newO = o.cls_.create(o, x);
      this.pub('on', 'put', newO);
      return newO;
    },
    function onRemoveResponse(x, o, json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Remove from Cloud Datastore yielded conflict');
      }

      var newO = o.cls_.create(o, x);

      // Cloud Datastore will provide results with version numbers even if
      // the entity did not exist. Use indexUpdates defined-and-non-0 as a
      // proxy found-and-deleted.
      if ( json.indexUpdates ) {
        this.pub('on', 'remove', newO);
      }
      return newO;
    },
    function onSelectResponse(data, json) {
      var batch = json.batch;
      var entities = batch.entityResults;

      if ( ! entities ) {
        data.sink && data.sink.eof && data.sink.eof();
        return data.sink;
      }

      // Optional Sink interface extension:
      // Allow datastore-aware sinks to unpack query result batches manually
      // instead of DAO put()ing to them.
      if ( data.sink && data.sink.fromDatastoreEntityResults ) {
        data.sink.fromDatastoreEntityResults(entities, data.ctx);
      } else {
        var fromDatastoreEntity =
            com.google.cloud.datastore.fromDatastoreEntity;
        for ( var i = 0; i < entities.length; i++ ) {
          var obj = fromDatastoreEntity(entities[i].entity, data.ctx);
          data.results.push(obj);
          data.sink && data.sink.put && data.sink.put(obj, data.sub);
          if ( data.halted ) break;
        }
      }

      if ( this.resultsAreIncomplete_(batch, data) ) {
        return this.selectNextBatch_(data, batch);
      } else {
        data.sink && data.sink.eof && data.sink.eof();
        return data.sink;
      }
    },
    function onRemoveAllTransactionResponse(arr, json) {
      var transaction = json.transaction;
      var deletes = new Array(arr.length);
      for ( var i = 0; i < deletes.length; i++ ) {
        deletes[i] = { delete: arr[i].getDatastoreKey(this.partitionId_) };
      }

      return this.sendRequest('commit', {
        mode: 'TRANSACTIONAL',
        mutations: deletes,
        transaction: transaction
      }).then(this.onResponse.bind(this, 'removeAll commit'))
          .then(this.onRemoveAllResponse);
    },
    function onRemoveAllResponse(json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Remove from Cloud Datastore yielded conflict');
      }
    }
  ]
});

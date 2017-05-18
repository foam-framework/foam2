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

  documentation: function() {/*
                               State passed around by intermediate callbacks
                               during a select() in progress. These data must
                               be retained to notify the sink, send the
                               correct payload to subsequent API calls, and
                               return results in the Promise.
                              */},

  properties: [
    {
      name: 'sink'
    },
    {
      name: 'requestPayload'
    },
    {
      class: 'Array',
      name: 'results'
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DatastoreDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: function() {/*
                               DAO implementation for the Google Cloud
                               Datastore v1 REST API.

                               https://cloud.google.com/datastore/docs/reference/rest/

                               This implementation uses structured queries,
                               not GQL queries.
                              */},

  requires: [
    'com.google.cloud.datastore.SelectData',
    'foam.dao.ArraySink',
    'foam.net.HTTPRequest'
  ],
  imports: [ 'gcloudProjectId?' ],

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
    }
  ],

  methods: [
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

    function find(idOrObj) {
      var key = foam.core.FObject.isInstance(idOrObj) ?
          idOrObj.getDatastoreKey() : this.getDatastoreKeyFromId_(idOrObj);
      return this.getRequest('lookup', JSON.stringify({ keys: [ key ] })).send()
          .then(this.onResponse.bind(this, 'find')).then(this.onFindResponse);
    },
    function put(o) {
      return this.getRequest('commit', JSON.stringify({
        mode: 'NON_TRANSACTIONAL',
        mutations: [ { upsert: o.toDatastoreEntity() } ]
      })).send().then(this.onResponse.bind(this, 'put'))
          .then(this.onPutResponse.bind(this, o));
    },
    function remove(o) {
      return this.getRequest('commit', JSON.stringify({
        mode: 'NON_TRANSACTIONAL',
        mutations: [ { delete: o.getDatastoreKey() } ]
      })).send().then(this.onResponse.bind(this, 'remove'))
          .then(this.onRemoveResponse.bind(this, o));
    },
    function select(sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      var payload = { query: { kind: [
        this.of.getClassDatastoreKind()
      ] } };
      var query = payload.query;
      if ( predicate ) query.filter = predicate.toDatastoreFilter();
      if ( order ) query.order = order.toDatastoreOrder();
      if ( skip ) query.offset = skip;
      if ( limit ) query.limit = limit;

      return this.getRequest('runQuery', JSON.stringify(payload)).send()
          .then(this.onResponse.bind(this, 'select'))
          .then(this.onSelectResponse.bind(
              this, this.SelectData.create({
                sink: sink,
                requestPayload: payload
              })));
    },
    function removeAll(skip, limit, order, predicate) {
      return this.select(undefined, skip, limit, order, predicate)
          .then(this.onRemoveAll);
    },

    {
      name: 'getDatastoreKeyFromId_',
      documentation: `Helper for find() to construct the appropriate :lookup
        Datastore query.`,
      code: function(id) {
        return { path: [ {
          kind: this.of.getOwnClassDatastoreKind(),
          name: com.google.cloud.datastore.toDatastoreKeyName(id)
        } ] };
      }
    },
    {
      name: 'selectNextBatch_',
      documentation: `Massage data.query and re-issue Datastore :runQuery to get
        the next batch of results requested by select().`,
      code: function(data, batch) {
        var payload = data.requestPayload;
        var query = payload.query;

        // Update query to get next batch of results.
        if ( query.offset )
          query.offset = query.offset - ( batch.skippedResults || 0 );
        if ( query.limit ) {
          query.limit = query.limit -
              ( batch.entityResults ? batch.entityResults.length : 0 );
        }
        query.startCursor = batch.endCursor;

        return this.getRequest('runQuery', JSON.stringify(payload)).send()
            .then(this.onResponse.bind(this, 'select'))
            .then(this.onSelectResponse.bind(this, data));
      }
    },
    {
      name: 'resultsAreIncomplete_',
      documentation: `Determine whether or not a batch contains the last results
        in a (potentially "limit"ed) query result. Abstracted out of
        onSelectResponse() to support faked batching in tests.`,
      code: function(batch) {
        return batch.entityResults && batch.entityResults.length > 0 &&
            ( batch.moreResults === 'NOT_FINISHED' ||
              batch.moreResults === 'MORE_RESULTS_AFTER_CURSOR' );
      }
    }
  ],

  listeners: [
    function onRemoveAll(arraySink) {
      var arr = arraySink.array;
      if ( arr.length === 0 ) return undefined;

      return this.getRequest('beginTransaction').send()
          .then(this.onResponse.bind(this, 'removeAll transaction'))
          .then(this.onRemoveAllTransactionResponse.bind(this, arr));
    },

    function onResponse(name, response) {
      if ( response.status !== 200 ) {
        throw new Error('Unexpected ' + name + ' response code from Cloud ' +
            'Datastore endpoint: ' + response.status);
      }
      return response.payload;
    },
    function onFindResponse(json) {
      if ( ! ( json.found && json.found[0] && json.found[0].entity ) )
        return null;
      if ( json.found.length > 1 ) {
        throw new Error('Multiple Cloud Datastore entities match ' +
            'unique id');
      }

      return com.google.cloud.datastore.fromDatastoreEntity(
          json.found[0].entity);
    },
    function onPutResponse(o, json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Put to Cloud Datastore yielded conflict');
      }

      this.pub('on', 'put', o);
      return o;
    },
    function onRemoveResponse(o, json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Remove from Cloud Datastore yielded conflict');
      }

      // Cloud Datastore will provide results with version numbers even if
      // the entity did not exist. Use indexUpdates defined-and-non-0 as a
      // proxy found-and-deleted.
      if ( json.indexUpdates ) {
        this.pub('on', 'remove', o);
      }
      return o;
    },
    function onSelectResponse(data, json) {
      var batch = json.batch;
      var entities = batch.entityResults;

      if ( ! entities ) {
        data.sink && data.sink.eof && data.sink.eof();
        return data.sink;
      }

      var fromDatastoreEntity = com.google.cloud.datastore.fromDatastoreEntity;
      for ( var i = 0; i < entities.length; i++ ) {
        var obj = fromDatastoreEntity(entities[i].entity);
        data.results.push(obj);
        data.sink && data.sink.put && data.sink.put(obj);
      }

      if ( this.resultsAreIncomplete_(batch) ) {
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
        deletes[i] = { delete: arr[i].getDatastoreKey() };
      }

      this.getRequest('commit', JSON.stringify({
        mode: 'TRANSACTIONAL',
        mutations: deletes,
        transaction: transaction
      })).send().then(this.onResponse.bind(this, 'removeAll commit'))
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

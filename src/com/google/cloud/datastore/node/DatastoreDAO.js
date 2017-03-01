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
  package: 'com.google.cloud.datastore.node',
  name: 'SelectData',

  properties: [
    {
      class: 'Function',
      name: 'resolve'
    },
    {
      class: 'Function',
      name: 'reject'
    },
    {
      name: 'sink'
    },
    {
      name: 'requestPayload'
    },
    {
      name: 'results',
      factory: function() { return []; }
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore.node',
  name: 'DatastoreDAO',
  extends: 'foam.dao.AbstractDAO',

  imports: [ 'projectId' ],

  properties: [
    {
      class: 'String',
      name: 'protocol',
      value: 'https:'
    },
    {
      class: 'String',
      name: 'host',
      value: 'datastore.googleapis.com'
    },
    {
      class: 'Int',
      name: 'port',
      value: 443
    },
    {
      name: 'http',
      factory: function() {
        return this.protocol === 'https:' ? require('https') : require('http');
      }
    }
  ],

  methods: [
    function find(id) {
      var self = this;
      var key = foam.core.FObject.isInstance(id) ?
          id.getDatastoreKey() : this.getDatastoreKeyFromId(id);
      var req = this.http.request({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        method: 'POST',
        path: '/v1/projects/' + this.projectId + ':lookup',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return new Promise(function(resolve, reject) {
        req.on('aborted', self.onFindAborted.bind(self, reject));
        req.on('response', self.onFindResponse.bind(self, resolve, reject));
        req.write(JSON.stringify({ keys: [ key ] }));
        req.end();
      });
    },
    function put(o) {
      var self = this;
      var req = this.http.request({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        method: 'POST',
        path: '/v1/projects/' + this.projectId + ':commit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return new Promise(function(resolve, reject) {
        req.on('aborted', self.onPutAborted.bind(self, reject));
        req.on('response', self.onPutResponse.bind(self, resolve, reject, o));
        req.write(JSON.stringify({
          mode: 'NON_TRANSACTIONAL',
          mutations: [ { upsert: o.toDatastoreEntity() } ]
        }));
        req.end();
      });
    },
    function remove(o) {
      var self = this;
      var req = this.http.request({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        method: 'POST',
        path: '/v1/projects/' + this.projectId + ':commit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return new Promise(function(resolve, reject) {
        req.on('aborted', self.onRemoveAborted.bind(self, reject));
        req.on('response', self.onRemoveResponse.bind(self, resolve, reject, o));
        req.write(JSON.stringify({
          mode: 'NON_TRANSACTIONAL',
          mutations: [ { delete: o.getDatastoreKey() } ]
        }));
        req.end();
      });
    },
    function select(sink, skip, limit, order, predicate) {
      var self = this;
      var req = this.http.request({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        method: 'POST',
        path: '/v1/projects/' + this.projectId + ':runQuery',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return new Promise(function(resolve, reject) {
        var payload = { query: { kind: [
          self.of.getClassDatastoreKind()
        ] } };
        var query = payload.query;
        if ( predicate ) query.filter = predicate.toDatastoreFilter();
        if ( order ) query.order = order.toDatastoreOrder();
        if ( skip ) query.offset = skip;
        if ( limit ) query.limit = limit;

        req.on('aborted', self.onSelectAborted.bind(self, reject));
        req.on('response', self.onSelectResponse.bind(
            self, self.SelectData.create({
              resolve: resolve,
              reject: reject,
              sink: sink,
              requestPayload: payload
            })));

        req.write(JSON.stringify(payload));
        req.end();
      });
    },

    function getDatastoreKeyFromId(id) {
      return { path: [ {
        kind: this.of.getOwnClassDatastoreKind(),
        name: id
      } ] };
    },

    function onFindAborted(reject) {
      reject(new Error('Cloud Datastore endpoint aborted HTTP request'));
    },
    function onFindResponse(resolve, reject, message) {
      if ( message.statusCode !== 200 ) {
        console.error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode);
        reject(new Error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode));
        return;
      }

      var self = this;
      var jsonText = '';
      message.on('data', function(data) { jsonText += data.toString(); });
      message.on('end', function() {
        self.processFindResponse(resolve, reject, jsonText);
      });
    },
    function processFindResponse(resolve, reject, jsonText) {
      var json;
      try {
        json = JSON.parse(jsonText);
      } catch (err) {
        reject(err);
        return;
      }

      if ( ! ( json.found && json.found[0] && json.found[0].entity ) ) {
        reject(new Error('Cloud Datastore entity not found'));
        return;
      }
      if ( json.found.length > 1 ) {
        reject(new Error('Multiple Cloud Datastore entities match unique id'));
        return;
      }

      resolve(com.google.cloud.datastore.fromDatastoreEntity(
          json.found[0].entity));
    },

    function onPutAborted(reject) {
      reject(new Error('Cloud Datastore endpoint aborted HTTP request'));
    },
    function onPutResponse(resolve, reject, o, message) {
      if ( message.statusCode !== 200 ) {
        console.error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode);
        reject(new Error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode));
        return;
      }

      var self = this;
      var jsonText = '';
      message.on('data', function(data) { jsonText += data.toString(); });
      message.on('end', function() {
        self.processPutResponse(resolve, reject, o, jsonText);
      });
    },
    function processPutResponse(resolve, reject, o, jsonText) {
      var json;
      try {
        json = JSON.parse(jsonText);
      } catch (err) {
        reject(err);
        return;
      }

      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected ) {
          reject(new Error('Put to Cloud Datastore yielded conflict'));
          return;
        }
      }

      resolve(o);
    },

    function onRemoveAborted(reject) {
      reject(new Error('Cloud Datastore endpoint aborted HTTP request'));
    },
    function onRemoveResponse(resolve, reject, o, message) {
      if ( message.statusCode !== 200 ) {
        console.error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode);
        reject(new Error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode));
        return;
      }

      var self = this;
      var jsonText = '';
      message.on('data', function(data) { jsonText += data.toString(); });
      message.on('end', function() {
        self.processRemoveResponse(resolve, reject, o, jsonText);
      });
    },
    function processRemoveResponse(resolve, reject, o, jsonText) {
      var json;
      try {
        json = JSON.parse(jsonText);
      } catch (err) {
        reject(err);
        return;
      }

      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected ) {
          reject(new Error('Remove from Cloud Datastore yielded conflict'));
          return;
        }
      }

      resolve(o);
    },

    function onSelectAborted(reject) {
      reject(new Error('Cloud Datastore endpoint aborted HTTP request'));
    },
    function onSelectResponse(data, message) {
      if ( message.statusCode !== 200 ) {
        console.error('Unexpected response code from Cloud Datastore ' +
            'endpoint: ' + message.statusCode);
        data.reject(new Error('Unexpected response code from Cloud ' +
            'Datastore endpoint: ' + message.statusCode));
        return;
      }

      var jsonText = '';
      message.on('data', function(data) { jsonText += data.toString(); });
      message.on('end', this.processSelectResponse.bind(this, data));
    },
    function processSelectResponse(data, jsonText) {
      var json;
      try {
        json = JSON.parse(jsonText);
      } catch (err) {
        data.reject(err);
        return;
      }

      var batch = json.batch;
      var entities = batch.entityResults;
      for ( var i = 0; i < entities.length; i++ ) {
        var obj = com.google.cloud.datastore.fromDatastoreEntity(entities[i]);
        data.results.push(obj);
        data.sink.put(obj);
      }

      if ( batch.entityResults && batch.entityResults.length > 0 &&
          ( batch.moreResults === 'NOT_FINISHED' ||
            batch.moreResults === 'MORE_RESULTS_AFTER_CURSOR' ) ) {
        this.continueSelect(data, batch.endCursor);
      } else {
        data.sink.eof();
        data.resolve(data.sink);
      }
    },
    function continueSelect(prevData, startCursor) {
      var payload = Object.assign({}, prevData.requestPayload);
      payload.query = { startCursor: startCursor };

      var req = this.http.request({
        protocol: this.protocol,
        host: this.host,
        port: this.port,
        method: 'POST',
        path: '/v1/projects/' + this.projectId + ':runQuery',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      req.on('aborted', self.onSelectAborted.bind(self, prevData.reject));
      req.on('response', self.onSelectResponse.bind(
          this, this.SelectData.create({
            resolve: prevData.resolve,
            reject: prevData.reject,
            sink: prevData.sink,
            requestPayload: payload
          })));

      req.write(JSON.stringify(payload));
      req.end();
    }
  ]
});

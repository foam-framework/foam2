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

foam.ENUM({
  package: 'com.google.cloud.datastore',
  name: 'DatastoreMutationType',

  properties: [
    {
      class: 'String',
      documentation: `"key" in Datastore API's mutations: [{<key>: <data>}].`,
      name: 'datastoreMutationKey'
    }
  ],

  values: [
    {
      name: 'UPSERT',
      datastoreMutationKey: 'upsert'
    },
    {
      name: 'DELETE',
      datastoreMutationKey: 'delete'
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DatastoreMutation',

  properties: [
    {
      class: 'Enum',
      of: 'com.google.cloud.datastore.DatastoreMutationType',
      name: 'type'
    },
    {
      documentation: `"data" in Datastore API's mutations: [{<key>: <data>}].`,
      name: 'data'
    },
    {
      class: 'Function',
      documentation: `Resolve function for datastore operation promise,
          pre-bound to return payload.`,
      name: 'resolve'
    },
    {
      class: 'Function',
      documentation: `Reject function for datastore operation promise,,
          pre-bound to error reporting payload.`,
      name: 'reject'
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'BatchMutationDatastoreDAO',
  extends: 'com.google.cloud.datastore.DatastoreDAO',

  documentation: `Datastore DAO that batches put() and remove(). This can be
      crucial to avoid blowing API quota when performing bulk updates.`,

  requires: [
    'com.google.cloud.datastore.DatastoreMutation',
    'com.google.cloud.datastore.DatastoreMutationType'
  ],

  properties: [
    {
      class: 'Int',
      name: 'batchSize',
      value: 500
    },
    {
      class: 'FObjectArray',
      of: 'com.google.cloud.datastore.DatastoreMutation',
      name: 'mutations_'
    },
  ],

  methods: [
    function put(o) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.mutations_.push(self.DatastoreMutation.create({
          type: self.DatastoreMutationType.UPSERT,
          data: o.toDatastoreEntity(),
          resolve: function() {
            self.pub('on', 'put', o);
            resolve(o);
          },
          reject: function() {
            reject(new Error('Cloud Datastore transaction for put() failed'));
          }
        }));
        self.onBatchedOperation();
      });
    },
    function remove(o) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.mutations_.push(self.DatastoreMutation.create({
          type: self.DatastoreMutationType.DELETE,
          data: o.getDatastoreKey(),
          resolve: function(didRemove) {
            if ( didRemove ) self.pub('on', 'remove', o);
            resolve(o);
          },
          reject: function() {
            reject(new Error('Cloud Datastore transaction for remove() failed'));
          }
        }));
        self.onBatchedOperation();
      });
    },
  ],

  listeners: [
    {
      name: 'onBatchedOperation',
      isMerged: true,
      mergeDelay: 150,
      code: function() {
        foam.assert(
          this.mutations_.length > 0,
          'BatchedMutationDatastoreDAO: Attempt to batch no operations');

        return this.getRequest('beginTransaction').send()
          .then(this.onResponse.bind(this, 'batch transaction'))
          .then(this.onBatchTransactionResponse);
      }
    },

    function onBatchTransactionResponse(json) {
      var transaction = json.transaction;

      var mutations = this.mutations_.slice(0, this.batchSize);
      var mutationData = new Array(mutations.length);
      this.mutations_ = this.mutations_.slice(this.batchSize);

      for ( var i = 0; i < mutations.length; i++ ) {
        mutationData[i] = {};
        mutationData[i][mutations[i].type.datastoreMutationKey] =
          mutations[i].data;
      }

      return this.getRequest('commit', JSON.stringify({
        mode: 'TRANSACTIONAL',
        mutations: mutationData,
        transaction: transaction
      })).send().then(this.onResponse.bind(this, 'batch commit'))
        .then(this.onBatchResponse.bind(this, mutations))
        .catch(this.onBatchFailure.bind(this, mutations));
    },
    function onBatchResponse(mutations, json) {
      var results = json.mutationResults;
      for ( var i = 0; i < results.length; i++ ) {
        if ( results[i].conflictDetected )
          throw new Error('Batched mutations in Cloud Datastore yielded conflict');
      }

      // Cloud Datastore will provide results with version numbers even if
      // the entity did not exist. Use indexUpdates defined-and-non-0 as a
      // proxy found-and-deleted.
      //
      // TODO(markdittmer): This is a poor proxy when operations are batched.
      var operationComplete = !! json.indexUpdates;
      for ( var i = 0; i < mutations.length; i++ ) {
        mutations[i].resolve(operationComplete);
      }

      if ( this.mutations_.length > 0 ) this.onBatchedOperation();
    },
    function onBatchFailure(mutations) {
      for ( var i = 0; i < mutations.length; i++ ) {
        mutations[i].reject();
      }
    }
  ]
});

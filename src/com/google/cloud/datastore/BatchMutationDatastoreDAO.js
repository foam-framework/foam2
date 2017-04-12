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

  values: [
    {
      name: 'UPSERT',
      label: 'upsert'
    },
    {
      name: 'DELETE',
      label: 'delete'
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
      documentation: 'JSONified payload for REST API mutation content.',
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

  documentation: 'Datastore DAO that batches put() and remove().',

  requires: [
    'com.google.cloud.datastore.DatastoreMutation',
    'com.google.cloud.datastore.DatastoreMutationType'
  ],

  properties: [
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
          type: self.DatastoreMutationType.UPSERT,
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

        var mutations = this.mutations_;
        var mutationData = new Array(mutations.length);
        this.mutations_ = [];

        for ( var i = 0; i < mutations.length; i++ ) {
          mutations[i] = {};
          mutations[i][mutations[i].type.label] =
              mutations[i].data;
        }

        return this.getRequest('commit', JSON.stringify({
          mode: 'TRANSACTIONAL',
          mutations: mutationData
        })).send().then(this.onResponse.bind(this, 'batch'))
          .then(this.onBatchResponse.bind(this, mutations))
          .catch(this.onBatchFailure.bind(this, mutations));
      },
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
    },
    function onBatchFailure(mutations) {
      for ( var i = 0; i < mutations.length; i++ ) {
        mutations[i].reject();
      }
    }
  ]
});

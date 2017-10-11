/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'IDBMutationType',

  values: [
    {
      name: 'PUT',
      label: 'put'
    },
    {
      name: 'REMOVE',
      label: 'remove'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'IDBMutation',

  properties: [
    {
      class: 'Enum',
      of: 'foam.dao.IDBMutationType',
      name: 'type'
    },
    {
      documentation: 'Data to be put or removed.',
      name: 'data'
    },
    {
      class: 'Function',
      documentation: 'Resolve function for DAO operation promise.',
      name: 'resolve'
    },
    {
      class: 'Function',
      documentation: 'Reject function for DAO operation promise.',
      name: 'reject'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'BatchMutationIDBDAO',
  extends: 'foam.dao.IDBDAO',

  documentation: `Indexed DB DAO that batches put() and remove(). This improves
      performance by decreasing the number of transactions created for writes.`,

  requires: [
    'foam.dao.IDBMutation',
    'foam.dao.IDBMutationType'
  ],

  properties: [
    {
      class: 'Int',
      documentation: `Maximum number of operations to include in a batch.`,
      name: 'batchSize',
      value: 1000
    },
    {
      class: 'Int',
      documentation: `Maximum number of in-flight batches
          (i.e., transactions). Default to 1 in case clients expect strict
          ordering of operations.`,
      name: 'numBatches',
      value: 1
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.IDBMutation',
      name: 'mutations_'
    },
    {
      class: 'Int',
      documentation: 'Number of in-flight transactions.',
      name: 'numActiveTransactions_'
    }
  ],

  methods: [
    function put_(x, o) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.mutations_.push(self.IDBMutation.create({
          type: self.IDBMutationType.PUT,
          data: o,
          resolve: function(result) {
            self.pub('on', 'put', result);
            resolve(result);
          },
          reject: reject
        }));
        self.onBatchedOperation();
      });
    },
    function remove_(x, o) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.mutations_.push(self.IDBMutation.create({
          type: self.IDBMutationType.REMOVE,
          data: o,
          resolve: function(didRemove) {
            if ( didRemove ) self.pub('on', 'remove', o);
            resolve(o);
          },
          reject: reject
        }));
        self.onBatchedOperation();
      });
    },
    function beginBatchTransaction() {
      if ( this.mutations_.length === 0 ) return Promise.resolve();

      var mutations = this.mutations_.slice(0, this.batchSize);
      this.mutations_ = this.mutations_.slice(this.batchSize);

      this.numActiveTransactions_++;

      var deletes = [];
      for ( var i = 0; i < mutations.length; i++ ) {
        if ( mutations[i].type === this.IDBMutationType.REMOVE )
        deletes.push(mutations[i]);
      }
      if ( deletes.length === 0 )
        return this.onGatheredDeletes(mutations, []).
            then(this.onTransactionComplete).
            catch(this.onTransactionError);

      var promises = new Array(deletes.length);
      for ( var i = 0; i < deletes.length; i++ ) {
        promises[i] = this.find(deletes[i]);
      }

      return Promise.all(promises).
          then(this.onGatheredDeletes.bind(this, mutations)).
          then(this.onTransactionComplete).
          catch(this.onTransactionError);
    }
  ],

  listeners: [
    {
      name: 'onBatchedOperation',
      isMerged: true,
      mergeDelay: 150,
      code: function() {
        foam.assert(
            this.mutations_.length > 0,
            'BatchedMutationIDBDAO: Attempt to batch no operations');

        var promises = [];
        for ( var i = this.numActiveTransactions_; i < this.numBatches; i++ ) {
          this.beginBatchTransaction();
        }

        return Promise.all(promises);
      }
    },

    function onGatheredDeletes(mutations, deletesFound) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.withStore('readwrite', function(store) {
          var deletesI = 0;
          for ( var i = 0; i < mutations.length; i++ ) {
            var mutation = mutations[i];
            var obj = mutation.data;
            var request;
            if ( mutation.type === self.IDBMutationType.PUT ) {
              request = store.put(self.serialize(obj),
                                  self.serializeId(obj.id));
            } else {
              if ( deletesFound[deletesI] === null ) {
                deletesI++;
                continue;
              }
              request = store.delete(
                  this.serializeId(obj.id !== undefined ? obj.id : obj));
              deletesI++;
            }
          }

          request.transaction.addEventListener(
              'complete',
              function() {
                var deletesI = 0;
                for ( var i = 0; i < mutations.length; i++ ) {
                  var mutation = mutations[i];
                  if ( mutation.type === self.IDBMutationType.PUT ) {
                    self.pub('on', 'put', mutation.data);
                  } else {
                    if ( deletesFound[deletesI] !== null )
                      self.pub('on', 'remove', mutation.data);
                    deletesI++;
                  }
                  mutation.resolve(mutation.data);
                }
                resolve();
              });
            request.transaction.addEventListener(
                'error',
                function(error) {
                  for ( var i = 0; i < mutations.length; i++ ) {
                    mutations[i].reject(error);
                  }
                  reject(error);
                });
        });
      });
    },
    function onTransactionComplete() {
      this.numActiveTransactions_--;
    },
    function onTransactionError() {
      this.numActiveTransactions_--;
    }
  ]
});

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

foam.CLASS({
  package: 'foam.dao',
  name: 'StoreAndForwardDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Store-and-forward (i.e., store-and-retry) failed DAO
    operations. Useful for DAOs that may flake, but eventually succeed.`,


  requires: [ 'foam.dao.InternalException' ],

  classes: [
    {
      name: 'DAOOperation',

      properties: [
        {
          class: 'String',
          documentation: 'DAO method name associated with operation.',
          name: 'methodName',
        },
        {
          documentation: 'Arguments object associated with operation.',
          name: 'args',
        },
        {
          name: 'promise_',
          factory: function() {
            var self = this;
            var resolve;
            var reject;
            var promise = new Promise(function(res, rej) {
              resolve = res;
              reject = rej;
            });
            promise.resolveFunction_ = resolve;
            promise.rejectFunction_ = reject;
            return promise;
          }
        },
        {
          class: 'Function',
          name: 'resolve_',
          factory: function() {
            return this.promise_.resolveFunction_;
          }
        },
        {
          class: 'Function',
          name: 'reject_',
          factory: function() {
            return this.promise_.rejectFunction_;
          }
        }
      ],

      methods: [
        function getPromise() { return this.promise_; }
      ],

      listeners: [
        function resolve() { return this.resolve_.apply(this, arguments); },
        function reject() { return this.reject_.apply(this, arguments); }
      ]
    }
  ],

  properties: [
    {
      name: 'delegate',
      postSet: function(old, nu) {
        if ( this.isForwarding_ )
          this.__context__.warn('StoreAndForwardDAO: Delegate while flushing queue!');
        this.forward_();
      }
    },
    {
      class: 'Function',
      documentation: `Determine whether or not an error is sufficiently internal
        to the DAO that it's worth retrying the operation that yeilded the
        error. Default is to retry foam.dao.InternalException errors.`,
      name: 'shouldRetry',
      // TODO(markdittmer): These should be supported by function properties,
      // but they're not.
      /*
      type: 'Boolean',
      args: [
        {
          documentation: 'The error thrown by the delegate DAO.',
          name: 'error',
          type: 'Any',
        },
      ],
      */
      value: function(error) {
        return this.InternalException.isInstance(error);
      }
    },
    {
      class: 'FObjectArray',
      of: 'FObject',
      // of: 'DAOOperation',
      documentation: 'Queue for incomplete DAO operations.',
      name: 'q_',
    },
    {
      class: 'Boolean',
      name: 'isForwarding_',
    },
  ],

  methods: [
    function put_() { return this.store_('put_', arguments); },
    function remove_() { return this.store_('remove_', arguments); },
    function find_() { return this.store_('find_', arguments); },
    function select_() { return this.store_('select_', arguments); },
    function removeAll_() { return this.store_('removeAll_', arguments); },

    function store_(methodName, args) {
      // Store DAO operations in order.
      var op = this.DAOOperation.create({
        methodName: methodName,
        args: args,
      });
      this.q_.push(op);
      // If no forwarding in progress then forward this op immediately.
      // Otherwise, in-progress forwarding will get to it eventually.
      if ( ! this.isForwarding_ ) this.forward_();
      // Return Promise associated with completing operation.
      return op.getPromise();
    },
    function forward_() {
      // Guard against flush-to-(no delegate) or attempt to flush empty queue.
      if ( ( ! this.delegate ) || this.q_.length === 0 ) {
        this.isForwarding_ = false;
        return;
      }

      this.isForwarding_ = true;

      var op = this.q_[0];
      this.delegate[op.methodName].apply(this.delegate, op.args)
          .then(this.onComplete.bind(this, op))
          .catch(this.onError.bind(this, op));
    }
  ],

  listeners: [
    {
      name: 'onQ',
      documentation: `Attempt to forward failed operations no more frequently
        than "mergeDelay"ms.`,
      isMerged: 'true',
      mergeDelay: 2000,
      code: function() {
        this.forward_();
      }
    },
    {
      name: 'onComplete',
      documentation: `Operation, "op", just completed successfully, yielding
        "result". Since order is presvered, "op" is at the head of "q_".
        Dequeue "op" and resolve its promise.`,
      code: function(op, result) {
        // Dequeue and resolve completed op; attempt to forward next op.
        this.q_.shift();
        op.resolve(result);
        this.forward_();
      }
    },
    {
      name: 'onError',
      documentation: `Operation, "op", failed, yielding "error". If it should be
        retried, tickle merged listener "onQ" to ensure that it is tried again
        later. Otherwise, discard it from "q_" and reject its promise.`,
      code: function(op, error) {
        // Trigger merged listener to initiate another forwarding attempt.
        if ( this.shouldRetry(error) ) {
          this.isForwarding_ = false;
          this.onQ();
          return;
        }

        // Thrown error not retryable:
        // Dequeue and reject op; attempt to forward next op.
        this.q_.shift();
        op.reject(error);
        this.forward_();
      }
    }
  ]
});

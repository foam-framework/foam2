/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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


/** An Index which loads large amounts of data in batches, to avoid janking
  when creating new indexes from large data sets.
  FUTURE: option to use the promise in execute, so sorting operations can
  wait on this index completing load.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'PoliteIndex',
  extends: 'foam.dao.index.ProxyIndex',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan',
    'foam.dao.ArraySink',
  ],

  imports: [
    'setTimeout'
  ],

  constants: {
    BATCH_SIZE: 1000,
    SMALL_ENOUGH_SIZE: 1000,
    BATCH_TIME: 16,
  },

  properties: [
    {
      name: 'delegateFactory',
      required: true
    },
    {
      /** For numbers of puts/removes smaller than one batch,
        allow them directly through to the delegate. Once this
        number of operations is too high, begin batching and reset
        the count for when the batch completes.

        For loading, batching will trigger, then eventually when the load
        is complete operation should return to direct mode as the number of
        operations decreases to a normal level.
      */
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'directOperations',
      value: 0
    },
    {
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'batch',
      factory: function() { return []; }
    },
    {
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'timerSet',
      value: false
    },
  ],

  methods: [

    function estimate(size, sink, skip, limit, order, predicate) {
      // estimate as though we're ready to go
      return this.delegateFactory.estimate(size, sink, skip, limit, order, predicate);
    },

    function put(o) {
      // if timer is not set, aren't batching yet
      var self = this;
      if ( ! this.timerSet ) {
        // if direct operations are small enough, continue in direct mode
        if ( this.directOperations < this.SMALL_ENOUGH_SIZE ) {
          this.directOperations++;
          return this.delegate.put(o);
        } else {
          // otherwise begin batching
          this.setTimeout(function() { self.loadBatch() }, self.BATCH_TIME);
          this.timerSet = true;
        }
      }
      // get here only in batching mode
      this.batch.push(o);

    },

    function remove(o) {
      var self = this;
      if ( ! this.timerSet ) {
        if ( this.directOperations < this.SMALL_ENOUGH_SIZE ) {
          this.directOperations++;
          return this.delegate.remove(o);
        } else {
          this.setTimeout(function() { self.loadBatch() }, self.BATCH_TIME);
          this.timerSet = true;
        }
      }

      this.batch.push({ __polite_batch_remove__: o });
    },

    function plan(sink, skip, limit, order, predicate, root) {
      if ( this.timerSet ) {
        // we can't plan while the index is not settled
        return this.NoPlan.create();
      }
      return this.SUPER(sink, skip, limit, order, predicate, root);
    },

    function toString() {
      return 'PoliteIndex('+this.delegate.toString()+')';
    },
    {
      name: 'loadBatch',
      code: function() {
        var self = this;
        self.timerSet = false;
        self.directOperations = 0;

        var a = self.batch.splice(0, self.BATCH_SIZE);

        for ( var i = 0; i < a.length; i++ ) {
          var o = a[i];
          if ( o.__polite_batch_remove__ ) {
            self.delegate.remove(o.__polite_batch_remove__);
          } else {
            self.delegate.put(o);
          }
        }
//console.log(self.$UID, "PoliteIndex batch load finished", a.length);
        if ( self.batch.length > 0 ) {
          // set up another timer to process more
          self.setTimeout(function() { self.loadBatch(); }, self.BATCH_TIME);
          this.timerSet = true;
        }

      }
    }
  ]
});

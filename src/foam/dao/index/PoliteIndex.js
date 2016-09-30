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
    SMALL_ENOUGH_SIZE: 1000
  },

  properties: [
    {
      name: 'sourceIndex',
    },
    {
      // TODO: state machine
      class: 'Simple',
      name: 'loaded',
    },
    {
      /** @private */
      class: 'Simple',
      name: 'ignoreList_',
    }
  ],

  methods: [
    function init() {
      this.loaded = false;
      this.ignoreList_ = {};
      
      this.beginLoad();
    },
    
    function beginLoad() {
      this.loaded = false;

      var data = this.ArraySink.create();      
      this.sourceIndex.plan(data).execute([], data)
      // if not enough data to worry about, just load it synchronously
      if ( this.sourceIndex.size() < this.SMALL_ENOUGH_SIZE ) {
        this.delegate.bulkLoad(data);
        this.loaded = true;
        return;
      }
      this.ignoreList_ = {};
console.log(this.$UID, "PoliteIndex load started for ", this.sourceIndex.size());
      // otherwise load in batches
      this.loadBatch(this, data.a, 0);
    },
    
    function put(o) {
      // if loading, use this change instead of source data, add ignore 
      if ( ! this.loaded ) { this.ignoreList_[o.id] = true; }
      this.SUPER(o);
    },

    function remove(o) {
      // if loading, use this change instead of source data, add ignore  
      if ( ! this.loaded ) { this.ignoreList_[o.id] = true; }
      this.SUPER(o);
    },    
    
    function plan(sink, skip, limit, order, predicate) {
      if ( this.loaded ) {
        return this.SUPER(sink, skip, limit, order, predicate);
      }      
      return this.NoPlan.create();
    },

    function toString() {
      return 'PoliteIndex('+this.delegate.toString()+')';
    },
    {
      name: 'loadBatch',
      code: function(self, a, startAt) { //TODO: lightweights make listeners weird

        // assert(self.loaded == false)
        var endAt = Math.min(startAt + self.BATCH_SIZE, a.length);
        for ( var i = startAt; i < endAt; i++ ) {
          var o = a[i];
          if ( ! self.ignoreList_[o.id] ) {
            self.delegate.put(o);
          }
        }
        startAt = endAt;
        if ( startAt < a.length ) {
          // load next batch on next frame, since we are framed
          setTimeout(function() { self.loadBatch(self, a, startAt); }, 16);
        } else {
          // finished
          self.loaded = true;
          self.ignoreList_ = null;
          console.log(self.$UID, "PoliteIndex load finished", self.sourceIndex.size());

        }
      }
    }
  ]
});

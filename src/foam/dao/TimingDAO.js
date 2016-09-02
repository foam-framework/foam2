  /**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

/**
  Times access to the delegate DAO. Useful for debugging and profiling.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'TimingDAO',
  requires: [ 'foam.dao.QuickSink' ],

  extends: 'foam.dao.ProxyDAO',

  properties: [
    'name',
    'id',
    ['activeOps', {put: 0, remove:0, find: 0, select: 0}]
  ],

  methods: [
    function start(op) {
      var str = this.name + '-' + op;
      var key = this.activeOps[op]++ ? str + '-' + (this.id++) : str;
      console.time(this.id);
      return [key, str, window.performance.now(), op];
    },

    function end(act) {
      this.activeOps[act[3]]--;
      this.id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (window.performance.now()-act[2]).toFixed(3), ' ms');
    },

    function put(obj) {
      var self = this;
      var act = this.start('put');
      return this.SUPER(obj).then(function(o) { self.end(act); return o; });
    },
    function remove(obj) {
      var act = this.start('remove');
      return this.SUPER(obj).then(function() { self.end(act); });
    },
    function find(key) {
      var act = this.start('find');
      return this.SUPER(key).then(function(o) { self.end(act); return o; });
    },
    function select() {
      var act = this.start('select');
      var self = this;
      return this.SUPER.apply(this, arguments).then(function(s) {
        self.end(act);
        return s;
      })
    }
  ]
});

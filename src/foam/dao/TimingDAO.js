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

foam.CLASS({
  package: 'foam.dao',
  name: 'TimingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Times access to the delegate DAO; useful for debugging and profiling.',

  properties: [
    'name',
    {
      name: 'id',
      value: 0
    },
    ['activeOps', {put: 0, remove:0, find: 0, select: 0}],
    {
      /** High resolution time value function */
      class: 'Function',
      name: 'now',
      factory: function() {
        if ( global.window && global.window.performance ) {
          return function() {
            return window.performance.now();
          }
        } else if ( global.process && global.process.hrtime ) {
          return function() {
            var hr = global.process.hrtime();
            return ( hr[0] * 1000 ) + ( hr[1] / 1000000 );
          }
        } else {
          return function() { return Date.now(); }
        }
      }
    }
  ],

  methods: [
    function start(op) {
      var str = this.name + '-' + op;
      var key = this.activeOps[op]++ ? str + '-' + (this.id++) : str;
      console.time(key);
      return [key, str, this.now(), op];
    },

    function end(act) {
      this.activeOps[act[3]]--;
      this.id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (this.now()-act[2]).toFixed(3), ' ms');
    },

    function put(obj) {
      var act = this.start('put');
      var self = this;
      return this.SUPER(obj).then(function(o) { self.end(act); return o; });
    },
    function remove(obj) {
      var act = this.start('remove');
      var self = this;
      return this.SUPER(obj).then(function() { self.end(act); });
    },
    function find(key) {
      var act = this.start('find');
      var self = this;
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

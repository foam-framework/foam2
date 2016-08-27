/*
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

foam.CLASS({
  package: 'test.helpers',
  name: 'RandomDelayDAO',
  
  extends: 'foam.dao.ArrayDAO',
  
  properties: [
    {
      name: 'writes_',
      factory: function() { return {}; }
    },
    {
      name: 'delays',
      value: [ 200, 10, 30, 5, 100, 130, 50 ]
    },
    {
      name: 'delayIdx_',
      value: 0
    }
  ],

  constants: {
    DELAY_FUNC_BODY: function(o) {
      var s = this.SUPER.bind(this);
      var w = this.writes_;
      var d = this.nextDelay();
      var p = new Promise(function(resolve) {
        setTimeout(function() {
          s(o);
          resolve(o);
        }, Math.random() * d);
      });
      w[o] = p;
      return p.then(
        function(n) { delete w[o]; return n; },
        function(err) { delete w[o]; throw err; }
      );
    }
  },
  
  methods: [
    function put(o) {
      this.SUPER;
      return this.DELAY_FUNC_BODY(o);
    },
    
    function remove(o) {
      this.SUPER;
      return this.DELAY_FUNC_BODY(o);
    },
    
    function eof() {
      var arr = [];
      for (var key in this.writes_) { 
        if ( this.writes_[key].then ) arr.push(this.writes_[key]);
      }
      // TODO: clear out writes_, since we have ended the 'transaction'?
      return Promise.all(arr);
    },
    
    function nextDelay() {
      var d = this.delays[this.delayIdx_];
      this.delayIdx_ = ( this.delayIdx_ + 1 ) % this.delays.length; 
    }
  ]
})
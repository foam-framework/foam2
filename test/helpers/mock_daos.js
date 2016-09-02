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
      var d = this.nextDelay();
      return new Promise(function(resolve) {
        setTimeout(function() {
          s(o);
          resolve(o);
        }, Math.random() * d);
      });
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

    function nextDelay() {
      var d = this.delays[this.delayIdx_];
      this.delayIdx_ = ( this.delayIdx_ + 1 ) % this.delays.length;
    }
  ]
});

/** Test helper DAO that fails all operations when offline is true. */
foam.CLASS({
  package: 'test.helpers',
  name: 'OfflineableDAO',

  extends: 'foam.dao.ArrayDAO',

  properties: [
    {
      name: 'offline',
      value: false
    }
  ],

  constants: {
    OFFLINE_FUNC_BODY: function() {
      if ( this.offline )
        return Promise.reject(foam.dao.InternalException.create({ message: 'offline mode' }));
      else
        return this.SUPER.apply(this, arguments);
    }
  },

  methods: [
    function pub() {
      return ( this.offline ) ? undefined : this.SUPER.apply(this, arguments);
    },

    function put() {
      this.SUPER;
      return this.OFFLINE_FUNC_BODY.apply(this, arguments);
    },

    function remove() {
      this.SUPER;
      return this.OFFLINE_FUNC_BODY.apply(this, arguments);
    },

    function removeAll() {
      this.SUPER;
      return this.OFFLINE_FUNC_BODY.apply(this, arguments);
    },

    function select() {
      this.SUPER;
      return this.OFFLINE_FUNC_BODY.apply(this, arguments);
    },

    function find() {
      this.SUPER;
      return this.OFFLINE_FUNC_BODY.apply(this, arguments);
    },

  ]
});


foam.CLASS({
  package: 'test.helpers',
  name: 'MockHTTPBox',
  implements: ['foam.box.HTTPBox'],

  properties: [
    {
      name: 'url'
    },
    {
      name: 'method'
    },
    {
      name: 'MOCK_sentMessages_',
      factory: function() { return []; }
    }
  ],
  methods: [
    {
      name: 'send',
      code: function(msg) {
        this.MOCK_sentMessages_.push(msg);
      }
    }
  ]
});
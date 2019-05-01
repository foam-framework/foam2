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

foam.CLASS({
  package: 'foam.dao.node',
  name: 'JSONFileDAO',
  extends: 'foam.dao.ArrayDAO',

  imports: [ 'warn' ],

  properties: [
    {
      class: 'String',
      name: 'path',
      factory: function() {
        return this.of.name + '.json';
      }
    },
    {
      name: 'fs_',
      factory: function() {
        return require('fs');
      }
    },
    {
      class: 'Array',
      name: 'futures_'
    }
  ],

  methods: [
    function init() {
      var data;
      try {
        data = this.fs_.readFileSync(this.path).toString();
      } catch(e) { }

      if ( data && data.length )
        this.array = foam.json.parseString(data, this.__context__);

      this.on.put.sub(this.onUpdate);
      this.on.remove.sub(this.onUpdate);
    },

    function put(o) {
      return this.SUPER(o).then(this.getPromise_.bind(this, o));
    },

    function remove(o) {
      var self     = this;
      var startLen = self.array.length;

      return self.SUPER(o).then(function() {
        // Resolve after async update iff something was removed.
        return self.array.length < startLen ?
          self.getPromise_(o) :
          o ;
      });
    },

    function getPromise_(o) {
      var future;
      var promise = new Promise(function(resolve) {
        future = resolve.bind(this, o);
      });
      this.futures_.push(future);
      return promise;
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      isMerged: 100,
      code: function() {
        this.fs_.writeFile(
            this.path,
            foam.json.stringify(this.array),
            this.onUpdateComplete);
      }
    },

    function onUpdateComplete() {
      var futures = this.futures_;
      for ( var i = 0 ; i < futures.length ; i++ ) {
        futures[i]();
      }
      this.futures_ = [];
    }
  ]
});

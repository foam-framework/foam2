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
  name: 'DeDupDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    DeDupDAO is a decorator that internalizes strings in put() objects to save memory.
    Useful for indexed or cached data.
    <p>
    Use a foam.dao.EasyDAO with dedup:true to automatically apply deduplication.
  */},

  methods: [
    /** Scan each object for strings and internalize them. */
    function put(obj) {
      this.dedup(obj);
      return this.delegate.put(obj);
    },

    /** Internalizes strings in the given object.
      @private */
    function dedup(obj) {
      var inst = obj.instance_;
      for ( var key in inst ) {
        var val = inst[key];
        if ( typeof val === 'string' ) {
          inst[key] = foam.String.intern(val);
        }
      }
    }
  ]
});

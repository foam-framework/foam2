/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
// TODO: Don't use yet! Port awaiting manual testing

/**
  ReadCacheDAO will do all queries from its fast delegate (cache). Writes
  are sent through to the remote, which will eventually update the cache.
  The cache maintains full copy of the remote, but the remote is the source
  of truth.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'ReadCacheDAO',

  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'remote',
      postSet: function() { this.tryPreLoad(); }
    },
    {
      name: 'delegate',
      postSet: function() { this.tryPreLoad(); }
    },
    {
      name: 'model',
      expression: function(delegate, remote) {
        return delegate.model || remote.model;
      }
    }
  ],

  methods: [
    function tryPreLoad() {
      // pre-load contents of remote into cache
      // TODO: replace this with the same kind of linkage as LazyCacheDAO
      // ends up with (make listener expression dependent on two props)
      this.delegate && this.remote && this.remote.pipe(this.delegate);
    },
    function put(obj) {
      var self = this;
      return self.remote.put(obj).then(
        function(obj) { return self.delegate.put(obj); }
      );
    },
    function remove(obj) {
      var self = this;
      return self.remote.remove(obj).then(
        function(obj) { return self.delegate.remove(obj)
          .catch(function() {}); // don't fail on double remove
        }
      );
    },
    function removeAll(skip, limit, order, predicate) {
      var self = this;
      return self.remote.removeAll(skip, limit, order, predicate).then(
        function(obj) {
          return self.delegate.removeAll(skip, limit, order, predicate);
        }
      );
    },
  ]
});

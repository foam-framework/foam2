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
  package: 'foam.dao.index',
  name: 'MultiKeyIndex',
  extends: 'foam.dao.index.ProxyIndex',

  methods: [
    function toPrettyString(indent) {
      var ret = '  '.repeat(indent) + 'MultiKey(' + this.$UID + ')\n';
      ret += this.delegate.toPrettyString(indent + 1);
      return ret;
    }
  ]

});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'MultiKeyIndexNode',
  extends: 'foam.dao.index.ProxyIndexNode',

  methods: [
    function get(key) {
      // MultiKey indexes use an array of values as the key. To find the
      // sub-index, we must dig into the delegate's tail indexes. Abort if
      // any key part is not found, returning undefined.
      // TODO(jacksonic): validate key array
      var subIndex = this.delegate.get(key[0]);
      for (var i = 1; (i < key.length && subIndex); ++i) {
        subIndex = subIndex.get(key[i]);
      }
      return subIndex;
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.MultiPartID',

  requires: [ 'foam.dao.index.MultiKeyIndex' ],

  methods: [
    function toIndex(tail) {
      // build index, innermost to outermost
      var index = tail;
      var ps = this.props;
      for (var i = ps.length - 1; i >= 0; --i) {
        index = ps[i].toIndex(index);
      }
      return this.MultiKeyIndex.create({ delegate: index });
    }
  ]
});

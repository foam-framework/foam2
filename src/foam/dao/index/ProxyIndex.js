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
  name: 'ProxyIndex',
  extends: 'foam.dao.index.Index',

  properties: [
    {
      name: 'delegateFactory',
      required: true,
    }
  ],
  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegateFactory.estimate(size, sink, skip, limit, order, predicate);
    },

    function toPrettyString(indent) {
      return this.delegateFactory.toPrettyString(indent);
    },
    
    function toString() {
      return '[' + this.cls_.name + ': ' + this.delegateFactory.toString() + ']'
    }
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'ProxyIndexTail',
  extends: 'foam.dao.index.IndexTail',

  properties: [
    {
      class: 'Simple',
      name: 'delegate',
    },
  ],

  methods: [
    function init() {
      this.delegate = this.delegate || this.creator.delegateFactory.createTail();
    },
    
    function put(o) { return this.delegate.put(o); },

    function remove(o) { return this.delegate.remove(o); },

    function plan(sink, skip, limit, order, predicate, root) {
      return this.delegate.plan(sink, skip, limit, order, predicate, root);
    },

    function get(key) { return this.delegate.get(key); },

    function size() { return this.delegate.size(); },

    function select(sink, skip, limit, order, predicate, cache) {
      return this.delegate.select(sink, skip, limit, order, predicate, cache);
    },

    function bulkLoad(dao) { return this.delegate.bulkLoad(dao); },

  ]
});


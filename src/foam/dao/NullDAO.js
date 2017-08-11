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
  package: 'foam.dao',
  name: 'NullDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'A Null pattern (do-nothing) DAO implementation.',

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.ObjectNotFoundException'
  ],

  methods: [
    function put_(x, obj) {
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function remove_(x, obj) {
      this.pub('on', 'remove', obj);
      return Promise.resolve();
    },

    function find_(x, id) {
      return Promise.resolve(null);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      sink = sink || foam.dao.ArraySink.create();
      sink.eof();
      return Promise.resolve(sink);
    },

    function removeAll_(x, skip, limit, order, predicate) {
      return Promise.resolve();
    }
  ]
});

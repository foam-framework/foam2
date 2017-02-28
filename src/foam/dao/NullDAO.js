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

  requires: [
    'foam.dao.ExternalException',
    'foam.dao.ObjectNotFoundException'
  ],

  methods: [
    function put(obj) {
      return Promise.reject(this.ExternalException.create({
        message: 'NullDAO: Cannot handle put()'
      }));
    },

    function remove(obj) {
      return Promise.resolve();
    },

    function find(id) {
      return Promise.resolve(null);
    },

    function select(sink) {
      sink.eof();
      return Promise.resolve(sink);
    },

    function removeAll() {
      return Promise.resolve();
    }
  ]
});

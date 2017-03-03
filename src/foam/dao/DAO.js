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

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAO',

  documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'find',
      returns: 'Promise',
      args: [ 'id' ]
    },
    {
      name: 'select',
      returns: 'Promise',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'removeAll',
      returns: '',
      args: [ 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'listen',
      returns: '',
      args: [ 'sink', 'predicate' ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      args: [ 'sink' ]
    },
    {
      name: 'where',
      returns: 'foam.dao.DAO',
      args: [ 'predicate' ]
    },
    {
      name: 'orderBy',
      returns: 'foam.dao.DAO',
      args: [ 'comparator' ]
    },
    {
      name: 'skip',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    },
    {
      name: 'limit',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    }
  ]
});

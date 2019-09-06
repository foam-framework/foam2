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
      async: true,
      type: 'FObject',
      swiftThrows: true,
      documentation: 'Inserts a new object or updates an existing one. When the object is stored successfully, the promise resolves with the newly added object.',
      args: [
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'put_',
      async: true,
      type: 'FObject',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'remove',
      async: true,
      type: 'FObject',
      swiftThrows: true,
      documentation: `Deletes a single object from the DAO.
                      NB: Trying to remove an object which does not exist is not an error. remove() only rejects if it fails to communicate with the backend.
      `,
      args: [
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'remove_',
      async: true,
      type: 'FObject',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'find',
      async: true,
      type: 'FObject',
      swiftThrows: true,
      documentation: `Retrieves a single object from the DAO, whose id is equal to the parameter id or if the given predicate evaluates to true.
      If the object is found, the promise resolves with the object.
      If the object is not found, it returns null.
      `,
      args: [
        {
          name: 'id',
          type: 'Object'
        }
      ],
    },
    {
      name: 'find_',
      async: true,
      type: 'FObject',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'id',
          type: 'Object'
        }
      ]
    },
    {
      name: 'select',
      async: true,
      type: 'foam.dao.Sink',
      swiftThrows: true,
      documentation: `The primary way to read objects from a DAO is select(sink) that will retrieve a collection of results and will send them (callback) to the sink. A simple select(sink) returns all record in the DAO.
        If you don\'t specify a Sink when calling select(), a foam.dao.ArraySink will be created by default and passed to the resolved Promise:
      `,      args: [
        {
          name: 'sink',
          type: 'foam.dao.Sink',
        }
      ]
    },
    {
      name: 'select_',
      async: true,
      type: 'foam.dao.Sink',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'sink',
          type: 'foam.dao.Sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'skip',
          type: 'Long',
          swiftDefaultValue: '0'
        },
        {
          name: 'limit',
          type: 'Long',
          swiftDefaultValue: 'Int.max'
        },
        {
          name: 'order',
          type: 'foam.mlang.order.Comparator',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'removeAll',
      async: true,
      swiftThrows: true,
      documentation: `removeAll() is very similar to select(), with the obvious exception that it removes all matching entries from the DAO instead of returning them.
                      Be careful! myDAO.removeAll() without any filtering will delete every entry.
      `,
      args: [ ]
    },
    {
      name: 'removeAll_',
      swiftThrows: true,
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'skip',
          type: 'Long',
          swiftDefaultValue: '0'
        },
        {
          name: 'limit',
          type: 'Long',
          swiftDefaultValue: 'Int.max'
        },
        {
          name: 'order',
          type: 'foam.mlang.order.Comparator',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'listen',
      type: 'Detachable',
      javaType: 'void', // TODO Java detachable support.
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'sink',
          type: 'foam.dao.Sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'listen_',
      type: 'Detachable',
      javaType: 'void', // TODO Java detachable support.
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'sink',
          type: 'foam.dao.Sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      type: 'Void',
      swiftThrows: true,
      args: [
        {
          name: 'sink',
          type: 'foam.dao.Sink',
        }
      ],
    },
    {
      name: 'pipe_', // TODO: return a promise? don't put pipe and listen here?
      type: 'Void',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sink',
          type: 'foam.dao.Sink',
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'where',
      type: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate',
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'orderBy',
      type: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'comparator',
          type: 'foam.mlang.order.Comparator',
        }
      ]
    },
    {
      name: 'skip',
      type: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'count',
          type: 'Long'
        }
      ]
    },
    {
      name: 'limit',
      type: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'count',
          type: 'Long'
        }
      ]
    },
    {
      name: 'inX',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'cmd',
      async: true,
      type: 'Any',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ]
    },
    {
      name: 'cmd_',
      async: true,
      type: 'Any',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Any'
        }
      ]
    },
    {
      name: 'getOf',
      flags: ['java'],
      type: 'Class',
      javaType: 'foam.core.ClassInfo'
    }
  ]
});

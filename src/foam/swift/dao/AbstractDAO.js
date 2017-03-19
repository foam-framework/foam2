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
  package: 'foam.swift.dao',
  name: 'AbstractDAO',
  properties: [
    {
      name: 'of',
      swiftType: 'ClassInfo',
    },
    {
      name: 'primaryKey',
      swiftType: 'PropertyInfo',
      swiftExpressionArgs: ['of'],
      swiftExpression: 'return of.axiom(byName: "id") as! PropertyInfo',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftReturnType: 'FObject?',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ],
      swiftCode: 'fatalError()',
    },
    {
      name: 'remove',
      swiftReturnType: 'FObject?',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ],
      swiftCode: 'fatalError()',
    },
    /*
    {
      name: 'find',
      swiftReturnType: 'FObject',
      args: [
        {
          name: 'id',
          swiftType: 'Any?'
        }
      ],
      swiftCode: 'fatalError()',
    },
    {
      name: 'select',
      swiftReturnType: 'Sink',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink'
        },
        {
          name: 'skip',
          swiftType: 'Int'
        },
        {
          name: 'limit',
          swiftType: 'Int'
        },
        {
          name: 'order',
          swiftType: 'Comparator'
        },
        {
          name: 'predicate',
          swiftType: 'Predicate'
        }
      ]
    },
    {
      name: 'removeAll',
      args: [
        {
          name: 'skip',
          swiftType: 'Int'
        },
        {
          name: 'limit',
          swiftType: 'Int'
        },
        {
          name: 'order',
          swiftType: 'Comparator'
        },
        {
          name: 'predicate',
          swiftType: 'Predicate'
        }
      ]
    },
    {
      name: 'pipe',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink'
        }
      ]
    },
    {
      name: 'where',
      swiftReturnType: 'AbstractDAO',
      args: [
        {
          name: 'predicate',
          swiftType: 'Predicate'
        }
      ]
    },
    {
      name: 'orderBy',
      swiftReturnType: 'AbstractDAO',
      args: [
        {
          name: 'comparator',
          swiftType: 'Comparator'
        }
      ]
    },
    {
      name: 'skip',
      swiftReturnType: 'AbstractDAO',
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ]
    },
    {
      name: 'limit',
      swiftReturnType: 'AbstractDAO',
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ]
    }
*/
  ]
});

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
  package: 'foam.mlang.predicate',
  name: 'Predicate',
  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaReturns: 'boolean'
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'AbstractPredicate',
  abstract: true,
  implements: ['foam.mlang.predicate.Predicate'],
  methods: [
    {
      name: 'partialEval',
      javaCode: 'return this;',
      // Return this javaReturns when it is inherited properly. (Traits are fixed).
      javaReturns: 'foam.mlang.predicate.Predicate',
      code: function() {
        return this;
      }
    },
    {
      name: 'toString',
      javaCode: 'return classInfo_.getId();',
      code: function() {
        return this.cls_.name;
      }
    }
  ]
});

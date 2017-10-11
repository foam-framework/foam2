/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'NoNeqDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator for DAOs that do not support NEQ().',

  requires: [
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Or'
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      if ( ! predicate )
        return this.SUPER(x, sink, skip, limit, order, predicate);

      return this.SUPER(x, sink, skip, limit, order,
                        this.transformNeq_(predicate));
    },
    {
      name: 'transformNeq_',
      documentation: 'Convert NEQ() mLangs in input to OR(LT(), GT()).',
      code: foam.mmethod({
        'foam.mlang.predicate.Neq': function(predicate) {
          return this.Or.create({
            args: [
              this.Lt.create({ arg1: predicate.arg1, arg2: predicate.arg2 }),
              this.Gt.create({ arg1: predicate.arg1, arg2: predicate.arg2 }),
            ]
          }, predicate);
        },
        'foam.mlang.predicate.Binary': function(predicate) {
          return predicate.cls_.create({
            arg1: this.transformNeq_(predicate.arg1),
            arg2: this.transformNeq_(predicate.arg2)
          }, predicate);
        },
        'foam.mlang.predicate.Nary': function(predicate) {
          var oldArgs = predicate.args;
          var newArgs = new Array(oldArgs.length);
          for (var i = 0; i < oldArgs.length; i++) {
            newArgs[i] = this.transformNeq_(oldArgs[i]);
          }
          return predicate.cls_.create({ args: newArgs });
        },
        'foam.mlang.predicate.AbstractPredicate': function(predicate) {
          return predicate.clone();
        },
        'foam.mlang.AbstractExpr': function(expr) {
          return expr.clone();
        },
        'foam.core.Property': function(property) {
          return property;
        }
      }, function(predicate) {
        throw new Error('Unrecognized predicate: ' +
                        (predicate && predicate.cls_ && predicate.cls_.id));
      })
    }
  ]
});

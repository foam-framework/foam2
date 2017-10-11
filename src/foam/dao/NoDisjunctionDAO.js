/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
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
  name: 'NoDisjunctionDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'DAO decorator for DAOs that do not support disjunction.',

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.MDAO',
    'foam.mlang.Constant',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Or'
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      if ( ! predicate )
        return this.SUPER(x, sink, skip, limit, order, predicate);

      // Get predicate in reduced form of OR( ... <no ORs or INs> ... ).
      var newPredicate = this.inToOr_(predicate)
          .toDisjunctiveNormalForm()
          .partialEval();

      // Do not bother disjunction-only DAOs with returning empty set or
      // implementing select(..., TRUE) = select(..., <no predicate>).
      if ( this.FALSE.equals(newPredicate) ) {
        sink.eof && sink.eof();
        return Promise.resolve(sink);
      }
      if ( this.TRUE.equals(newPredicate) ) newPredicate = undefined;

      if ( ! this.Or.isInstance(newPredicate) )
        return this.SUPER(x, sink, skip, limit, order, newPredicate);

      // Perform query over each arg of top-level OR.
      var predicates = newPredicate.args;
      var dao = this.MDAO.create({ of: this.of });
      // TODO(markdittmer): Create indices based on predicate.
      var sharedSink = this.DAOSink.create({ dao: dao });
      var promises = [];
      for ( var i = 0; i < predicates.length; i++ ) {
        promises.push(
            this.SUPER(x, sharedSink, skip, limit, order, predicates[i]));
      }

      return Promise.all(promises).then(function() {
        // Perform "actual" query over DAO of merged results.
        return dao.select_(x, sink, skip, limit, order, predicate);
      });
    },
    {
      name: 'inToOr_',
      documentation: 'Convert IN() mLangs in input to OR(EQ(...), ...).',
      code: foam.mmethod({
        'foam.mlang.predicate.In': function(predicate) {
          foam.assert(this.Constant.isInstance(predicate.arg2),
                      'NoDisjunctionDAO expects constant IN.arg2');

          var orArgs = [];
          var arg2 = predicate.arg2.value;

          for ( var i = 0; i < arg2.length; i++ ) {
            orArgs.push(this.Eq.create({
              arg1: predicate.arg1.clone(),
              arg2: arg2[i]
            }, predicate));
          }
          return this.Or.create({ args: orArgs }, predicate);
        },
        'foam.mlang.predicate.Binary': function(predicate) {
          return predicate.cls_.create({
            arg1: this.inToOr_(predicate.arg1),
            arg2: this.inToOr_(predicate.arg2)
          }, predicate);
        },
        'foam.mlang.predicate.Nary': function(predicate) {
          var oldArgs = predicate.args;
          var newArgs = new Array(oldArgs.length);
          for ( var i = 0; i < oldArgs.length; i++ ) {
            newArgs[i] = this.inToOr_(oldArgs[i]);
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
                        ( predicate && predicate.cls_ && predicate.cls_.id ));
      })
    }
  ]
});

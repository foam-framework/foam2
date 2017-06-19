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

  documentation: 'DAO decorator for DAOs that do not support disjunction.',

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.MDAO',
    'foam.mlang.predicate.Or'
  ],

  methods: [
    function select_(x, sink, skip, limit, order, predicate) {
      if ( ! predicate )
        return this.SUPER(x, sink, skip, limit, order, predicate);

      var prevPredicate;
      var dnfPredicate = predicate;
      // This might as well be while ( ! equals(prev, dnf) ), but counter
      // limits time spent simplifying expression.
      for ( var i = 0; i < 5; i++ ) {
        if ( foam.util.equals(prevPredicate, dnfPredicate) ) break;
        prevPredicate = dnfPredicate;
        dnfPredicate = dnfPredicate.partialEval().toDisjunctiveNormalForm();
      }
      dnfPredicate = dnfPredicate.partialEval();

      if ( ! this.Or.isInstance(dnfPredicate) )
        return this.SUPER(x, sink, skip, limit, order, dnfPredicate);

      var predicates = dnfPredicate.args;
      var dao = this.MDAO.create({of: this.of});
      // TODO(markdittmer): Create indices based on predicate.
      var sharedSink = this.DAOSink.create({ dao: dao });
      var promises = [];
      for ( var i = 0; i < predicates.length; i++ ) {
        promises.push(
            this.SUPER(x, sharedSink, skip, limit, order, predicates[i]));
      }

      return Promise.all(promises).then(function() {
        return dao.select_(x, sink, skip, limit, order, predicate);
      });
    }
  ]
});

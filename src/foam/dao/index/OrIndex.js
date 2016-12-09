// /**
//  * @license
//  * Copyright 2016 Google Inc. All Rights Reserved.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
//
// /**
//   In most cases MDAO takes care of splitting up OR predicates for you, and
//   you will never need an ORIndex. In the case you call Or.toIndex(), this
//   class is necessary to produce a valid index.
//
//   ORIndex runs multiple plans over the clauses of the OR predicate, and
//   combines the results. Typically an AltIndex will be used under the ORIndex
//   to optimize the various sub-queries the OR executes.
// */
// // TODO: leave out
//
// foam.CLASS({
//   package: 'foam.dao.index',
//   name: 'OrIndex',
//   extends: 'foam.dao.index.ProxyIndex',
//
//   requires: [
//     'foam.mlang.predicate.Or',
//     'foam.dao.index.MergePlan'
//   ],
//
//   methods: [
//     function plan(sink, skip, limit, order, predicate, root) {
//       if ( ! predicate || ! this.Or.isInstance(predicate) ) {
//         return this.delegate.plan(sink, skip, limit, order, predicate, root);
//       }
//
//       // If there's a limit, add skip to make sure we get enough results
//       //   from each subquery. Our sink will throw out the extra results
//       //   after sorting.
//       var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );
//
//       // This is an instance of OR, break up into separate queries
//       var args = predicate.args;
//       var plans = [];
//       for ( var i = 0; i < args.length; i++ ) {
//         // NOTE: we pass sink here, but it's not going to be the one eventually
//         // used.
//         plans.push(
//           this.delegate.plan(sink, undefined, subLimit, undefined, args[i])
//         );
//       }
//
//       return this.MergePlan.create({ subPlans: plans });
//     },
//
//     function toString() {
//       return 'OrIndex('+(this.creator || this).delegateFactory.toString()+')';
//     }
//
//   ]
//
// });
//

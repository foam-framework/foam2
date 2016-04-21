/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

// TODO: model Position indexes


// var PositionQuery = {
//   create: function(args) {
//     return {
//       __proto__: this,
//       skip: args.skip,
//       limit: args.limit,
//       s: args.s
//     };
//   },
//   reduce: function(other) {
//     var otherFinish = other.skip + other.limit;
//     var myFinish = this.skip + this.limit;

//     if ( other.skip > myFinish ) return null;
//     if ( other.skip >= this.skip ) {
//       return PositionQuery.create({
//         skip: this.skip,
//         limit: Math.max(myFinish, otherFinish) - this.skip,
//         s: this.s
//       });
//     }
//     return other.reduce(this);
//   },
//   equals: function(other) {
//     return this.skip === other.skip && this.limit === other.limit;
//   }
// };

// var AutoPositionIndex = {
//   create: function(factory, mdao, networkdao, maxage) {
//     var obj = {
//       __proto__: this,
//       factory: factory,
//       maxage: maxage,
//       dao: mdao,
//       networkdao: networkdao,
//       sets: [],
//       alt: AltIndex.create()
//     };
//     return obj;
//   },

//   put: function(s, value) { return this.alt.put(s, value); },
//   remove: function(s, value) { return this.alt.remove(s, value); },

//   bulkLoad: function(a) {
//     return [];
//   },

//   addIndex: function(s, index) {
//     return this;
//   },

//   addPosIndex: function(s, skip, limit, order, predicate) {
//     var index = PositionIndex.create(
//       order,
//       predicate,
//       this.factory,
//       this.dao,
//       this.networkdao,
//       this.queue,
//       this.maxage);

//     this.alt.delegates.push(index);
//     s.push(index.bulkLoad([]));
//   },

//   hasIndex: function(skip, limit, order, predicate) {
//     for ( var i = 0; i < this.sets.length; i++ ) {
//       var set = this.sets[i];
//       if ( set[0].equals((predicate) || '') && set[1].equals((order) || '') ) return true;
//     }
//     return false;
//   },

//   plan: function(s, sink, skip, limit, order, predicate) {
//     var subPlan = this.alt.plan(s, sink, skip, limit, order, predicate);

//     if ( subPlan != foam.dao.index.NoPlan.create() ) return subPlan;

//     if ( ( skip != null && limit != null ) ||
//          CountExpr.isInstance(sink) ) {
//       if ( this.hasIndex(skip, limit, order, predicate) ) return foam.dao.index.NoPlan.create();
//       this.sets.push([(predicate) || '', (order) || '']);
//       this.addPosIndex(s, skip, limit, order, predicate);
//       return this.alt.plan(s, sink, skip, limit, order, predicate);
//     }
//     return foam.dao.index.NoPlan.create();
//   }
// };

// var PositionIndex = {
//   create: function(order, predicate, factory, dao, networkdao, queue, maxage) {
//     var obj = {
//       __proto__: this,
//       order: order || '',
//       predicate: predicate || '',
//       factory: factory,
//       dao: dao,
//       networkdao: networkdao.where(predicate).orderBy(order),
//       maxage: maxage,
//       queue: arequestqueue(function(ret, request) {
//         var s = request.s;
//         obj.networkdao
//           .skip(request.skip)
//           .limit(request.limit)
//           .select()(function(objs) {
//             var now = Date.now();
//             for ( var i = 0; i < objs.length; i++ ) {
//               s[request.skip + i] = {
//                 obj: objs[i].id,
//                 timestamp: now
//               };
//               s.feedback = objs[i].id;
//               obj.dao.put(objs[i]);
//               s.feedback = null;
//             }
//             ret();
//           });
//       }, undefined, 1)
//     };
//     return obj;
//   },

//   put: function(s, newValue) {
//     if ( s.feedback === newValue.id ) return s;
//     if ( this.predicate && ! this.predicate.f(newValue) ) return s;

//     var compare = toCompare(this.order);

//     for ( var i = 0; i < s.length; i++ ) {
//       var entry = s[i]
//       if ( ! entry ) continue;
//       // TODO: This abuses the fact that find is synchronous.
//       this.dao.find(entry.obj, { put: function(o) { entry = o; } });

//       // Only happens when things are put into the dao from a select on this index.
//       // otherwise objects are removed() first from the MDAO.
//       if ( entry.id === newValue.id ) {
//         break;
//       }

//       if ( compare(entry, newValue) > 0 ) {
//         for ( var j = s.length; j > i; j-- ) {
//           s[j] = s[j-1];
//         }

//         // If we have objects on both sides, put this one here.
//         if ( i == 0 || s[i-1] ) s[i] = {
//           obj: newValue.id,
//           timestamp: Date.now()
//         };
//         break;
//       }
//     }
//     return s;
//   },

//   remove: function(s, obj) {
//     if ( s.feedback === obj.id ) return s;
//     for ( var i = 0; i < s.length; i++ ) {
//       if ( s[i] && s[i].obj === obj.id ) {
//         for ( var j = i; j < s.length - 1; j++ ) {
//           s[j] = s[j+1];
//         }
//         break;
//       }
//     }
//     return s;
//   },

//   bulkLoad: function(a) { return []; },

//   plan: function(s, sink, skip, limit, order, predicate) {
//     var order = ( order ) || '';
//     var predicate = ( predicate ) || '';

//     var self = this;

//     if ( ! order.equals(this.order) ||
//          ! predicate.equals(this.predicate) ) return foam.dao.index.NoPlan.create();

//     if ( foam.mlang.sink.Count.isInstance(sink) ) {
//       return {
//         cost: 0,
//         execute: function(promise, s, sink, skip, limit, order, predicate) {
//           // TODO: double check this bit...
//           if ( ! s.value ) {
//             // TODO: memoize, expire after self.maxage, as per foam1 amemo
//             s.value = self.networkdao.select(foam.mlang.sink.Count.create());
//           }

//           promise[0] = promise[0].then(s.value.then(function(countSink) {
//             sink.value = countSink.value;
//             return Promise.resolve(sink);
//           }));
//         },
//         toString: function() { return 'position-index(cost=' + this.cost + ', count)'; }
//       }
//     } else if ( skip == undefined || limit == undefined ) {
//       return foam.dao.index.NoPlan.create();
//     }

//     var threshold = Date.now() - this.maxage;
//     return {
//       cost: 0,
//       toString: function() { return 'position-index(cost=' + this.cost + ')'; },
//       execute: function(promise, sink, skip, limit, order, predicate) {
//         var objs = [];

//         var min;
//         var max;

//         for ( var i = 0 ; i < limit; i++ ) {
//           var o = s[i + skip];
//           if ( ! o || o.timestamp < threshold ) {
//             if ( min == undefined ) min = i + skip;
//             max = i + skip;
//           }
//           if ( o ) {
//             // TODO: Works because find is actually synchronous.
//             // this will need to fixed if find starts using an async function.
//             self.dao.find(o.obj, { put: function(obj) { objs[i] = obj; } });
//           } else {
//             objs[i] = self.factory();
//           }
//           if ( ! objs[i] ) debugger;
//         }

//         if ( min != undefined ) {
//           self.queue(PositionQuery.create({
//             skip: min,
//             limit: (max - min) + 1,
//             s: s
//           }));
//         }

//         for ( var i = 0; i < objs.length; i++ ) {
//           sink.put(objs[i]);
//         }
//       }
//     };
//   }
// };


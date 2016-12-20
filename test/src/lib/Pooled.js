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

// describe('pattern.Pooled', function() {

//   beforeEach(function() {
//     foam.CLASS({
//       name: 'PooledClass',
//       package: 'test',
//       axioms: [foam.pattern.Pooled.create()],
//       properties: [ 'a', 'b' ],
//     });
//     foam.CLASS({
//       name: 'PooledDetachClass',
//       package: 'test',
//       axioms: [foam.pattern.Pooled.create()],
//       properties: [
//         [ 'a', 55 ],
//         [ 'b', 99 ],
//       ],
//       methods: [
//         function pooledDetach() {
//           this.a = 0;
//           this.b = 6;
//         }
//       ],
//     });
//   });
//   afterEach(function() {
//     delete foam.__objectPools__;
//   });

//   it('allocates new instances', function() {
//     var instances = [
//       test.PooledClass.create(),
//       test.PooledClass.create({ a: 1, b: 2 }),
//       test.PooledClass.create({ a: 3, b: 4 }),
//       test.PooledClass.create({ a: 5, b: 6 }),
//     ];
//     expect(test.PooledClass.__objectPool__.length).toEqual(0);
//   });

//   it('returns detached instances to the pool', function() {
//     var instances = [
//       test.PooledClass.create(),
//       test.PooledClass.create({ a: 1, b: 2 }),
//       test.PooledClass.create({ a: 3, b: 4 }),
//       test.PooledClass.create({ a: 5, b: 6 }),
//     ];
//     expect(test.PooledClass.__objectPool__.length).toEqual(0);

//     instances.forEach(function(inst) {
//       inst.detach();
//     });
//     expect(test.PooledClass.__objectPool__.length).toEqual(instances.length);
//   });

//   it('eliminates the contents of detached objects', function() {
//     var p = test.PooledClass.create({ a: 5, b: 6 });
//     p.detach();

//     expect(p.a).toBeUndefined();
//     expect(p.b).toBeUndefined();
//   });

//   it('retains JS objects', function() {
//     var p = test.PooledClass.create({ a: 5, b: 6 });
//     var i_ = p.instance_;
//     var p_ = p.private_;
//     p.detach();

//     // should pull from pool
//     p = test.PooledClass.create({ a: 5, b: 6 });
//     i_.a = 99; // hack in a value
//     expect(p.a).toEqual(99);
//     expect(p.private_).toBe(p_);
//   });

//   it('remembers pooled classes', function() {
//     expect(foam.pattern.Pooled.create().pooledClasses[test.PooledClass]).toEqual(true);
//     foam.pattern.Pooled.create().clearPools();
//   });


//   it('uses the fast pooledDetach() if available', function() {
//     var p = test.PooledDetachClass.create();
//     expect(p.a).toEqual(55);
//     expect(p.b).toEqual(99);
//     var called = 0;
//     p.onDetach(function() { called += 1; });
//     p.detach();

//     p = test.PooledDetachClass.create();
//     expect(called).toEqual(1);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);

//   });

//   it('pooledDetach() can leave private_ intact', function() {
//     var p = test.PooledDetachClass.create();
//     expect(p.a).toEqual(55);
//     expect(p.b).toEqual(99);
//     var called = 0;
//     p.onDetach(function() { called += 1; });
//     p.detach(); // runs destructors, pooledDetach() doesn't clear them

//     p = test.PooledDetachClass.create();
//     expect(called).toEqual(1);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);

//     p.a = 88;
//     p.b = 33;
//     p.detach(); // the destructors from last time are still there
//     p = test.PooledDetachClass.create();
//     expect(called).toEqual(2);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);
//   });

// });





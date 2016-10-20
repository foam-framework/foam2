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
//       name: 'PooledDestroyClass',
//       package: 'test',
//       axioms: [foam.pattern.Pooled.create()],
//       properties: [
//         [ 'a', 55 ],
//         [ 'b', 99 ],
//       ],
//       methods: [
//         function pooledDestroy() {
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

//   it('returns destroyed instances to the pool', function() {
//     var instances = [
//       test.PooledClass.create(),
//       test.PooledClass.create({ a: 1, b: 2 }),
//       test.PooledClass.create({ a: 3, b: 4 }),
//       test.PooledClass.create({ a: 5, b: 6 }),
//     ];
//     expect(test.PooledClass.__objectPool__.length).toEqual(0);

//     instances.forEach(function(inst) {
//       inst.destroy();
//     });
//     expect(test.PooledClass.__objectPool__.length).toEqual(instances.length);
//   });

//   it('eliminates the contents of destroyed objects', function() {
//     var p = test.PooledClass.create({ a: 5, b: 6 });
//     p.destroy();

//     expect(p.a).toBeUndefined();
//     expect(p.b).toBeUndefined();
//   });

//   it('retains JS objects', function() {
//     var p = test.PooledClass.create({ a: 5, b: 6 });
//     var i_ = p.instance_;
//     var p_ = p.private_;
//     p.destroy();

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


//   it('uses the fast pooledDestroy() if available', function() {
//     var p = test.PooledDestroyClass.create();
//     expect(p.a).toEqual(55);
//     expect(p.b).toEqual(99);
//     var called = 0;
//     p.onDestroy(function() { called += 1; });
//     p.destroy();

//     p = test.PooledDestroyClass.create();
//     expect(called).toEqual(1);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);

//   });

//   it('pooledDestroy() can leave private_ intact', function() {
//     var p = test.PooledDestroyClass.create();
//     expect(p.a).toEqual(55);
//     expect(p.b).toEqual(99);
//     var called = 0;
//     p.onDestroy(function() { called += 1; });
//     p.destroy(); // runs destructors, pooledDestroy() doesn't clear them

//     p = test.PooledDestroyClass.create();
//     expect(called).toEqual(1);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);

//     p.a = 88;
//     p.b = 33;
//     p.destroy(); // the destructors from last time are still there
//     p = test.PooledDestroyClass.create();
//     expect(called).toEqual(2);
//     expect(p.a).toEqual(0);
//     expect(p.b).toEqual(6);
//   });

// });





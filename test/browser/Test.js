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
/*
foam.CLASS({
  name: 'Test',
  listeners: [
    {
      name: 'l1',
      code: function() {
        console.log('l1');
      }
    },
    {
      name: 'l2',
      isFramed: true,
      code: function() {
        console.log('l2');
      }
    },
    {
      name: 'l3',
      isMerged: true,
      code: function() {
        console.log('l3');
      }
    },
    {
      name: 'l4',
      isMerged: true,
      mergeDelay: 0,
      code: function() {
        console.log('l4');
      }
    },
    {
      name: 'l5',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        console.log('l5');
      }
    },
  ]
});
var t = Test.create();

t.l1();t.l1();t.l1();
t.l2();t.l2();t.l2();
t.l3();t.l3();t.l3();
t.l4();t.l4();t.l4();

for ( var i = 0 ; i < 20 ; i++ )
  setTimeout(function() { t.l5(); }, 100*i);

*/

foam.CLASS({
  name: 'Test2',
  properties: [ 'id', 'fname', 'lname' ]
});

var dao = foam.dao.EasyDAO.create({
  of: Test2,
//  daoType: 'MDAO',
  seqNo: true,
  cache: true,
  testData: [
    { fname: 'Madonna' },
    { fname: 'Z', lname: 'Z' },
    { fname: 'A', lname: 'Z' },
    { fname: 'B', lname: 'Z' },
    { fname: 'C', lname: 'Z' },
    { fname: 'A', lname: 'A' },
    { fname: 'B', lname: 'A' },
    { fname: 'C', lname: 'A' },
    { fname: 'A', lname: 'B' },
    { fname: 'B', lname: 'B' },
    { fname: 'C', lname: 'B' },
    { fname: 'A', lname: 'C' },
    { fname: 'B', lname: 'C' },
    { fname: 'C', lname: 'C' }
  ]
});

var e = foam.mlang.Expressions.create();

dao.where(e.EQ(Test2.LNAME, null)).select().then(function (a) {
  console.log('EQ(null)');
  a.a.forEach(function (t) { console.log(t.fname); });
});

dao.where(e.NOT(e.HAS(Test2.LNAME))).select().then(function (a) {
  console.log('NOT(HAS())');
  a.a.forEach(function (t) { console.log(t.fname); });
});

/*
dao.orderBy(Test2.LNAME).select().then(function (a) {
  console.log('by LNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});

dao.orderBy(Test2.FNAME).select().then(function (a) {
  console.log('by FNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});

dao.orderBy(Test2.LNAME, Test2.FNAME).select().then(function (a) {
  console.log('by LNAME, FNAME');
  a.a.forEach(function (t) { console.log(t.fname + ' ' + t.lname); });
});
*/

//dao.removeAll();

/*
foam.CLASS({
  name: 'Parent',
  properties: [ 'a', 'b' ]
});

foam.CLASS({
  name: 'Child',
  extends: 'Parent',
  properties: [ 'c', 'd' ]
});

var c;
c = Child.create({});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({a:'a', b:'b'});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({c:'c', d:'d'});
console.log(c.stringify(), c.clone().stringify());

c = Child.create({a:'a', b:'b', c:'c', d:'d'});
console.log(c.stringify(), c.clone().stringify());
*/

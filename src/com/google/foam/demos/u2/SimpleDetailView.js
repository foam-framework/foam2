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
  name: 'Test1',
  label: 'Test 1',

  properties: [ { class: 'Int', name: 'a' }, 'b' ]
});

foam.CLASS({
  name: 'Test2',
  label: 'Test 2',

  properties: [ { class: 'Boolean', name: 'a' }, 'b', 'c', 'd' ]
});

var timer = foam.util.Timer.create();
timer.start();

var E = foam.__context__.E.bind(foam.__context__);

var os = [
  Test1.create({a: 1, b: 2}), Test1.create({a: 3, b: 4}), Test2.create({a: 3, b: 4, c: 5, d: 6})
];

//foam.u2.DetailView.create({data: os[0]}).write();
//foam.u2.DetailView.create({data: os[1]}).write();
//foam.u2.DetailView.create({data: os[2]}).write();

var dv = foam.u2.DetailView.create({data$: timer.second$.map(function(s) {
  return os[s % 3];
})});
dv.write();

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
  name: 'Test',
  properties: [
    'foo',
    {
      class: 'Boolean',
      name: 't',
      value: true,
      postSet: function(o, n) {
        console.log('** postSet: ', o, n);
//         if ( n === false ) debugger;
      }
    },
    {
//      hidden: true,
      class: 'Boolean',
      name: 'f',
      value: false
    }
  ]
});

var d = Test.create();
foam.u2.DetailView.create({ data: d }).write();
foam.u2.DetailView.create({ data: d }).write();
d.propertyChange.sub(function(_, _, prop, s) {
  console.log('propertyChange: ', prop, s.prevValue, s.get());
});

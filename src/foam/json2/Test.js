/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.json2',
  name: 'Test',
  requires: [
    'foam.test.AllProperties'
  ],
  methods: [
    function init() {
      var o1 = this.AllProperties.create({
        str: 'str',
        n: 12,
        function: function(asdfasdf) { console.log("arg is:", asdfasdf); }
      });

      var o2 = foam.json2.Deserializer.create({ parseFunctions: true }).aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          o1));

      console.log("o1 equals o2?", o1.equals(o2));

      if ( ! o1.equals(o2) ) {
        console.log("Diff:", o1.diff(o2));
      }

      o2.function("foo");

      var m1 = this.AllProperties.model_;

      var m2 = foam.json2.Deserializer.create({ parseFunctions: true }).aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          m1));

      console.log("m1 equals m2?", m1.equals(m2));

      if ( ! m1.equals(m2) ) {
        console.log("Diff:", m1.diff(m2));
      }
    }
  ]
});

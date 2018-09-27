/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.dig',
  name: 'Argument',

  properties: [

   {
    class: 'String',
    name: 'name',
    visibility: foam.u2.Visibility.RO
   },
   {
     class: 'String',
     name: 'javaType',
     visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'value'
    },
//    {
//      name: 'value',
//      postSet: function(old, nu) {
//        if ( old != nu ) {
//          this.isArguInfoChanged = true;
//          //alert("pInfo : " + this.name);//foam.nanos.dig.SUGAR.);
//          //this.isArguInfoChanged = true;
//          //return this.parameterInfo += "ddd";
//        }
//      }
//    },
    //'isArguInfoChanged'
  ],

//  methods: [
//    function outputJava(o) {
//      o.out(this.type, ' ', this.name);
//    }
//  ]
});

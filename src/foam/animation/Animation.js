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

// Experimental Animation Support
// What about nested objects?

foam.LIB({
  name: 'foam.Animation',

  methods: [
    function animate(obj, f, duration) {
      var argNames = foam.Function.argNames(f);
      var janitor  = foam.FObject.create();
      var l        = function() {
        console.log(arguments);
      };
      var initialValues = new Array(argNames.length);
      var endValues     = new Array(argNames.length);

      for ( var i = 0 ; i < argNames ; i++ ) {
        initialValues[i] = obj[argNames[i]];
//        janitor.onDetach(obj.propertyChange(argNames[i]));
      }

//       foam.Function.withArgs(f, obj) {


//       }

      for ( var i = 0 ; i < argNames ; i++ ) {
        endValues[i] = obj[argNames[i]];
        obj[argNames[i]] = initialValues[i];
      }

      for ( var i = 0 ; i < argNames ; i++ ) {
        obj[argNames[i]] = endValues[i];
      }

//      janitor.detach();
    }
  ]
});

/*
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

foam.LIB({
  name: 'foam.string',

  methods: [
    {
      name: 'constantize',
      code: foam.fn.memoize1(function(str) {
        // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
        return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
          return a.substring(0,1) + '_' + a.substring(1,2);
        }).toUpperCase();
      })
    },

    {
      name: 'labelize',
      code: foam.fn.memoize1(function(str) {
        if ( ! str || str === '' ) return str;
        return this.capitalize(str.replace(/[a-z][A-Z]/g, function (a) {
          return a.charAt(0) + ' ' + a.charAt(1);
        }));
      })
    },

    {
      name: 'capitalize',
      code: foam.fn.memoize1(function(str) {
        // switchFromProperyName to //SwitchFromPropertyName
        return str[0].toUpperCase() + str.substring(1);
      })
    },

    function pad(str, size) {
      // Right pads to size if size > 0, Left pads to -size if size < 0
      return size < 0 ?
        (new Array(-size).join(' ') + str).slice(size)       :
        (str + new Array(size).join(' ')).substring(0, size) ;
    },

    function multiline(f) {
      // Function for returning multi-line strings from commented functions.
      // Ex. var str = multiline(function() { /* multi-line string here */ });
      if ( typeof f === 'string' ) return f;
      var s = f.toString();
      var start = s.indexOf('/*');
      var end   = s.lastIndexOf('*/');
      return s.substring(start+2, end);
    }
  ]
});

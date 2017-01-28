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
  package: 'foam.core.property',
  name: 'StringArrayProperty',
  extends: 'Property',

  documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      value: 'String',
      documentation: 'The FOAM sub-type of this property.'
    },
    [
      'factory',
      function() { return []; }
    ],
    [
      'adapt',
      function(_, v, prop) {
        if ( ! Array.isArray(v) ) return v;

        var copy;
        for ( var i = 0 ; i < v.length ; i++ ) {
          if ( typeof v[i] !== 'string' ) {
            if ( ! copy ) copy = v.slice();
            copy[i] = '' + v[i];
          }
        }

        return copy || v;
      }
    ],
    [
      'assertValue',
      function(v, prop) {
        foam.assert(Array.isArray(v),
            prop.name, 'Tried to set StringArray to non-array type.');
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(typeof v[i] === 'string',
              prop.name, 'Element', i, 'is not a string', v[i]);
        }
      }
    ]
  ]
});

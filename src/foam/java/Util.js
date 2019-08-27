/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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
  name: 'foam.java.Util',
  methods:[
    {
      /** Splits strings when they are too long, used to split documentation in multiple lines */
      name: 'limitSplit',
      code: function(str, maxWords){
          res = [];
          var arr = str.split(' ');
          var line = '';
          for ( i = 0 ; i < arr.length ; i++ ) {
            line += arr[i] + ' ';
            if ( i % maxWords == 0 && i > 0 ) {
              res.push(line);
              line = '';
            }
          }
          res.push(line); // pushes what's remaining
          return res;
      }
    },
    {
      /** removes spacing included in js files (included only to beautify js files but not useful in javadoc) */
      name: 'removeSpacing',
      code: function(str){
        var res = str.replace(/\s+(?= )/g, ' ');
        //res = res.replace(/\n/g, ' '), 25);
        return res;
      }
    }
  ]
});

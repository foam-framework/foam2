/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.blob',
  name: 'Buffer',

  properties: [
    {
      class: 'Long',
      name: 'length'
    },
    {
      name: 'data',
      factory: function() {
        return new ArrayBuffer(this.length);
      }
    }
  ],

  methods: [
    function slice(start, end) {
      return foam.blob.Buffer.create();
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  implements: [ 'foam.blob.Blob' ],

  properties: [
    {
      name: 'blob',
      required: true
    },
    {
      name: 'size',
      getter: function() {
        return this.blob.size;
      }
    }
  ],

  methods: [
    function read(buffer, offset) { }
  ]
});

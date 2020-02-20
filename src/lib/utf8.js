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
  package: 'foam.encodings',
  name: 'UTF8',

  properties: [
    {
      name: 'charcode'
    },
    {
      class: 'Int',
      name: 'remaining',
      value: 0
    },
    {
      class: 'String',
      name: 'string'
    }
  ],

  methods: [
    function reset() {
      this.string    = '';
      this.remaining = 0;
      this.charcode  = null;
    },

    function put(byte) {
      if ( byte instanceof ArrayBuffer ) {
        var data = new Uint8Array(byte);
        this.put(data);
        return;
      }

      if ( byte instanceof Uint8Array ) {
        for ( var i = 0 ; i < byte.length ; i++ ) {
          this.put(byte[i]);
        }
        return;
      }

      if ( this.charcode == null)  {
        this.charcode = byte;
        if (!(this.charcode & 0x80)) {
          this.remaining = 0;
          this.charcode = (byte & 0x7f) << (6 * this.remaining);
        } else if ((this.charcode & 0xe0) == 0xc0) {
          this.remaining = 1;
          this.charcode = (byte & 0x1f) << (6 * this.remaining);
        } else if ((this.charcode & 0xf0) == 0xe0) {
          this.remaining = 2;
          this.charcode = (byte & 0x0f) << (6 * this.remaining);
        } else if ((this.charcode & 0xf8) == 0xf0) {
          this.remaining = 3;
          this.charcode = (byte & 0x07) << (6 * this.remaining);
        } else if ((this.charcode & 0xfc) == 0xf8) {
          this.remaining = 4;
          this.charcode = (byte & 0x03) << (6 * this.remaining);
        } else if ((this.charcode & 0xfe) == 0xfc) {
          this.remaining = 5;
          this.charcode = (byte & 0x01) << (6 * this.remaining);
        } else throw 'Bad charcode value';
      } else if ( this.remaining > 0 ) {
        this.remaining--;
        this.charcode |= (byte & 0x3f) << (6 * this.remaining);
      }

      if ( this.remaining == 0 ) {
        this.string += String.fromCodePoint(this.charcode);
        this.charcode = undefined;
      }
    }
   ]
});

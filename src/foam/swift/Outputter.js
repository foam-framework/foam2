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
  package: 'foam.swift', // TODO: Copied from java. Move somewhere central.
  name: 'Outputter',

  properties: [
    {
      name: 'indentLevel_',
      value: 0
    },
    {
      name: 'indentStr',
      value: '  '
    },
    {
      class: 'String',
      name: 'buf_'
    },
    {
      class: 'String',
      name: 'outputMethod'
    }
  ],

  methods: [
    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.buf_ += this.indentStr;
      return this;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        if ( arguments[i] != null && arguments[i][this.outputMethod] ) {
          arguments[i][this.outputMethod](this);
        }
        else this.buf_ += arguments[i];
      }
      return this;
    },

    function increaseIndent() {
      this.indentLevel_++;
    },

    function decreaseIndent() {
      this.indentLevel_--;
    }
  ]
});

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
  package: 'foam.java',
  name: 'InterfaceMethod',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'visibility'
    },
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    {
      name: 'body',
      documentation: 'Dummy property to silence warnings',
      setter: function() {},
      getter: function() {}
    },
    { class: 'StringArray', name: 'throws' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.type, ' ', this.name, '(');

      for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
        o.out(this.args[i]);
        if ( i != this.args.length - 1 ) o.out(', ');
      }

      o.out(')');

      if ( this.throws.length > 0 ) {
        o.out(" throws ");
        for ( var i = 0 ; i < this.throws.length ; i++ ) {
          o.out(this.throws[i]);
          if ( i < this.throws.length - 1 ) o.out(", ");
        }
      }

      o.out(';\n');
    }
  ]
});

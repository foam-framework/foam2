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
  name: 'Enum',
  extends: 'foam.java.Class',

  properties: [
    {
      class: 'Boolean',
      name: 'isEnum',
      value: true
    },    
    {
      name: 'labelsOutput',
      expression: function() {
        var out = 'return new String[] { ';

        for (var i = 0, value; value = this.values[i]; i++) {
          out += this.labelForValue(value);
          if (i < this.values.length - 1) out += ', ';
        }

        out += ' };';

        return out;
      }
    },    
    {
      name: 'forOrdinal',
      expression: function() {
        var out = 'switch (ordinal) {\n';

        for (var i = 0, value; value = this.values[i]; i++) {
          out += '  case ' + value.ordinal + ': return ' + this.name + '.' + value.name + ';\n';
        }

        out += '}\nreturn null;';

        return out;
      }
    },    
    {
      name: 'forLabel',
      expression: function() {
        var out = 'switch (label) {\n';

        for (var i = 0, value; value = this.values[i]; i++) {
          out += '  case ' + '"' + value.label + '"' + ': return ' + this.name + '.' + value.name + ';\n';
        }

        out += '}\nreturn null;';

        return out;
      }
    },
    {
      name: 'methods',
      factory: function() {
        return [
          {
            name: this.name,
            args: [ 
                    { 
                      name: 'ordinal', 
                      type: 'int' 
                    },
                    { 
                      name: 'label', 
                      type: 'String' 
                    },
                  ],
            body: 'ordinal_ = ordinal;\nlabel_ = label;'
          },
          {
            name: 'forOrdinal',
            type: this.name,
            visibility: 'public',
            static: true,
            args: [ { name: 'ordinal', type: 'int' } ],
            body: this.forOrdinal
          },
          {
            name: 'forLabel',
            type: this.name,
            visibility: 'public',
            static: true,
            args: [ { name: 'label', type: 'String' } ],
            body: this.forLabel
          },
          {
            name: 'labels',
            type: 'String[]',
            visibility: 'public',
            static: true,
            body: this.labelsOutput
          }
        ]
      }
    }
  ],

  methods: [
    function labelForValue(value) {
        return '"' + value.label + '"';
    },
    function writeDeclarations(o) {
      o.indent();

      // Outputs declared enums
      for ( var i = 0 ; i < this.values.length ; i++ ) {
        var value = this.values[i];
        o.out(value.name, '(', value.ordinal, ',', this.labelForValue(value),')');
        
        if ( i == this.values.length - 1 ) { o.out(';\n\n')}
        else {o.out(', ')}
      }

      this.out = o;
    }
  ]
});

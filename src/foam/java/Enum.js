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
    ['javaType', 'java.lang.Enum'],
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser'],
  ],
  methods: [
    function outputJava(o) {
      function labelForValue(value) {
        return '"' + value.label + '"';
      }

      o.out('// DO NOT MODIFY BY HAND.\n');
      o.out('// GENERATED CODE\n\n');
      o.out('package ', this.package, ';\n\n');

      this.imports && this.imports.forEach(function(i) {
        o.out(i, ';\n');
      });

      o.out('\n');
      o.out(this.visibility, ' ', this.static ? 'static ' : '');
      o.out('enum ', this.name,' {\n');

      o.increaseIndent();
      o.indent();

      // Outputs declared enums
      for ( var i = 0 ; i < this.values.length ; i++ ) {
        var value = this.values[i];
        o.out(value.name, '(', value.ordinal, ',', labelForValue(value),')');
        
        if ( i == this.values.length - 1 ) { o.out(';')}
        else {o.out(', ')}
      }

      o.out('\n\n');
      o.indent();
      o.out('private final int ordinal_;\n');
      o.indent();
      o.out('private final String label_;\n');
      o.out('\n');

      // Constructor
      o.indent();
      o.out(this.name, '(int ordinal, String label) {\n');
      o.increaseIndent();
      o.indent();
      o.out('ordinal_ = ordinal;\n');
      o.indent();
      o.out('label_ = label;\n');
      o.decreaseIndent();
      o.indent();
      o.out('}');

      o.out('\n\n');

      // Getters
      o.indent();
      o.out('public int getOrdinal() { return ordinal_; }\n');
      o.indent();
      o.out('public String getLabel() { return label_; }');

      o.out('\n\n');

      // forOrdinal Function
      o.indent();
      o.out('public static ', this.name, ' forOrdinal(int ordinal) {\n');
      o.increaseIndent();

      o.indent();
      o.out('switch (ordinal) {\n')
      o.increaseIndent();
      for (var i = 0, value; value = this.values[i]; i++) {
        o.indent();
        o.out('case ', value.ordinal, ': ')
        o.out('return ', this.name, '.', value.name, ';\n');
      }

      forValueFunctionFooter();


      // forLabel Function
      o.indent();
      o.out('public static ', this.name, ' forLabel(String label) {\n');
      o.increaseIndent();

      o.indent();
      o.out('switch (label) {\n')
      o.increaseIndent();
      for (var i = 0, value; value = this.values[i]; i++) {
        o.indent();
        o.out('case ', '"' + value.label + '"', ': ')
        o.out('return ', this.name, '.', value.name, ';\n');
      }

      forValueFunctionFooter();


      function forValueFunctionFooter() {
        o.decreaseIndent();
        o.indent();
        o.out('}\n\n');
        o.indent();
        o.out('return null;\n')
        o.decreaseIndent();
        o.indent();
        o.out('}\n\n');
      }
      
      
      o.indent();
      o.out('public static String[] labels() {\n');
      o.increaseIndent();
      o.indent();
      o.out('return new String[] {\n');
      o.increaseIndent();

      for (var i = 0, value; value = this.values[i]; i++) {
        o.indent();
        o.out(labelForValue(value));
        if (i < this.values.length - 1) o.out(',');
        o.out('\n');
      }

      o.decreaseIndent();
      o.indent();
      o.out('};\n');
      o.decreaseIndent();
      o.indent();
      o.out('}\n');

      this.extras.forEach(function(c) { o.out(c, '\n'); });
      o.decreaseIndent();
      o.indent();
      o.out('}');
    },

    function toJavaSource() {
      var output = foam.java.Outputter.create();
      output.out(this);
      return output.buf_;
    }
  ]
});

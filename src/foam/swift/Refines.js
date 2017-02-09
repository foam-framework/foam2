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
  refines: 'foam.core.Property',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftType',
      value: 'Any?',
    },
    {
      class: 'String',
      name: 'swiftFactory'
    },
    {
      class: 'String',
      name: 'swiftValue',
      expression: function(value) {
        return foam.typeOf(value) === foam.String ? '"' + value + '"' :
          foam.typeOf(value) === foam.Undefined ? 'nil' :
          value;
      }
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      cls.fields.push(this.Field.create({
        name: this.swiftName,
        type: this.swiftType,
        defaultValue: this.swiftValue,
        initializer: this.swiftFactory,
      }));
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  requires: [
    'foam.swift.SwiftClass',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
  ],
  methods: [
    function toSwiftClass() {
      var cls = this.SwiftClass.create({
        name: this.swiftName,
      });
      for (var i = 0, axiom; axiom = this.axioms_[i]; i++) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls);
      }
      return cls;
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      name: 'swiftType',
      value: 'String',
    },
  ],
});

foam.CLASS({
  refines: 'foam.i18n.MessageAxiom',
  requires: [
    'foam.swift.Field',
    'foam.i18n.TranslationFormatStringParser',
  ],
  methods: [
    function writeToSwiftClass(cls) {
      var parser = this.TranslationFormatStringParser.create({
        value: this.message,
        translationHint: this.description,
      });
      var v = parser.parsedValue;
      var d = parser.parsedTranslationHint;
      cls.fields.push(this.Field.create({
        name: this.name,
        type: 'String',
        static: true,
        final: true,
        defaultValue: 'NSLocalizedString("'+v+'", comment: "'+d+'")',
      }));
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Action',
  requires: [
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftCode',
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftCode ) return;
      cls.methods.push(this.Method.create({
        name: this.name,
        body: this.swiftCode
      }));
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Argument',
  requires: [
    'foam.swift.Argument',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftLocalName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftExternalName',
      value: '_',
    },
    {
      class: 'String',
      name: 'swiftType',
    },
  ],
  methods: [
    function toSwiftArg() {
      return this.Argument.create({
        localName: this.swiftLocalName,
        externalName: this.swiftExternalName,
        type: this.swiftType,
      });
    },
  ]
});

foam.CLASS({
  refines: 'foam.core.Method',
  requires: [
    'foam.core.Argument',
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftCode',
    },
    {
      class: 'String',
      name: 'swiftReturnType',
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftCode ) return;
      var args = [];
      for (var i = 0, arg; arg = this.args[i]; i++) {
        args.push(this.Argument.create(arg).toSwiftArg());
      }
      cls.methods.push(this.Method.create({
        name: this.name,
        body: this.swiftCode,
        returnType: this.swiftReturnType,
        args: args,
      }));
    },
  ]
});

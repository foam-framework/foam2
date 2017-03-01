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
  refines: 'foam.core.Action',
  requires: [
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(name) {
        return foam.String.constantize(name);
      },
    },
    {
      name: 'code',
      value: function() {},
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftCode ) return;
      cls.methods.push(this.Method.create({
        name: this.swiftName,
        body: this.swiftCode,
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        visibility: 'public',
        static: true,
        final: true,
        name: this.swiftAxiomName,
        type: 'Action',
        initializer: this.swiftAxiomInit(),
      }));
    },
  ],
  templates: [
    {
      name: 'swiftAxiomInit',
      args: [],
      template: function() {/*
let a = Action()
a.name = "<%=this.swiftName%>"
a.label = "<%=this.label%>" // TODO localize
return a
      */},
    }
  ],
});

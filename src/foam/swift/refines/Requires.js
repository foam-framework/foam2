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
  refines: 'foam.core.Requires',
  requires: [
    'foam.swift.Argument',
    'foam.swift.Method',
  ],
  properties: [
    {
      name: 'swiftReturnType',
      expression: function(path) {
        return this.lookup(this.path).model_.swiftName;
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      cls.methods.push(this.Method.create({
        name: this.name + '_create',
        returnType: this.swiftReturnType,
        visibility: 'public',
	body: this.swiftInitializer(),
        args: [
          this.Argument.create({
            localName: 'args',
            defaultValue: '[:]',
            type: '[String:Any?]',
          }),
        ],
      }));
    },
  ],
  templates: [
    {
      name: 'swiftInitializer',
      args: [],
      template: function() {/*
return __subContext__.create(
    type: <%=this.swiftReturnType%>.self, args: args) as! <%=this.swiftReturnType%>
      */},
    },
  ],
});

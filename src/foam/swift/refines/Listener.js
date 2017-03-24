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
  refines: 'foam.core.Listener',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftListenerMethodName',
      expression: function(swiftName) { return swiftName + '_method'; },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom) {
      if ( !this.swiftCode ) return;
      cls.field(this.Field.create({
        name: this.swiftName,
        initializer: this.swiftInit(),
        type: 'Listener',
        override: !!(superAxiom && superAxiom.swiftCode),
        lazy: true,
      }));
      cls.method(this.Method.create({
        name: this.swiftListenerMethodName,
        body: this.swiftCode,
        args: [
          this.SwiftArgument.create({
            localName: 'sub',
            type: 'Subscription',
          }),
          this.SwiftArgument.create({
            localName: 'args',
            type: '[Any?]',
          }),
        ],
        visibility: 'private',
        override: !!(superAxiom && superAxiom.swiftCode),
      }));
    },
  ],
  templates: [
    {
      name: 'swiftInit',
      args: [],
      template: function() {/*
<% if ( this.isMerged || this.isFramed ) { %>

var triggered = false
return {sub, args in
  if triggered { return }
  triggered = true
  Timer.scheduledTimer(
      withTimeInterval: <%= (this.isMerged ? this.mergeDelay : 30)/1000 %>,
      repeats: false) { _ in
    triggered = false
    self.<%=this.swiftListenerMethodName%>(sub, args)
  }
} as (Subscription, [Any?]) -> Void

<% } else { %>

return {sub, args in
  <%=this.swiftListenerMethodName%>(sub, args)
} as (Subscription, [Any?]) -> Void

<% } %>
      */},
    }
  ],
});

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
  refines: 'foam.core.Import',
  requires: [
    'foam.swift.Field',
  ],
  methods: [
    function writeToSwiftClass(cls) {
      cls.fields.push(this.Field.create({
        name: this.name,
        type: 'Any?',
        getter: this.valueGetter(),
        setter: this.valueSetter(),
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        name: this.name + '$',
        type: 'Slot?',
        getter: this.slotGetter(),
        visibility: 'public',
      }));
    },
  ],
  templates: [
    {
      name: 'slotGetter',
      args: [],
      template: function() {/*
return __context__["<%=this.key%>$"] as? Slot ?? nil
      */},
    },
    {
      name: 'valueGetter',
      args: [],
      template: function() {/*
return __context__["<%=this.key%>"]
      */},
    },
    {
      name: 'valueSetter',
      args: [],
      template: function() {/*
self.<%=this.name%>$?.swiftSet(value)
      */},
    },
  ],
});

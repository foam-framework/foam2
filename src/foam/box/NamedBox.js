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
  package: 'foam.box',
  name: 'NamedBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.LookupBox',
  ],

  axioms: [
    foam.pattern.Multiton.create({ property: 'name' })
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        // RetryBox(LookupBox(name, NamedBox(subName)))
        // TODO Add retry box
        return this.LookupBox.create({
          name: this.getBaseName(),
          parentBox: this.getParentBox()
        });
      },
      swiftFactory: function() {/*
return self.LookupBox_create([
  "name": self.getBaseName(),
  "parentBox": self.getParentBox()
])
      */}
    }
  ],

  methods: [
    {
      name: 'getParentBox',
      returns: 'foam.box.Box',
      code: function() {
        return this.cls_.create({
          name: this.name.substring(0, this.name.lastIndexOf('/'))
        }, this);
      },
      swiftCode: function() {/*
var name = ""
if let index = self.name.range(of: "/", options: .backwards)?.lowerBound {
  name = String(self.name[..<index])
}
return ownClassInfo().create(args: [
  "name": name
], x: __subContext__) as! foam_box_Box
      */},
    },
    {
      name: 'getBaseName',
      returns: 'String',
      swiftReturns: 'String',
      code: function getBaseName() {
        return this.name.substring(this.name.lastIndexOf('/') + 1);
      },
      swiftCode: function getBaseName() {/*
if let index = name.range(of: "/", options: .backwards)?.lowerBound {
  return String(name[name.index(after: index)..<name.endIndex])
}
return ""
      */},
    },
  ]
});

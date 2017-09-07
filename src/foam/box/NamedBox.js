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

  implements: [ 'foam.box.Box' ],

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
      class: 'FObjectProperty',
      of: 'foam.box.Box',
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
      name: 'send',
      code: function(msg) {
        this.delegate.send(msg);
      },
      swiftCode: 'try delegate!.send(msg)',
    },

    {
      name: 'getParentBox',
      returns: 'foam.box.Box',
      code: function() {
        return this.cls_.create({
          name: this.name.substring(0, this.name.lastIndexOf('/'))
        }, this);
      },
      swiftCode: function() {/*
let index = name.range(of: ".", options: .backwards)!.lowerBound
return ownClassInfo().create([
  "name": name.substring(to: index)
], x: self.__subContext__) as! Box
      */},
    },

    {
      name: 'getBaseName',
      returns: 'String',
      code: function getBaseName() {
        return this.name.substring(this.name.lastIndexOf('/') + 1);
      },
      swiftCode: function getBaseName() {/*
let index = name.range(of: ".", options: .backwards)!.lowerBound
return name.substring(to: name.index(index, offsetBy: 1))
      */},
    },
  ]
});

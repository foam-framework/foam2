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
  name: 'LocalBoxRegistry',
  implements: [ 'foam.box.BoxRegistry' ],

  requires: [
    'foam.box.NoSuchNameException',
    'foam.box.ExportBox',
    'foam.box.SubBox'
  ],

  imports: [
    {
      name: 'me',
      key: 'me',
      type: 'foam.box.Box'
    }
  ],

  properties: [
    {
      class: 'Map',
      name: 'registry_',
      hidden: true,
      javaFactory: 'return new java.util.concurrent.ConcurrentHashMap();'
    }
  ],

  methods: [
    {
      name: 'doLookup',
      code: function doLookup(name) {
        if ( this.registry_[name] )
          return this.registry_[name];

        throw this.NoSuchNameException.create({ name: name });
      },
      swiftCode: function() {/*
let name = name!
if let exportBox = registry_[name] as? foam_box_ExportBox {
  return exportBox
}
throw NoSuchNameException_create(["name": name])
      */},
      javaCode: `
Object registration = getRegistry_().get(name);
if ( registration == null ) {
  throw new RuntimeException("No such name");
}
return (foam.box.ExportBox)registration;
`
    },
    {
      name: 'register',
      code: function(name, service, localBox) {
        name = name || foam.next$UID();

        var box = this.ExportBox.create({
          localBox: localBox,
          messengerBox: this.SubBox.create({
            name: name,
            delegate: this.me
          })
        });

        this.registry_[name] = box;

        box.onDetach(function() {
          if ( this.registry_[name] === box )
            this.unregister(name);
        }.bind(this));

        return box;
      },
      swiftSynchronized: true,
      swiftCode: `
let name: String = name ?? UUID().uuidString
let box = ExportBox_create([
  "localBox": box,
  "messengerBox": SubBox_create([
    "name": name,
    "delegate": me
  ])
])
registry_[name] = box
return box
      `,
      javaCode: `
if ( name == null ) name = Integer.toString(foam.box.IdGenerator.nextId());

foam.box.ExportBox exportBox = getX().create(foam.box.ExportBox.class);
foam.box.SubBox subBox = getX().create(foam.box.SubBox.class);
subBox.setName(name);
subBox.setDelegate(getMe());
exportBox.setMessengerBox(subBox);
exportBox.setLocalBox(box);

getRegistry_().put(name, exportBox);

return exportBox;
`
    },
    {
      name: 'unregister',
      code: function(name) {
        delete this.registry_[name];
      },
      swiftSynchronized: true,
      swiftCode: `
registry_.removeValue(forKey: name)
      `,
      javaCode: `
getRegistry_().remove(name);
`
    }
  ]
});

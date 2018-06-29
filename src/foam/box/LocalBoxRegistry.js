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
    'foam.box.SubBox'
  ],

  imports: [
    {
      name: 'me',
      key: 'me',
      javaType: 'foam.box.Box'
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

  classes: [
    {
      name: 'Registration',
      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          required: true,
          name: 'exportBox'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          required: true,
          name: 'localBox'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'doLookup',
      code: function doLookup(name) {
        if ( this.registry_[name] &&
             this.registry_[name].exportBox )
          return this.registry_[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      },
      swiftCode: function() {/*
if let exportBox = (registry_[name] as? Registration)?.exportBox {
  return exportBox
}
throw NoSuchNameException_create(["name": name])
      */},
      javaCode: `
Object registration = getRegistry_().get(name);
if ( registration == null ) {
  throw new RuntimeException("No such name");
}
return ((Registration)registration).getExportBox();
`
    },
    {
      name: 'register',
      code: function(name, service, localBox) {
        name = name || foam.next$UID();

        var exportBox = this.SubBox.create({ name: name, delegate: this.me });
        exportBox = service ? service.clientBox(exportBox) : exportBox;

        this.registry_[name] = {
          exportBox: exportBox,
          localBox: service ? service.serverBox(localBox) : localBox
        };

        return this.registry_[name].exportBox;
      },
      swiftSynchronized: true,
      swiftCode: function() {/*
let name: String = name ?? UUID().uuidString

var exportBox: foam_box_Box = SubBox_create([
  "name": name,
  "delegate": me
])
exportBox = service?.clientBox(exportBox) ?? exportBox

let registration = Registration_create([
  "exportBox": exportBox,
  "localBox": service?.serverBox(box) ?? box
])
registry_[name] = registration
return registration.exportBox
      */},
      javaCode: `
if ( name == null ) name = Integer.toString(foam.box.IdGenerator.nextId());

foam.box.SubBox exportBox = getX().create(foam.box.SubBox.class);
exportBox.setName(name);
exportBox.setDelegate(getMe());
Registration registration = new Registration();
registration.setX(getX());
registration.setExportBox(exportBox);
registration.setLocalBox(box);
// TODO(adamvy): Apply service policy

getRegistry_().put(name, registration);
return exportBox;
`
    },
    {
      name: 'unregister',
      code: function(name) {
        if ( foam.box.Box.isInstance(name) ) {
          for ( var key in this.registry_ ) {
            // TODO(markdittmer): Should there be a specialized compare() should
            // be implemented by NamedBox (to cut out delegate) and
            // foam.util.compare()?
            if ( this.registry_[key].exportBox === name ) {
              delete this.registry_[key];
              return;
            }
          }
          return;
        }

        delete this.registry_[name];
      },
      swiftSynchronized: true,
      swiftCode: function() {/*
if let name = name as? String {
  registry_.removeValue(forKey: name)
} else if let name = name as? AnyClass {
  for key in registry_.keys {
    if ((registry_[key] as! Registration).exportBox as? AnyClass) === name {
      registry_.removeValue(forKey: key)
      return
    }
  }
}
      */},
      javaCode: `
getRegistry_().remove(name);
`
    }
  ]
});

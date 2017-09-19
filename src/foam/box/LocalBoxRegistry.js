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
          name: 'exportBox'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'localBox'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'doLookup',
      returns: 'foam.box.Box',
      code: function doLookup(name) {
        if ( this.registry_[name] &&
             this.registry_[name].exportBox )
          return this.registry_[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      },
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
      returns: 'foam.box.Box',
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
      javaCode: `
if ( name == null ) name = Integer.toString(foam.box.IdGenerator.nextId());

foam.box.SubBox exportBox = getX().create(foam.box.SubBox.class);
exportBox.setName(name);
exportBox.setDelegate(getMe());
Registration registration = getX().create(Registration.class);
registration.setExportBox(exportBox);
registration.setLocalBox(box);
// TODO(adamvy): Apply service policy

getRegistry_().put(name, registration);
return exportBox;
`
    },
    {
      name: 'unregister',
      returns: '',
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
      javaCode: `
getRegistry_().remove(name);
`
    }
  ]
});

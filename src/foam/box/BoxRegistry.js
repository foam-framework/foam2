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
  name: 'BoxRegistry',

  requires: [
    'foam.box.NoSuchNameException',
    'foam.box.SubBox'
  ],

  imports: [
    'me'
  ],

  properties: [
    {
      class: 'Map',
      name: 'registry_',
      hidden: true,
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
          required: true,
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
      swiftCode: function() {/*
if let exportBox = (registry_[name] as? Registration)?.exportBox {
  return exportBox
}
throw NoSuchNameException_create(["name": name])
      */},
      throws: true,
      args: [
        {
          class: 'String',
          name: 'name',
        },
      ]
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
      swiftCode: function() {/*
let name: String = name as? String ?? String(FOAM_utils.next$UID())

var exportBox: Box = SubBox_create([
  "name": name,
  "delegate": me
])
exportBox = service?.clientBox(exportBox) ?? exportBox

let registration = Registration_create([
  "exportBox": exportBox,
  "localBox": service?.serverBox(localBox) ?? localBox
])
registry_[name] = registration
return registration.exportBox!
      */},
      args: [
        {
          swiftClass: 'String?', // TODO better class+required:false
          name: 'name',
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.BoxService',
          name: 'service',
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          required: true,
          name: 'localBox',
        },
      ],
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
      args: [
        'name'
      ]
    }
  ]
});

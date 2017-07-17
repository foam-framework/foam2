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
      name: 'registry',
      hidden: true,
      factory: function() { return {}; }
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
        if ( this.registry[name] &&
             this.registry[name].exportBox )
          return this.registry[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      },
      args: [
        'name'
      ]
    },
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, service, localBox) {
        name = name || foam.next$UID();

        var exportBox = this.SubBox.create({ name: name, delegate: this.me });
        exportBox = service ? service.clientBox(exportBox) : exportBox;

        this.registry[name] = {
          exportBox: exportBox,
          localBox: service ? service.serverBox(localBox) : localBox
        };

        return this.registry[name].exportBox;
      },
      args: [ 'name', 'service', 'box' ]
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        if ( foam.box.Box.isInstance(name) ) {
          for ( var key in this.registry ) {
            // TODO(markdittmer): Should there be a specialized compare() should
            // be implemented by NamedBox (to cut out delegate) and
            // foam.util.compare()?
            if ( this.registry[key].exportBox === name ) {
              delete this.registry[key];
              return;
            }
          }
          return;
        }

        delete this.registry[name];
      },
      args: [
        'name'
      ]
    }
  ]
});

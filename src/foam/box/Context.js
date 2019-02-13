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
  name: 'Context',
  swiftName: 'BoxContext',

  requires: [
    'foam.box.BoxRegistryBox',
    'foam.box.NamedBox',
    'foam.box.ClassWhitelistContext',
    'foam.box.LoggedLookupContext',
    {
      path: 'foam.net.WebSocketService',
      flags: ['js'],
    }
  ],

  exports: [
    'creationContext',
    'me',
    'messagePortService',
    'registry',
    'root',
    'socketService',
    'webSocketService'
  ],

  properties: [
    {
      name: 'messagePortService',
      hidden: true,
      factory: function() {
        var model = this.__context__.lookup('foam.messageport.MessagePortService', true);
        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'socketService',
      hidden: true,
      factory: function() {
        var model = this.__context__.lookup('foam.net.node.SocketService', true);
        if ( model ) {
          return model.create({
            port: Math.floor( 10000 + ( Math.random() * 10000 ) ),
            delegate: this.registry
          }, this);
        }
      },
      swiftFactory: `
return __context__.lookup("foam.swift.net.SocketService")!.create(args: [
  "delegate$": registry$,
], x: __subContext__)
      `,
    },
    {
      name: 'webSocketService',
      hidden: true,
      factory: function() {
        return this.WebSocketService.create({
          delegate: this.registry
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'registry',
      hidden: true,
      factory: function() {
        return this.BoxRegistryBox.create();
      },
      swiftFactory: 'return BoxRegistryBox_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'root',
      hidden: true,
      postSet: function(_, root) {
        foam.box.NamedBox.create({ name: '' }).delegate = root;
      },
      swiftPostSet: 'NamedBox_create(["name": ""]).delegate = newValue!',
    },
    {
      class: 'String',
      name: 'myname',
      hidden: true,
      swiftFactory:
          'return "/com/foamdev/anonymous/" + UUID().uuidString',
      factory: function() {
        return foam.isServer ?
          '/proc/' + require('process').pid + '/' + foam.uuid.randomGUID() :
          '/com/foamdev/anonymous/' + foam.uuid.randomGUID();
      }
    },
    {
      name: 'me',
      hidden: true,
      transient: true,
      factory: function() {
        var me = this.NamedBox.create({ name: this.myname });
        me.delegate = this.registry;
        return me;
      },
      swiftFactory: function() {/*
        let me = NamedBox_create(["name": self.myname])
        me.delegate = self.registry!
        return me
      */},
    },
    {
      class: 'Boolean',
      name: 'unsafe',
      value: true
    },
    {
      class: 'StringArray',
      name: 'classWhitelist'
    },
    {
      name: 'creationContext',
      documentation: `Provides required import for boxes that parse strings into
          FObjects.`,
      hidden: true,
      factory: function() {
        // TODO: Better way to inject the class whitelist.
        if ( this.unsafe ) {
          console.warn('**** Boxes are running in UNSAFE mode.  Turn this off before you go to production!');
          return this.LoggedLookupContext.create(null, this).__subContext__;
        }

        return this.ClassWhitelistContext.create({
          whitelist: this.classWhitelist
        }, this).__subContext__;
      },
      swiftFactory: `
return ClassWhitelistContext_create([
  "whitelist$": classWhitelist$,
]).__subContext__
      `,
    }
  ]
});

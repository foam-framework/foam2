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
  package: 'foam.box.node',
  name: 'ForkBox',
  extends: 'foam.box.PromisedBox',

  documentation: `A PromisedBox that resolves to a RawSocketBox connected to
      a newly forked child process.`,

  requires: [
    'foam.box.Message',
    'foam.box.ReplyBox',
    'foam.box.SocketBox',
    'foam.box.SubBox'
  ],
  imports: [
    'me',
    'registry',
    'socketService',
    'warn'
  ],

  // TODO(markdittmer): Turn these into static methods.
  constants: {
    OUTPUTTER_FACTORY: function() {
      return foam.json.Outputter.create({
        pretty: false,
        formatDatesAsNumbers: true,
        outputDefaultValues: false,
        useShortNames: false,
        strict: true,
        propertyPredicate: function(o, p) { return ! p.networkTransient; }
      });
    },
    PARSER_FACTORY: function(creationContext) {
      return foam.json.Parser.create({
        strict: true,
        creationContext: creationContext
      });
    }
  },

  properties: [
    {
      class: 'Boolean',
      documentation: `Whether child process should be detached from parent
          (https://nodejs.org/api/child_process.html#child_process_options_detached).`,
      name: 'detached'
    },
    {
      class: 'String',
      name: 'nodePath',
      documentation: 'The path to the Node JS binary.',
      value: 'node'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'nodeParams',
      documentation: `Parameters passed to Node JS before naming the top-level
          script to run.`
    },
    {
      class: 'String',
      name: 'childScriptPath',
      documentation: `DEPRECATED. Previously used to name the top-level script
          of the forked process.`,
      postSet: function() {
        this.warn(`foam.box.node.ForkBox.childScript is deprecated.
                       Use "appModule" instead.`);
      }
    },
    {
      class: 'String',
      name: 'appModule',
      documentation: `A Node JS module to run for loading application classes,
          data, and context. This module must return a foam.box.Context to be
          used for IPC with the parent process.`
    },
    {
      class: 'Array',
      of: 'String',
      name: 'appArgs',
      documentation: `Additional arguments listed after "appModule" in script
          invocation. The invocation will be:
              /path/to/node /path/to/foam/box/node/forkScript.js \
                  /path/to/appModule <appArgs>`
    },
    {
      class: 'String',
      name: 'childScriptPath_',
      documentation: `The top-level script used to load "appModule" and
          establish a connection with the parent process.`,
      value: `${__dirname}${require('path').sep}forkScript.js`,
      final: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      documentation: `Box used for child's SocketBox reply.`,
      name: 'replyBox_'
    },
    {
      name: 'child_',
      documentation: 'The Node ChildProcess object of the forked child process.'
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();

      this.delegate = new Promise(function(resolve, reject) {
        this.replyBox_ = this.ReplyBox.create({
          delegate: {
            send: function(message) {
              if ( ! this.SocketBox.isInstance(message.object) ) {
                reject(new Error('ForkBox failed to bind to child socket'));
              }
              resolve(message.object);
            }.bind(this)
          }
        });
      }.bind(this));
      this.registry.register(this.replyBox_.id, null, this.replyBox_);

      var childScriptPath = this.childScriptPath || this.childScriptPath_;
      var args = this.nodeParams.concat(childScriptPath);
      if ( this.appModule ) args.push(this.appModule);
      if ( this.appArgs ) args = args.concat(this.appArgs);

      this.child_ = require('child_process').spawn(this.nodePath, args,
                                                   { detached: this.detached });

      var process = require('process');
      this.child_.stdout.pipe(process.stdout);
      this.child_.stderr.pipe(process.stderr);

      this.socketService.listening$.sub(this.onSocketListening);
    },
    function validate() {
      this.SUPER();

      if ( this.childScriptPath && this.appModule ) {
        throw new Error(`foam.box.node.ForkBox: Cannot set both
                             "childScriptPath" and "appModule"`);
      }
      if ( this.appArgs.length > 0 && ! this.appModule ) {
        throw new Error(`foam.box.node.ForkBox: Cannot set "appArgs" without
                             setting "appModule"`);
      }
    }
  ],

  listeners: [
    function onSocketListening(sub, _, __, slot) {
      if ( ! slot.get() ) return;

      sub.detach();
      var outputter = this.OUTPUTTER_FACTORY();
      this.child_.stdin.end(
          outputter.stringify(this.SubBox.create({
            name: this.replyBox_.id,
            // TODO(markdittmer): RegisterSelfMessage should handle naming. Is
            // "name:" below necessary?
            delegate: this.SocketBox.create({
              name: this.me.name,
              address: `0.0.0.0:${this.socketService.port}`
            })
          }),
          'utf8',
          function() {
            this.child_.unref();
          }.bind(this)));
    }
  ]
});

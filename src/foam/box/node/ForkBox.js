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
    'error',
    'me',
    'registry',
    'socketService'
  ],

  // TODO(markdittmer): Turn these into static methods.
  constants: {
    // Outputter compatible with ForkBox.PARSER_FACTORY().
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
    // Parser compatible with ForkBox.OUTPUTTER_FACTORY().
    PARSER_FACTORY: function(creationContext) {
      return foam.json.Parser.create({
        strict: true,
        creationContext: creationContext
      });
    },
    // Static method for use by forked script to connect to parent process.
    // NOTE: context "ctx" should be a sub-context of a foam.box.Context.
    CONNECT_TO_PARENT: function(ctx) {
      ctx.socketService.listening$.sub(function(sub, _, __, slot) {
        if ( ! slot.get() ) return;

        sub.detach();
        var stdin = require('process').stdin;
        var buf = '';
        stdin.on('data', function(data) {
          buf += data.toString();
        });
        stdin.on('end', function() {
          var parser = foam.box.node.ForkBox.PARSER_FACTORY(
              ctx.creationContext);
          parser.parseString(buf, ctx).send(foam.box.Message.create({
            // TODO(markdittmer): RegisterSelfMessage should handle naming. Is
            // "name:" below necessary?
            object: foam.box.SocketBox.create({
              name: ctx.me.name,
              address: `0.0.0.0:${ctx.socketService.port}`
            })
          }));
        });
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
      class: 'Boolean',
      documentation: `Whether or not the child process is critical to the
          functioning of this process. I.e., whether or not this process
          should exit when child process exits.`,
      name: 'critical'
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
      documentation: `The top-level script of the forked process.`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      documentation: `Box used for child's SocketBox reply.`,
      name: 'replyBox_'
    },
    {
      name: 'child_',
      documentation: 'The Node ChildProcess object of the forked child process.',
      value: null
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

      this.child_ = require('child_process').spawn(
          this.nodePath,
          this.nodeParams.concat([ this.childScriptPath ]),
          { detached: this.detached });

      this.child_.on('exit', this.onChildExit);

      if (this.critical) {
        this.child_.on('error', this.onCriticalError);
        this.child_.on('exit', this.onCriticalError);
      }

      var process = require('process');
      process.on('exit', this.onExit);
      this.child_.stdout.pipe(process.stdout);
      this.child_.stderr.pipe(process.stderr);

      if ( this.socketService.listening ) {
        this.onSocketListening(foam.core.FObject.create(), null, null,
                               this.socketService.listening$);
      } else {
        this.socketService.listening$.sub(this.onSocketListening);
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
    },
    function onChildExit() { this.child_ = null; },
    function onExit() { this.child_ && this.child_.kill(); },
    function onCriticalError() {
      var process = require('process');
      this.error(`PID=${process.pid} exiting due to critical error in child
                      (PID=${this.child_ ? this.child_.pid : 'UNKNOWN'})`);
      process.exit(1);
    }
  ]
});

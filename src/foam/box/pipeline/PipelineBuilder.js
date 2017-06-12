
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
  package: 'foam.box.pipeline',
  name: 'PipelineBuilder',

  requires: [
    'foam.box.Box',
    'foam.box.BroadcastBox',
    'foam.box.Message',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnBox',
    'foam.box.pipeline.Pipeline'
  ],
  imports: [
    'registry'
  ],

  classes: [
    {
      name: 'RunnableRPCBox',
      extends: 'foam.box.ProxyBox',

      requires: [
        'foam.box.Message',
        'foam.box.RPCMessage'
      ],

      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'errorBox'
        },
      ],

      methods: [
        function send(inputMessage) {
          return this.delegate && this.delegate.send(this.Message.create({
            object: this.RPCMessage.create({
              name: 'run',
              args: [ inputMessage.object ],
            }),
            attributes: { errorBox: this.errorBox }
          }));
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.pipeline.Pipeline',
      name: 'pipeline',
      factory: function() { this.Pipeline.create(); }
    },
    {
      class: 'FObjectArray',
      of: 'foam.box.pipeline.PipelineBuilder',
      name: 'delegates',
      postSet: function(old, nu) {
        var pl = this.pipeline;

        if ( nu.length === 0 ) {
          // End of the line. Do not wrap RPCMessage around output.
          pl.output = pl.defaultOutput;
        } else if ( this.delegates.length === 1 ) {
          // Just one delegate. Wrap RPCMessage around output value.
          pl.output = this.RunnableRPCBox.create({
            delegate: nu[0].pipeline.remoteInput,
            errorBox: nu[0].pipeline.errorBox
          });
        } else {
          // Many delegates. Wrap RPCMessage around output value and pass along
          // to all delegates.
          pl.output = this.BroadcastBox.create({
              delegates: nu.map(function(pipelineBuilder) {
                return this.RunnableRPCBox.create({
                  delegate: pipelineBuilder.pipeline.remoteInput,
                  errorBox: pipelineBuilder.pipeline.errorBox
                });
              })
          });
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.box.pipeline.PipelineBuilder',
      name: 'parents_',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'builtInputBox_',
      value: null
    }
  ],

  methods: [
    function init() {
      this.validate();
      foam.assert(this.Box.isInstance(this.registry),
                  'Pipeline requires registry that implements Box');
      this.SUPER();
    },
    function then(runnable) {
      var pl = this.pipeline;
      if ( ! pl ) {
        this.pipeline = this.Pipeline.create({ runnable: runnable });
        return this;
      }

      var next = this.clone();
      var nextPL = next.pipeline = this.Pipeline.create();
      nextPL.runnable = runnable;
      next.parents_ = [ this ];
      this.delegates = this.delegates.concat([next]);
      return next;
    },
    function all() {
      var ret = [];
      for ( var i = 0; i < arguments.length; i++ ) {
        ret.push(this.then(arguments[i]));
      }
      return ret;
    },
    function first(runnable) {
      var prev = this.clone();
      var prevPL = prev.pipeline = this.Pipeline.create();
      prevPL.runnable = runnable;
      prev.delegates = [ this ];
      this.parents_ = this.parents_.concat([ prev ]);
      return prev;
    },
    function build() {
      if ( this.parents_.length === 0 ) return this.build_();
      else if ( this.parents_.length === 1 ) return this.parents_[0].build_();

      throw new Error('Attempted PipelineBuilder.build() with multiple parents. Use PipelineBuilder.buildAll() on pipelines with mulitiple heads.');
    },
    function buildAll() {
      if ( this.parents_.length === 0 ) return [ this.build_() ];

      return this.parents_.map(function(parent) { return parent.build_(); })
          .reduce(function(acc, v) { return acc.concat(v); });
    },
    function build_() {
      if ( this.builtInputBox_ ) return this.builtInputBox_;

      var pl = this.pipeline;
      var onRegisteredBox = this.RPCReturnBox.create();
      var onRegisteredPromise = onRegisteredBox.promise;
      this.registry.send(this.Message.create({
        object: this.RPCMessage.create({
          name: 'register',
          args: [ null, null, pl.localInput ]
        }),
        attributes: {
          replyBox: onRegisteredBox,
          errorBox: pl.errorBox
        }
      }));
      pl.remoteInput.delegate = onRegisteredPromise;

      // Accept input objects as input; return box that will wrap them in RPCs
      // to runnable.
      return this.builtInputBox_ = this.RunnableRPCBox.create({
        delegate: pl.remoteInput,
        errorBox: pl.errorBox
      });
    }
  ]
});

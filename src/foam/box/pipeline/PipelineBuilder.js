
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

  documentation: `A builder pattern for composing pipelines of foam.box.Runnable
    instances. Pipelines may fork via multiple then()s or an all(), and may
    merge via multiple first()s. Pipelines may not contain cycles.

    Note that each runnable is registered as a service exactly once, even if
    a builder referring to pipeline stages is built multiple times.

    E.g.,

    var b = PipelineBuilder.create();
    var shared = b.then(sharedRunnable);

    // Equivalent to shared.all(forkRunnable1, forkRunnable2).
    shared.then(forkRunnable1);
    shared.then(forkRunnable2);

    shared.first(mergeRunnable1);
    shared.first(mergeRunnable2);

    // A builder referring to any stage in the pipeline will do here:
    (/* b or */ shared).build();
    // Yields array of input boxes for: [ mergeRunnable1, mergeRunnable2 ]
    // on pipeline:
    //
    // mergeRunnable1 --                       -- forkRunnable1
    //                  >-- sharedRunnable -- <
    // mergeRunnable2 --                       -- forkRunnable2`,

  requires: [
    'foam.box.Box',
    'foam.box.BroadcastBox',
    'foam.box.LogBox',
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
          documentation: `Error box for routing errors when sending to
              runnable.`,
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
      of: 'foam.box.Box',
      name: 'defaultOutputBox',
      documentation: `Output box used for end-of-computation (when no
          next-to-run delegates bound to this step in the pipeline).`,
      factory: function() { return this.LogBox.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.pipeline.Pipeline',
      name: 'pipeline',
      documentation: 'Pipeline step for encapsulating runnable.',
      factory: function() { this.Pipeline.create(); }
    },
    {
      class: 'FObjectArray',
      of: 'foam.box.pipeline.PipelineBuilder',
      name: 'delegates',
      documentation: `Immediate next step(s) in the pipeline after this runnable
          step.`,
      postSet: function(old, nu) {
        var pl = this.pipeline;

        if ( nu.length === 0 ) {
          // End of the line. Do not wrap RPCMessage around output box.
          pl.runnable.outputBox = this.defaultOutputBox;
        } else if ( this.delegates.length === 1 ) {
          // Just one delegate. Wrap RPCMessage around output value.
          pl.runnable.outputBox = this.RunnableRPCBox.create({
            delegate: nu[0].pipeline.remoteInput,
            errorBox: nu[0].pipeline.errorBox
          });
        } else {
          // Many delegates. Wrap RPCMessage around output value and pass along
          // to all delegates.
          pl.runnable.outputBox = this.BroadcastBox.create({
              delegates: nu.map(function(pipelineBuilder) {
                return this.RunnableRPCBox.create({
                  delegate: pipelineBuilder.pipeline.remoteInput,
                  errorBox: pipelineBuilder.pipeline.errorBox
                });
              }.bind(this))
          });
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.box.pipeline.PipelineBuilder',
      name: 'parents',
      documentation: `Immediate previous step(s) in the pipeline before this
          runnable step.`,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'builtInputBox_',
      documentation: `Input box that can be returned from building this
          builder. Accepts messages containing this runnable step's inputType.`,
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
    {
      name: 'then',
      returns: { typeName: 'foam.box.PipelineBuilder' },
      args: [ { typeName: 'foam.box.Runnable' } ],
      documentation: `Append an immediate next step to pipeline.`,
      code: function(runnable) {
        var pl = this.pipeline;
        if ( ! pl ) {
          this.pipeline = this.Pipeline.create({ runnable: runnable });
          return this;
        }

        var next = this.cls_.create({
          pipeline: this.Pipeline.create({ runnable: runnable }),
          parents: [ this ]
        }, this.__subContext__);
        this.delegates = this.delegates.concat([ next ]);
        return next;
      }
    },
    {
      name: 'all',
      documentation: `Append multiple immediate next steps to pipeline.`,
      returns: { typeName: 'foam.box.PipelineBuilder' },
      args: [ { typeName: 'foam.box.Runnable', repeats: true } ],
      code: function() {
        var ret = [];
        for ( var i = 0; i < arguments.length; i++ ) {
          ret.push(this.then(arguments[i]));
        }
        return ret;
      }
    },
    {
      name: 'first',
      documentation: `Prepend an immediate previous step in the pipeline.`,
      returns: { typeName: 'foam.box.PipelineBuilder' },
      args: [ { typeName: 'foam.box.Runnable' } ],
      code: function(runnable) {
        var prev = this.cls_.create({
          pipeline: this.Pipeline.create({ runnable: runnable }),
          delegates: [ this ]
        }, this.__subContext__);
        this.parents = this.parents.concat([ prev ]);
        return prev;
      }
    },
    {
      name: 'build',
      documentation: `Build the entire pipeline, assuming one head.`,
      returns: {
        typeName: 'foam.box.Box',
        documentation: `An input box accepting messages containing the inputType
            of head's runnable.`
      },
      code: function() {
        if ( this.parents.length === 0 ) {
          return this.build_();
        } else if ( this.parents.length === 1 ) {
          this.build_();
          return this.parents[0].build();
        }

        throw new Error('Attempted PipelineBuilder.build() with multiple parents. Use PipelineBuilder.buildAll() on pipelines with mulitiple heads.');
      }
    },
    {
      name: 'buildAll',
      documentation: `Build the entire pipeline, allowing multiple heads.`,
      returns: {
        typeName: 'Array[foam.box.Box]',
        documentation: `Input boxes accepting messages containing the inputTypes
            of each head's runnable. Boxes are in the order they first()ed to
            the merge points in the pipeline.`
      },
      code: function() {
        if ( this.parents.length === 0 ) return [ this.build_() ];

        this.build_();

        // Flatten arrays of heads build_()ing backwards in the pipeline.
        return this.parents.map(function(parent) { return parent.buildAll(); })
            .reduce(function(acc, v) { return acc.concat(v); }, []);
      }
    },
    function build_() {
      // Build forward, just in case build() was initiated in the middle of a
      // pipeline. NOTE: This is incompatible with circular pipelines.
      this.delegates.map(function(delegate) { return delegate.build_(); });

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


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
  name: 'PipelineManager',

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

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.pipeline.Pipeline',
      name: 'pipeline'
    },
    {
      class: 'FObjectArray',
      of: 'foam.box.pipeline.PipelineManager',
      name: 'delegates',
      postSet: function(old, nu) {
        var pl = this.pipeline;

        // Get non-RPCMessage-wrapped box. This is the output's delegate if
        // wrapping occurred before (i.e. old value was non-empty), otheriwse,
        // it's just the output.
        var plRemoteBox = old.length > 0 ? pl.output.delegate : pl.output;

        if ( nu.length === 0 ) {
          // End of the line. Do not wrap RPCMessage around output.
          pl.output = pl.defaultOutput;
        } else if ( this.delegates.length === 1 ) {
          // Just one delegate. Wrap RPCMessage around output value.
          pl.output = nu[0].remoteInput;
        } else {
          // Many delegates. Wrap RPCMessage around output value and pass along
          // to all delegates.
          this.output = this.BroadcastBox.create({
            delegates: nu.map(function(pipelineBuilder) {
              return pipelineBuilder.remoteInput;
            })
          });
        }
      }
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
      if ( ! pl.runnable ) {
        pl.runnable = runnable;
        return this;
      }

      var next = this.clone();
      var nextPL = next.pipeline = this.Pipeline.create();
      nextPL.runnable = runnable;
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
    function build() {
      var pl = this.pipeline;
      //var onRegisteredBox = ;
      var onRegisteredPromise = onRegisteredBox.promise;
      this.registry.send(this.Message.create({
        object: this.RPCMessage.create({
          name: 'register',
          args: [ null, null, pl.localInput ]
        }),
        attributes: {
          replyBox: onRegisteredBox.RPCReturnBox.create(),
          errorBox: pl.errorBox
        }
      }));
      pl.remoteInput.delegate = onRegisteredPromise;

      return pl.remoteInput;
    }
  ]
});

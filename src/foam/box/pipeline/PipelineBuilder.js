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

  documentation: `Simplified builder pattern for constructing pipeliens.

    E.g.,

    var merge1 = PipelineBuilder.create().append(mergeRunnable1);
    var merge2 = PipelineBuilder.create().append(mergeRunnable2);
    var sharedAndF1 = PipelineBuilder.create().append(sharedRunnable);
    var f2 = sharedAndF1.fork(forkRunnable2);

    sharedAndF1.append(forkRunnable1);
    merge1.append(sharedAndF1);
    merge2.append(sharedAndF1);

    var inputBoxForMerge1 = merge1.build();
    var inputBoxForMerge2 = merge2.build();
    // Yields input boxes for mergeRunnable1 and mergeRunnable2
    // on pipeline:
    //
    // mergeRunnable1 --                       -- forkRunnable1
    //                  >-- sharedRunnable -- <
    // mergeRunnable2 --                       -- forkRunnable2`,

  requires: [
    'foam.box.Runnable',
    'foam.box.pipeline.PipelineManager'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.pipeline.PipelineManager',
      name: 'head_',
      value: null
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.pipeline.PipelineManager',
      name: 'tail_',
      value: null
    }
  ],

  methods: [
    function append(o) {
      if ( this.Runnable.isInstance(o) )
        return this.appendRunnable_(o);
      else if ( this.cls_.isInstance(o) )
        return this.appendPipeline_(o);

      throw new Error('Pipeline: Do not know how to append ' + o.toString());
    },
    function fork(o) {
      var ret = this.cls_.create(null, this.__subContext__).append(o);
      this.tail_.bind(ret.head_);
      return ret;
    },
    function build() {
      return this.head_.build();
    },
    function appendRunnable_(runnable) {
      if ( ! this.head_ ) {
        this.head_ = this.tail_ = this.PipelineManager.create().then(runnable);
        return this;
      }

      this.tail_ = this.tail_.then(runnable);
      return this;
    },
    function appendPipeline_(pipeline) {
      this.tail_.bind(pipeline.head_);
      // Don't use clone(); shallow copy.
      return this.cls_.create({
        head_: this.head_ || pipeline.head_,
        tail_: pipeline.tail_
      }, this.__subContext__);
    }
  ]
});

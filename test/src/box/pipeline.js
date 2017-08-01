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


describe('box pipeline', function() {
  var MyInt;
  var SquareIt;
  var AddOne;
  var ctx;
  var defaultOutputBox;
  var defaultErrorBox;
  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'MyInt',
      properties: [ { class: 'Int', name: 'value' } ]
    });
    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'SquareIt',
      extends: 'foam.box.Runnable',

      methods: [
        function run(x) {
          this.output(MyInt.create({ value: x.value * x.value }));
        }
      ]
    });
    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'AddOne',
      extends: 'foam.box.Runnable',

      methods: [
        function run(x) {
          this.output(MyInt.create({ value: x.value + 1 }));
        }
      ]
    });
    MyInt = foam.lookup('foam.box.pipeline.test.MyInt');
    SquareIt = foam.lookup('foam.box.pipeline.test.SquareIt');
    AddOne = foam.lookup('foam.box.pipeline.test.AddOne');

    foam.CLASS({
      package: 'foam.box.pipeline.test',
      name: 'AccumulatorBox',
      implements: [ 'foam.box.Box' ],

      properties: [
        {
          class: 'Array',
          name: 'outputs',
        },
      ],

      methods: [
        function send(message) {
          this.outputs.push(message.object.value);
        },
        function clear() { this.outputs = []; }
      ]
    });
    var AccumulatorBox = foam.lookup('foam.box.pipeline.test.AccumulatorBox');

    defaultOutputBox = AccumulatorBox.create();
    defaultErrorBox = AccumulatorBox.create();

    ctx = foam.__context__ = foam.__context__.createSubContext(
        foam.box.Context.create()).createSubContext({
          defaultOutputBox: defaultOutputBox,
          defaultErrorBox: defaultErrorBox
        });
  });

  function buildAndExpect(pipelineBuilder, inputValue, outputValues) {
    defaultOutputBox.clear();
    defaultErrorBox.clear();
    pipelineBuilder.build().send(
        foam.box.Message.create({
          object: foam.lookup('foam.box.pipeline.test.MyInt').create({
            value: inputValue
          })
        }));
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        expect(defaultOutputBox.outputs).toEqual(outputValues);
        expect(defaultErrorBox.outputs).toEqual([]);
        resolve();
      }, 10);
    });
  }
  it('works with complex pipelines', function(done) {

    // Construct:
    // ^2 --           -- ^2
    //       >-- ^2 --<
    // +1 --           -- +1

    // First ^2.
    var builder1 = foam.box.pipeline.PipelineBuilder.create(null, ctx);
    builder1.append(SquareIt.create());
    // First +1.
    var builder2 = foam.box.pipeline.PipelineBuilder.create(null, ctx);
    builder2.append(AddOne.create());
    // ^2 -- ^2 following builder1 and builder2.
    var builder3 = foam.box.pipeline.PipelineBuilder.create(null, ctx);
    builder3.append(SquareIt.create());
    builder1.append(builder3);
    builder2.append(builder3);
    // +1 following first ^2 from builder3.
    var builder4 = builder3.fork(AddOne.create());
    builder3.append(SquareIt.create());


    // Outputs come lower-branch first in order that pipeline is drawn.

    // ^2 --           -- ^2
    //       >-- ^2 --<
    //                 -- +1
    buildAndExpect(builder1, 2, [ 17, 256 ]).then(function() {
      //                 -- ^2
      //       >-- ^2 --<
      // +1 --           -- +1
      return buildAndExpect(builder2, 2, [ 10, 81 ]);
    }).then(function() {
      //       -- ^2
      // ^2 --<
      //       (-- +1 from builder4 fork)
      return buildAndExpect(builder3, 2, [ 5, 16 ]);
    }).then(function() {
      // +1
      return buildAndExpect(builder4, 2, [ 3 ]);
    }).then(done, done.fail);
  });
});

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

describe('round robin box', function() {
  var RoundRobinBox;
  var OutputIDBox;
  var ctx;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.RoundRobinBox.test',
      name: 'OutputIDBox',
      implements: [ 'foam.box.Box' ],

      properties: [ 'id' ],

      methods: [
        function send(message) {
          console.log(`Box ID: ${this.id}, Message: ${message}`);
        },
      ],
    });

    RoundRobinBox = foam.lookup('foam.box.RoundRobinBox');
    OutputIDBox = foam.lookup('foam.box.RoundRobinBox.test.OutputIDBox');
  });

  it('should send the outputs to the correct boxes', function() {
    console.log = jasmine.createSpy('log');

    // Creating 10 boxes for output.
    var outputLen = 10;
    var boxes = [];
    for (var i = 0; i < outputLen; i++) {
      boxes.push(OutputIDBox.create({ id: i }));
    }

    // Create RoundRobinBox with outputLen number of OutputIDBoxes.
    var roundRobinBox = RoundRobinBox.create({ delegates: boxes });

    // Sending 25 outputs.
    for (var i = 0; i < 25; i++) {
      roundRobinBox.send(i);
      expect(console.log).toHaveBeenCalledWith(
          `Box ID: ${i % outputLen}, Message: ${i}`);
    }
  });
});

/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

(typeof require !== "undefined") &&  require("../../src/foam.js");

/**
  Outputs tests to run under the Jasmine unit test framework
*/
foam.CLASS({
  package: 'test.helpers',
  name: 'JasmineOutput',

  imports: [ 'exemplarRegistry as registry' ],

  properties: [
    {
      class: 'String',
      name: 'filename',
    },
    {
      name: 'fs',
      factory: function() {
        return require('fs');
      }
    }
  ],

  methods: [

    function outputSuite(exemplars) {
      var indent = { level: 1 };

      var code = 'require(\'../helpers/testcontext\');\n';

      //code += 'describe(\'' + this.filename + '\', function() {\n';

      exemplars.forEach((e) => code += this.outputTest(e, indent));

      //code += '});\n';

      return code;
    },

    function outputTest(exemplar, indent) {
      var code =
        '  describe(\'' + exemplar.name + '\', function() {\n' +
        '    var oldContext;\n' +
        '    it(\'post condition runs\', function(' +
        ( exemplar.runsAsync ? 'done' : '' ) +
          ') {\n';
      indent.level += 2;

      code += exemplar.generateTest(indent);

      if ( exemplar.runsAsync ) {
        code += '      .then(done);\n';
      }
      code += '    });\n'

      code += '  });\n'
      indent.level -= 2;

      return code;
    }

  ]
});



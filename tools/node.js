/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

eval('var FOAMargs = ' + process.argv.slice(2)[0]);

require('../src/foam.js');
require('../src/foam/dao/OrDAO.js');
require('../src/foam/dao/NodeModelFileDAO.js');

foam.CLASS({
  name: 'NodeModelExecutor',
  requires: [
    'foam.dao.OrDAO',
    'foam.dao.NodeModelFileDAO',
  ],
  imports: [
    'arequire',
  ],
  exports: [
    foam.String.daoize(foam.core.Model.name),
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'classpaths',
    },
    {
      name: 'modelId',
    },
    {
      name: 'modelArgs',
    },

    {
      name: foam.String.daoize(foam.core.Model.name),
      expression: function(classpaths) {
        var modelDao = this.NodeModelFileDAO.create({
          classpath: classpaths[0],
        });
        for (var i = 1, classpath; classpath = classpaths[i]; i++) {
          modelDao = this.OrDAO.create({
            delegate: modelDao,
            primary: this.NodeModelFileDAO.create({
              classpath: classpath, 
            }),
          });
        }
        return modelDao;
      },
    },
  ],
  methods: [
    function execute() {
      var modelArgs = this.modelArgs;
      return this.__subContext__.arequire(this.modelId).then(function(model) {
        return model.create(modelArgs).execute();
      });
    }
  ],
});

var executor = foam.lookup('NodeModelExecutor').create(FOAMargs);
executor.execute();

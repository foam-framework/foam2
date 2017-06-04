/**
 * @license
 * Copyright 2017 The FOAM Authors, All Rights Reserved.
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
  package: 'foam.classloader',
  name: 'NodeJsModelExecutor',

  requires: [
    'foam.classloader.OrDAO',
    'foam.classloader.NodeModelFileDAO'
  ],

  imports: [
    'arequire'
  ],

  exports: [
    foam.String.daoize(foam.core.Model.name),
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'classpaths'
    },
    {
      name: 'modelId'
    },
    {
      name: 'modelArgs'
    },
    {
      name: foam.String.daoize(foam.core.Model.name),
      expression: function(classpaths) {
        var modelDao = this.NodeModelFileDAO.create({
          classpath: classpaths[0],
        });
        for ( var i = 1, classpath ; classpath = classpaths[i] ; i++ ) {
          modelDao = this.OrDAO.create({
            delegate: modelDao,
            primary: this.NodeModelFileDAO.create({
              classpath: classpath,
            })
          });
        }
        return modelDao;
      }
    }
  ],

  methods: [
    function fromArgs(argv) {
      for ( var i = 0 ; i < argv.length ; i++ ) {
        if ( argv[i].startsWith('--classpath=') ) {
          this.classpaths = argv[i].substring(12).split(':').map(function(p) {
            return require('path').isAbsolute(p) ? p : require('path').join(process.cwd(), p);
          });
          continue;
        }
        this.modelId = argv[i];
      }
      return this;
    },
    function execute() {
      var self = this;
      var modelArgs = this.modelArgs;
      var X = this.__subContext__;
      var modelId = this.modelId;

      return X.arequire(modelId)
        .catch(console.log)
        .then(function() {
          return X.lookup(modelId).create(modelArgs, self).execute();
        })
        .catch(console.log);
    }
  ]
});

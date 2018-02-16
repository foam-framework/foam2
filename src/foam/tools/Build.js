/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.json2.Serializer',
  ],

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'modelId',
      value: 'foam.tools.Build',
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'StringArray',
      name: 'flags',
      value: ['web'],
    },
    {
      hidden: true,
      name: 'outputter',
      factory: function() {
        var flags = this.flags;
        return this.Serializer.create({
          axiomPredicate: function(a) {
            if ( a.flags ) {
              for ( var i = 0; i < flags.length; i++ ) {
                if ( p.flags[flags[i]] ) return true;
              }
              return false;
            }
            return true;
          }
        });
      },
    },
  ],

  actions: [
    function execute() {
      var self = this;
      self.modelDAO.find(self.modelId).then(function(m) {
        self.output = self.outputter.stringify(self.__subContext__, m);
      });
    }
  ]
});

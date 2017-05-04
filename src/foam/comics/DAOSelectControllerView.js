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
  package: 'foam.comics',
  name: 'DAOSelectControllerView',
  extends: 'foam.u2.Element',
  imports: [
    'stack',
  ],
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( nu ) this.stack.back();
      }
    },
    {
      name: 'dao',
      view: { class: 'foam.u2.view.TableView' }
    },
    {
      class: 'Boolean',
      name: 'allowCreation',
      value: true
    }
  ],
  methods: [
    function initE() {
       this.startContext({
        data: this,
        selection: this.data$
      }).add(this.DAO).
        start('span').show(this.allowCreation$).add(this.CREATE).end().
        endContext();
    },
    function fromProperty(prop) {
      if ( prop.of && ! this.dao ) {
        this.dao = this.__context__[foam.String.daoize(prop.of.name)];
      }
    }
  ],
  actions: [
    {
      name: 'create',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateControllerView',
          dao: this.dao
        });
      }
    }
  ]
});

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
  name: 'DAOUpdateControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOUpdateController',
    'foam.u2.ControllerMode',
    'foam.u2.DisplayMode',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'stack',
    'dao? as importedDAO'
  ],

  exports: [
    'controllerMode',
    'data'
  ],

  css: `
    ^ {
      max-width: 1024px;
      margin: auto;
    }
    ^action-container {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    ^action-container > div > div > * + * {
      margin-left: 8px;
    }
    ^detail-container {
      overflow-x: scroll;
    }
  `,

  properties: [
    {
      name: 'key'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.importedDAO;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOUpdateController',
      name: 'data',
      factory: function() {
        return this.DAOUpdateController.create({
          data: this.key,
          dao: this.dao
        });
      }
    },
    {
      class: 'String',
      name: 'title',
      expression: function(data$dao$of) {
        return 'Edit ' + data$dao$of.name;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'detailView'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      class: 'Boolean',
      name: 'editEnabled'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'container_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'detailViewElement_'
    }
  ],

  reactions: [
    [ 'data', 'finished', 'onFinished' ],
    [ 'data', 'throwError', 'onThrowError' ]
  ],

  methods: [
    function initE() {
      /* Doesn't work because obj isn't known yet.
      this.startContext({data: this.data.obj})
        .add(this.data.dao.of.getAxiomsByClass(foam.core.Action))
      .endContext()
      */
      this
        .addClass(this.myClass())

        // Container for the actions
        .start()
          .addClass(this.myClass('action-container'))

          // Actions grouped to the left
          .start()
            .startContext({ data: this })
              .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
            .endContext()
          .end()

          // Actions grouped to the right
          .start()
            .start()
              .show(this.mode$.map((m) => m === this.DisplayMode.RW))
              .add(this.data.cls_.getAxiomsByClass(foam.core.Action))
            .end()
            .start()
              .show(this.mode$.map((m) => m === this.DisplayMode.RW))
              .startContext({ data: this })
                .add(this.EDIT)
              .endContext()
            .end()
          .end()
        .end()

        // Container for the detailview
        .start('div', [], this.container_$)
          .addClass(this.myClass('detail-container'))
          .tag(this.detailView, {
            of: this.dao.of,
            data$: this.data$.dot('obj'),
            showActions: true
          }, this.detailViewElement_$)
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function() {
        this.stack.back();
      }
    },
    {
      name: 'edit',
      isAvailable: function(controllerMode, editEnabled) {
        return editEnabled && controllerMode === this.ControllerMode.VIEW;
      },
      code: function() {
        this.controllerMode = this.ControllerMode.EDIT;
        var newE = this.container_.createChild_(this.detailView, {
          of: this.dao.of,
          data$: this.data$.dot('obj'),
          showActions: true
        });
        this.container_.replaceChild(newE, this.detailViewElement_);
        this.detailViewElement_ = newE;
      }
    }
  ],

  listeners: [
    function onFinished() {
      this.stack.back();
    },
    function onThrowError() {
      var self = this;
      this.add(this.NotificationMessage.create({
        message: self.data.exception.message,
        type: 'error'
     }));
    }
  ]
});

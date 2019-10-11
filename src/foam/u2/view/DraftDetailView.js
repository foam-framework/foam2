/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DraftDetailView',
  extends: 'foam.u2.View',

  documentation: `
    A detail view that holds off on updating the given object until the user clicks save.
    TODO: Nested property change events. Without this, this view does not know if nested
    properties have changed so modifying a property on an FObjectProperty won't change the
    action's state.
  `,

  css: `
    ^ .foam-u2-ActionView-save {
      margin-top: 8px;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.DetailView' }
    },
    {
      class: 'FObjectProperty',
      name: 'workingData'
    },
    {
      class: 'Boolean',
      name: 'hasDiff'
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(hasDiff) { return hasDiff },
      isAvailable: function (controllerMode) {
        return controllerMode != foam.u2.ControllerMode.VIEW;
      },
      code: function() { this.data = this.workingData; }
    },
  ],

  reactions: [
    ['', 'propertyChange.workingData', 'updateHasDiff'],
    ['workingData', 'propertyChange', 'updateHasDiff'],
    ['data', 'propertyChange', 'updateHasDiff'],
    ['', 'propertyChange.data', 'updateWorkingData'],
  ],
  listeners: [
    {
      name: 'updateWorkingData',
      isFramed: true,
      code: function() {
        this.workingData = this.data && this.data.clone();
      }
    },
    {
      name: 'updateHasDiff',
      isFramed: true,
      code: function() {
        this.hasDiff = ! this.data.equals(this.workingData);
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .tag(this.view, { data$: this.workingData$ })
        .startContext({ data: this })
          .tag(this.SAVE, { buttonStyle: 'SECONDARY' })
        .endContext();
    }
  ]
});

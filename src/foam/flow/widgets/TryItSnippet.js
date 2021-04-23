/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'TryItSnippet',
  extends: 'foam.u2.Element',

  imports: [ 'innerFLOW' ],

  requires: [
    'foam.nanos.script.Script',
    'foam.u2.view.PreView'
  ],

  properties: [
    {
      name: 'server',
      class: 'Boolean'
    },
    {
      name: 'code',
      class: 'Code'
    },
    {
      name: 'scriptOutput',
      class: 'String',
      updateVisibility: 'RO',
      view: { class: 'foam.u2.view.PreView' },
    },
    {
      name: 'scriptId',
      factory: () => foam.uuid.randomGUID()
    },
    {
      name: 'script',
      class: 'FObjectProperty',
      of: 'foam.nanos.script.Script',
      factory: function () {
        return this.Script.create({
          id$: this.scriptId$,
          code$: this.code$,
          server$: this.server$,
          output$: this.scriptOutput$,
          isSynchronous: true
        });
      }
    }
  ],

  methods: [
    function init() {
      this.code = this.innerFLOW;
      this.innerFLOW$.sub(() => {
        this.code = this.innerFLOW;
      })
    },
    function initE() {
      this
        .tag(this.SERVER.view, { data$: this.server$ })
        .tag(this.CODE.view, { data$: this.code$ })
        .tag(this.SCRIPT_OUTPUT.view, { data$: this.scriptOutput$ })
        .startContext({ data: this })
          .tag(this.RUN)
        .endContext()
        ;
    },
  ],

  actions: [
    {
      name: 'run',
      tableWidth: 90,
      confirmationRequired: function() {
        return true;
      },
      code: function() {
        return this.script.run();
      }
    }
  ]
});
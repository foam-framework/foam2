/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DebugWizardletView',
  extends: 'foam.u2.Controller',

  imports: [
    'wizardlets'
  ],

  requires: [
    'foam.u2.wizard.internal.PropertyUpdate',
    'foam.dao.MDAO',
    'foam.u2.view.ScrollTableView'
  ],

  css: `
    ^ {
      margin-top: 15pt;
      /* using double borders here is only okay because it's a debugging tool */
      border: 3pt solid /*%DESTRUCTIVE3%*/ #C00;
    }
    ^title {
      background-color: /*%DESTRUCTIVE3%*/ #C00;
      color: #FFF;
      padding: 8pt;
      font-size: 14pt;
    }
    ^subtitle {
      background-color: /*%DESTRUCTIVE4%*/ #C55;
      color: #FFF;
      padding: 2pt 8pt;
      font-size: 12pt;
    }
  `,

  properties: [
    {
      name: 'wizardlet',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      name: 'reloadCount',
      label: 'Reload Count',
      postSet: function (o, n) {
        console.log('--', o, n);
      },
      class: 'Int'
    },
    'propertyUpdateDAO'
  ],

  methods: [
    function init() {
      this.SUPER();
      console.log(`Hello I exist ${this.id}`);
      if ( ! this.wizardlet ) {
        throw new Error('must be initialized with wizardlet');
      }
      this.propertyUpdateDAO = this.MDAO.create({ of: this.PropertyUpdate });
      var s = this.wizardlet.getDataUpdateSub();
      s.sub(() => {
        this.propertyUpdateDAO.put(this.PropertyUpdate.create({
          id: s.get()
        }));
        console.log('happen', this.id);
        this.reloadCount++;
      });
    },
    function initE() {
      this.onDetach(() => {
        console.log('----');
        debugger;
      });
      this.SUPER();
      this
        .addClass(this.myClass())
        .startContext({ controllerMode: 'VIEW' })
          .start()
            .addClass(this.myClass('title'))
            .add('Developer Tools')
          .end()
          .start()
            .addClass(this.myClass('subtitle'))
            .add(this.wizardlet.title$)
          .end()
          .start()
              .tag(this.reloadCount$)
              .tag(this.RELOAD_COUNT)
          .end()
          .tag(this.ScrollTableView, {
            data$: this.propertyUpdateDAO$
          })
          .start()
            .tag(this.SAVE)
            .tag(this.LOAD_ACTION)
          .end()
        .endContext()
        ;
    }
  ],

  actions: [
    function save() {
      console.log('AAA');
      try {
        this.wizardlet.save();
      } catch (e) {
        console.log('oh no');
        console.error(e);
      }
    },
    {
      name: 'loadAction',
      label: 'Load',
      code: function loadAction() {
        this.wizardlet.load();
      }
    }
  ]
});

/*
foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DebugWizardlet',
  extends: 'foam.u2.crunch.BaseWizardlet',

  requires: [
    'foam.u2.crunch.NullWAO',
    'foam.u2.wizard.WizardletSection'
  ],

  properties: [
    {
      name: 'friend',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      name: 'wao',
      factory: function () {
        return this.NullWAO.create();
      }
    },
    {
      name: 'sections',
      factory: function () {
        return [
          this.WizardletSection.create({
            customView: {
              class: 'foam.u2.crunch.wizardflow.DebugWizardletView'
            }
          })
        ];
      }
    }
  ],
});
*/

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DebugWAO',
  extends: 'foam.u2.wizard.ProxyWAO',
  flags: ['web'],

  imports: ['waoEvent'],

  requires: [
    'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.CapableWAO',
  ],

  properties: [
    { name: 'listen', class: 'Boolean', value: true },
    { name: 'trap', class: 'Boolean' }
  ],

  methods: [
    async function save(w) {
      if ( this.listen ) this.waoEvent.pub('save', w);
      if ( this.trap ) return;
      return await this.SUPER(w);
    },
    async function load(w) {
      if ( this.listen ) this.waoEvent.pub('load', w);
      if ( this.trap ) return;
      return await this.SUPER(w);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DebugAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  topics: ['waoEvent'],

  imports: [
    'wizardlets'
  ],

  exports: [
    'waoEvent'
  ],

  requires: [
    'foam.u2.wizard.ProxyWAO',
    'foam.u2.wizard.WizardletSection',
    'foam.u2.crunch.wizardflow.DebugWAO'
  ],

  methods: [
    async function execute() {
      for ( let wizardlet of this.wizardlets ) {
        if ( wizardlet.isVisible ) {
          wizardlet.sections.push(this.WizardletSection.create({
            title: 'Debug',
            isAvailable: true,
            customView: {
              class: 'foam.u2.crunch.wizardflow.DebugWizardletView',
              wizardlet: wizardlet
            }
          }));
        }
        if ( ! this.ProxyWAO.isInstance(wizardlet.wao) ) continue;
        wizardlet.wao = this.DebugWAO.create({ delegate: wizardlet.wao });
      }
      console.log('DebugAgent is ON');
    }
  ]
});

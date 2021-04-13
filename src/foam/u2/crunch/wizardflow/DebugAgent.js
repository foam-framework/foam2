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
    'foam.u2.view.ScrollTableView',
    'foam.u2.borders.CollapseBorder',
  ],

  css: `
    ^ {
      margin-top: 15pt;
      border: 3pt solid /*%DESTRUCTIVE3%*/ #C00;
      border-radius: 6px;
    }
    ^title {
      background-color: /*%DESTRUCTIVE3%*/ #C00;
      color: #FFF;
      padding: 2pt 8pt;
      font-size: 12pt;
    }
    ^ .foam-u2-borders-CollapseBorder.expanded {
      border-bottom: 0;
      border-left: 0;
      border-right: 0;
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
      class: 'Int'
    },
    'propertyUpdateDAO'
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.wizardlet ) {
        throw new Error('must be initialized with wizardlet');
      }
      this.propertyUpdateDAO = this.MDAO.create({ of: this.PropertyUpdate });
      var s = this.wizardlet.getDataUpdateSub();
      var seqNo = 0;
      s.sub(() => {
        var propertyUpdate = s.get();
        if ( ! this.PropertyUpdate.isInstance(propertyUpdate) ) {
          propertyUpdate = this.PropertyUpdate.create({
            path: '%unknown%'
          });
        }
        propertyUpdate.seqNo = ++seqNo;
        this.propertyUpdateDAO.put(propertyUpdate);
        this.reloadCount++;
      });
    },
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('title'))
          .add('Developer Tools: ')
          .add(this.wizardlet.title$)
        .end()
        .startContext({ controllerMode: 'VIEW' })
          .start(this.CollapseBorder, {
            title: 'Property Updates',
            expanded: false
          })
            .tag(this.ScrollTableView, {
              data$: this.propertyUpdateDAO$.map(dao =>
                dao.orderBy(this.PropertyUpdate.SEQ_NO))
            })
          .end()
          .start(this.CollapseBorder, {
            title: 'Debug Actions',
            expanded: false
          })
            .start()
              .tag(this.SAVE)
              .tag(this.LOAD_ACTION)
            .end()
          .end()
        .endContext()
        ;
    }
  ],

  actions: [
    function save() {
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
            title: 'Developer Tools',
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

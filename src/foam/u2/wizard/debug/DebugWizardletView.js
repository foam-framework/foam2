/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'DebugWizardletView',
  extends: 'foam.u2.Controller',

  imports: [
    'debugContextIntercept',
    'wizardlets'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.u2.borders.CollapseBorder',
    'foam.u2.view.ScrollTableView',
    'foam.u2.wizard.debug.DebugWAO',
    'foam.u2.wizard.debug.PropertyEvent',
    'foam.u2.wizard.debug.WAOEvent',
    'foam.u2.wizard.debug.WizardEvent',
    'foam.u2.wizard.internal.PropertyUpdate'
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
    'wizardEventDAO'
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.wizardlet ) {
        throw new Error('must be initialized with wizardlet');
      }
      this.wizardEventDAO = this.MDAO.create({ of: this.WizardEvent });
      var s = this.wizardlet.getDataUpdateSub();
      var seqNo = 0;
      this.debugContextIntercept.stubMethodCalled.sub((_1, _2, ev) => {
        ev.seqNo = ++seqNo;
        this.wizardEventDAO.put(ev);
      });
      if ( this.DebugWAO.isInstance(this.wizardlet.wao) ) {
        this.wizardlet.wao.waoEvent.sub((_1, _2, ev) => {
          this.wizardEventDAO.put(this.WAOEvent.create({
            method: ev,
            seqNo: ++seqNo
          }));
        })
      }
      s.sub(() => {
        var propertyUpdate = s.get();
        if ( ! this.PropertyUpdate.isInstance(propertyUpdate) ) {
          propertyUpdate = this.PropertyUpdate.create({
            path: '%unknown%'
          });
        }
        this.wizardEventDAO.put(this.PropertyEvent.create({
          data: propertyUpdate,
          seqNo: ++seqNo
        }));
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
              data$: this.wizardEventDAO$.map(dao =>
                dao.orderBy(this.WizardEvent.SEQ_NO))
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

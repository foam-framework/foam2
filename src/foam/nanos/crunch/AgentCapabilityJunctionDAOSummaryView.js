/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AgentCapabilityJunctionDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  imports: [
    'auth'
  ],

  exports: [
    'customAuth as auth'
  ],

  // css: `
  //   .foam-nanos-crunch-AgentCapabilityJunctionDAOSummaryView-actions-header .foam-u2-ActionView-tertiary:focus:not(:hover) {
  //     border-color: transparent;
  //   }
  // `,

  classes: [
    {
      name: 'CustomAuth',
      extends: 'foam.nanos.auth.ProxyAuthService',
      imports: ['auth', 'userDAO'],
      properties: [
        {
          name: 'ucj'
        }
      ],
      methods: [
        async function check(X, permission) {
          var user = await this.userDAO.find(this.ucj.effectiveUser);
          return this.auth.checkUser(null, user, permission);
        }
      ]
    }
  ],

  properties: [
    {
      name: 'customAuth',
      factory: function() {
        return this.CustomAuth.create({ delegate: this.auth, ucj: this.data });
      }
    },
    // {
    //   name: 'primary',
    //   factory: function() {
    //     return this.SUBMIT;
    //   }
    // },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      factory: function() {
        return foam.nanos.crunch.ui.CapableView.create({ ucjObj: this.data, showTitle: true }, this);
      }
    },
    {
      class: 'Boolean',
      name: 'hideTop',
      value: true
    }
  ],
  // actions: [
  //   {
  //     name: 'back',
  //     code: (data) => {
  //       let self = data.data;
  //       self.controllerMode == foam.u2.ControllerMode.EDIT ? self.controllerMode = foam.u2.ControllerMode.VIEW : self.stack.back();
  //     }
  //   },
  //   {
  //     name: 'edit',
  //     isEnabled: () => true,
  //     isAvailable: () => true,
  //     code: function() {
  //       this.controllerMode = foam.u2.ControllerMode.EDIT;
  //     }
  //   },
  //   {
  //     name: 'submit',
  //     isEnabled: () => true,
  //     isAvailable: () => true,
  //     code: function(x) {
  //       let self = x.c;
  //       self.controllerMode = foam.u2.ControllerMode.VIEW;
  //     }
  //   }
  // ]
});
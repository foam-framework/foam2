/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.View',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit'
  ],

  imports: [
    'capabilityAquired',
    'capabilityCache',
    'capabilityCancelled',
    'capabilityDAO',
    'crunchController',
    'notify',
    'stack',
    'user',
    'userCapabilityJunctionDAO'
  ],

  properties: [
    {
      name: 'capabilityOptions',
      class: 'StringArray'
    },
    {
      name: 'capabilityView',
      class: 'foam.u2.ViewSpec',
      factory: function () {
        return 'foam.u2.crunch.CapabilityCardView';
      }
    }
  ],

  messages: [
    { name: 'REJECTED_MSG', message: 'Your choice to bypass this was stored, please refresh page to revert cancel selection.'}
  ],

  css: `
    ^ {
      width: 1024px;
      margin: auto;
    }
    ^detail-container {
      overflow-x: scroll;
    }
  `,

  methods: [
    function initE() {
      this.capabilityOptions.forEach((c) => {
        if ( this.capabilityCache.has(c) && this.capabilityCache.get(c) === true ) {
          capabilityAquired = true;
          this.stack.back();
        }
      });

      var view = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('detail-container'))
          .add(this.slot(function (capabilityOptions) {
            var spot = this.E('span')
            this.capabilityDAO.where(
                this.IN(view.Capability.ID, capabilityOptions))
              .select().then((result) => {
                let arr = result.array;
                let grid = view.Grid.create();
                for ( let i = 0 ; i < arr.length; i++ ) {
                  let cap = arr[i];
                  grid == grid
                    .start(view.GUnit, { columns: 4 })
                      .tag(view.capabilityView, { data: cap })
                      .on('click', () => {
                        var p = view.crunchController.launchWizard(cap.id);
                        p.then(() => {
                          // Query UCJ status
                          this.userCapabilityJunctionDAO.where(this.AND(
                            this.EQ(this.UserCapabilityJunction.SOURCE_ID, this.user.id),
                            this.EQ(this.UserCapabilityJunction.TARGET_ID, cap.id)
                          )).limit(1).select(this.PROJECTION(
                            this.UserCapabilityJunction.STATUS
                          )).then(results => {
                            if ( results.array.length < 1 ) {
                              view.reject();
                              return;
                            }
                            var entry = results.array[0]; // limit 1
                            var status = entry[0]; // first field (status)
                            switch (status) {
                              case this.CapabilityJunctionStatus.GRANTED:
                                view.aquire();
                                break;
                              default:
                                view.reject();
                                break;
                            }
                          });
                        })
                      })
                    .end();
                  spot.add(grid);
                }
              })
            return spot;
          }))
        .end()
        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
        .endContext();
    },
    function aquire() {
      this.capabilityAquired = true;
      this.capabilityOptions.forEach((c) => {
        this.capabilityCache.set(c, true);
      });
      this.stack.back();
    },
    function reject() {
      this.capabilityCancelled = true;
      this.capabilityOptions.forEach((c) => {
        this.capabilityCache.set(c, true);
      });
      this.notify(this.REJECTED_MSG);
      this.stack.back();
    }
  ],

  actions: [
    {
      name: 'cancel',
      label: 'Not interested in adding this functionality',
      code: function() {
        this.reject();
      }
    }
  ]
});

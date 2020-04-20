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
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.crunch.CapabilityCardView',
    'foam.nanos.crunch.Capability'
  ],

  imports: [
    'capabilityAquired',
    'capabilityCancelled',
    'crunchController',
    'stack'
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
      var view = this;
      this
        .addClass(this.myClass())

        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
          .tag(this.AQUIRE, { buttonStyle: 'SECONDARY' })
        .endContext()

        .start()
          .addClass(this.myClass('detail-container'))
          .add(this.slot(function (capabilityOptions) {
            var spot = this.E('span')
            this.data.where(
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
                        view.crunchController.launchWizard(cap.id);
                        // TODO: after wizard is done set capabilityAquired
                        //       or capabilityCancelled
                      })
                    .end()
                    ;
                  spot.add(grid);
                }
              })
            return spot;
          }))
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function() {
        this.stack.back();
        if ( ! this.capabilityAquired ) this.capabilityCancelled = true;
      }
    },
    {
      name: 'aquire',
      label: 'return with capabilityAquired=true',
      code: function() {
        this.capabilityAquired = true;
        this.stack.back();
      }
    }
  ]
});


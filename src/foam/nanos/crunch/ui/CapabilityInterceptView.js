/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.comics.BrowserView',
    'foam.comics.SearchMode',
    'foam.nanos.crunch.Capability'
  ],

  imports: [
    'capabilityAquired',
    'capabilityCancelled',
    'stack'
  ],

  properties: [
    'data',
    {
      class: 'StringArray',
      name: 'capabilityOptions'
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
      this
        .addClass(this.myClass())

        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
          .tag(this.AQUIRE, { buttonStyle: 'SECONDARY' })
        .endContext()

        // Container for the detailview
        .start()
          .addClass(this.myClass('detail-container'))
          // TODO: Replace with Capability selection view appropriate for any user
          .tag(this.BrowserView.create({
            searchMode: this.SearchMode.SIMPLE,
            data: this.data.where(
              this.CONTAINS(this.capabilityOptions, this.Capability.ID))
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
      code: function() {
        this.stack.back();
        this.capabilityAquired = true;
      }
    }
  ]
});

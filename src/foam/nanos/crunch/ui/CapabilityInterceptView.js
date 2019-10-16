foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.nanos.crunch.Capability'
  ],

  imports: [
    'stack'
  ],

  properties: [
    { name: 'data' },
    { name: 'capabilityOptions', class: 'StringArray' }
  ],

  css: `
    ^ {
      width: 1024px;
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

  methods: [
    function initE() {
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
        .end()

        // Container for the detailview
        .start()
          .addClass(this.myClass('detail-container'))
          // TODO: 
          .tag(foam.comics.BrowserView.create({
            searchMode: foam.comics.SearchMode.SIMPLE,
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
      }
    }
  ]
});
foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityStore',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.Tab',
    'foam.u2.Tabs',
    'foam.u2.UnstyledTabs',
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.crunch.CapabilityFeatureView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
  ],

  imports: [
    'capabilityDAO',
    'registerElement'
  ],

  messages: [
    { name: 'TAB_ALL', message: 'All' }
  ],

  css: `
    ^ {
      max-width: 1024px;
      margin: auto;
      padding: 12px 24px 24px 24px;
    }
    ^four-column-grid {
      justify-content: space-between;
    }
  `,
  
  properties: [
    {
      name: 'featuredCapabilities',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find four capabilities to feature.
      `,
      factory: function () {
        return this.capabilityDAO;
      }
    },
    {
      name: 'capabilitySections',
      class: 'FObjectArray',
      of: 'foam.u2.crunch.CapabilityStoreSection',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      window.cstore = self;

      self
        .addClass(self.myClass())
        .add(self.slot(function (capabilitySections) {
          // TODO: When possible, reduce slot scope to exclude "All" tab
          return this.E()
            .start(self.Tabs)
              .start(self.Tab, { label: this.TAB_ALL, selected: true })
                .add(self.renderFeatured())
              .end()
              .forEach(capabilitySections, function (section) {
                this
                  .start(self.Tab, { label: section.label })
                    .add(self.renderSection(section))
                  .end()
              })
            .end()
        }))
        ;
    },
    function renderFeatured() {
      var self = this;
      return self.E()
        // Featured Capabilities
        .add(self.slot(function (featuredCapabilities) {
          var spot = this.E('span');
          featuredCapabilities.select().then((result) => {
            let arr = result.array;
            let grid = self.Grid.create();
            grid
              .addClass(self.myClass('four-column-grid'))
              ;
            for ( let i=0 ; i < arr.length ; i++ ) {
              let cap = arr[i];
              grid = grid
                .start(self.GUnit, { columns: 3 })
                  .tag(self.CapabilityFeatureView, { data: cap })
                .end()
                ;
            }
            spot.add(grid);
          });
          return spot;
        }))
        // Capability Store Sections
        .add(self.slot(function (capabilitySections) {
          return this.E('span')
            .forEach(capabilitySections, function(section) {
              var sectionElement = this.E('span');
              this
                .start('h3')
                  .add(section.label)
                .end()
                .add(sectionElement)
                ;
              section.previewDAO.select().then((result) => {
                let arr = result.array;
                let grid = self.Grid.create();
                for ( let i=0 ; i < arr.length ; i++ ) {
                  let cap = arr[i];
                  grid = grid
                    .start(self.GUnit, { columns: 4 })
                      .tag(self.CapabilityCardView, { data: cap })
                    .end()
                    ;
                }
                sectionElement.add(grid);
              })
            })
            ;
        }))
        ;
    },
    function renderSection(section) {
      var self = this;
      var sectionElement = this.E();
      section.fullDAO.select().then((result) => {
        let arr = result.array;
        let grid = self.Grid.create();
        for ( let i=0 ; i < arr.length ; i++ ) {
          let cap = arr[i];
          grid = grid
            .start(self.GUnit, { columns: 4 })
              .tag(self.CapabilityCardView, { data: cap })
            .end()
            ;
        }
        sectionElement.add(grid);
      })
      return sectionElement;
    }
  ]
});
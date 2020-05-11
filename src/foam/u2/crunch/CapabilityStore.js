/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityStore',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.u2.Tab',
    'foam.u2.Tabs',
    'foam.u2.UnstyledTabs',
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.crunch.CapabilityFeatureView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
  ],

  imports: [
    'auth',
    'capabilityCategoryDAO',
    'capabilityDAO',
    'capabilityCategoryCapabilityJunctionDAO',
    'registerElement',
    'crunchController'
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
      display: flex;
      flex-direction: row;
      height: fit-content;
      align-items: stretch;
    }
  `,
  
  properties: [
    {
      name: 'visibleCapabilityDAO',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO with only visible capabilities.
      `,
      factory: function () {
        return this.capabilityDAO.where(this.EQ(
          this.Capability.VISIBLE, true));
      }
    },
    {
      name: 'featuredCapabilities',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find four capabilities to feature.
      `,
      factory: function () {
        return this.visibleCapabilityDAO.where(this.IN(
          "featured", this.Capability.KEYWORDS));
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.signingOfficerQuestion();
      
      var self = this;
      window.cstore = self;

      self
        .addClass(self.myClass())
        .start(self.Tabs)
          .start(self.Tab, { label: this.TAB_ALL, selected: true })
            .add(self.renderFeatured())
          .end()
          // TODO: replace this .call with a .select once
          //       duplication error is fixed
          .call(function() {
            self.capabilityCategoryDAO.select().then((a) => {
              for ( let i=0; i < a.array.length; i++ ) {
                let category = a.array[i];
                let e = self.Tab.create({ label: category.name })
                  .add(self.renderSection(category))
                  ;
                this.add(e);
              }
            });
          })
        .end();
    },
    function renderFeatured() {
      var self = this;
      return self.E()
        // Featured Capabilities
        .add(self.slot(function (featuredCapabilities) {
          var spot = this.E('span');
          featuredCapabilities.select().then((result) => {
            let arr = result.array;
            let grid = self.E();
            grid
              .addClass(self.myClass('four-column-grid'))
              ;
            for ( let i=0 ; i < arr.length ; i++ ) {
              let cap = arr[i];
              grid = grid
                .start('div', { columns: 3 })
                  .style({
                    flex: 0,
                    display: 'flex',
                    height: 'auto'
                  })
                  .start(self.CapabilityFeatureView, { data: cap })
                    .style({
                      flex: 0,
                      height: 'auto'
                    })
                  .end()
                  .on('click', () => {
                    self.crunchController.launchWizard(cap.id);
                  })
                .end()
                ;
            }
            spot.add(grid);
          });
          return spot;
        }))
        // Capability Store Section Previews
        .select(self.capabilityCategoryDAO, function(category) {
          var sectionElement = this.E('span');
          var returnElement = this.E()
            .start('h3')
              .add(category.name)
            .end()
            .add(sectionElement)
            ;
          var previewIdsPromise = self.getCategoryDAO_(category.id).limit(6)
            .select().then(arraySink => arraySink.array.map(x => x.targetId) );

          previewIdsPromise.then(capabilityIds => {
            self.visibleCapabilityDAO.where(
              self.IN(self.Capability.ID, capabilityIds)
            ).select().then((result) => {
              let arr = result.array;
              let grid = self.Grid.create();
              for ( let i=0 ; i < arr.length ; i++ ) {
                let cap = arr[i];
                grid = grid
                  .start(self.GUnit, { columns: 4 })
                    .tag(self.CapabilityCardView, { data: cap })
                    .on('click', () => {
                      self.crunchController.launchWizard(cap.id);
                    })
                  .end()
                  ;
              }
              sectionElement.add(grid);
            });
          });
          return returnElement;
        })
        ;
    },
    function renderSection(category) {
      var self = this;
      var sectionElement = this.E();

      // Promise 'p' reports capability IDs that are in this category
      var p = self.getCategoryDAO_(category.id)
        .select().then(arraySink => arraySink.array.map(x => x.targetId) );

      // When 'p' resolves, query all matching capabilities
      p.then(capabilityIds => {
        self.visibleCapabilityDAO.where(
          self.IN(self.Capability.ID, capabilityIds)
        ).select().then((result) => {
          let arr = result.array;
          let grid = self.Grid.create();
          for ( let i=0 ; i < arr.length ; i++ ) {
            let cap = arr[i];
            grid = grid
              .start(self.GUnit, { columns: 4 })
                .tag(self.CapabilityCardView, { data: cap })
                .on('click', () => {
                  self.crunchController.launchWizard(cap.id);
                })
              .end()
              ;
          }
          sectionElement.add(grid);
        });
      });
      return sectionElement;
    },
    function getCategoryDAO_(categoryId) {
      return this.capabilityCategoryCapabilityJunctionDAO.where(
        this.EQ(
          this.CapabilityCategoryCapabilityJunction.SOURCE_ID,
          categoryId));
    },
    function signingOfficerQuestion() {
      return this.auth.check(this.__subContext__, "businessHasSigningOfficer");
    }
  ]
});
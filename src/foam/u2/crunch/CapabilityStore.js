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
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.crunch.CapabilityFeatureView',
    'foam.u2.Element',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.Tab',
    'foam.u2.Tabs',
    'foam.u2.UnstyledTabs'
  ],

  imports: [
    'auth',
    'ctrl',
    'capabilityCategoryCapabilityJunctionDAO',
    'capabilityCategoryDAO',
    'capabilityDAO',
    'crunchController',
    'registerElement'
  ],

  messages: [
    { name: 'TAB_ALL', message: 'All' }
  ],

  css: `
    ^ {
      margin: auto;
      padding: 12px 24px 24px 24px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
    }

    ^feature-column-grid {
      display: inline-flex;
      width: 94%;
      overflow: hidden;
    }

    ^featureSection {
      flex: 0;
      height: auto;
    }

    ^perFeature {
      display: flex;
      padding-bottom: 10px;
    }

    ^left-arrow {
      width: 3%;
      float: left;
      transform: scaleX(-1);
      display: flex;
      padding-top: 70px;
      /* HOVER OFF */
      -webkit-transition: padding 2s;
    }

    ^right-arrow {
      width: 3%;
      float: right;
      display: flex;
      padding-top: 70px;
      margin-left: -20px;
      z-index: 10000;
      position: relative;
      /* HOVER OFF */
      -webkit-transition: padding 2s;
    }

    ^right-arrow:hover {
      transform: scale(1.2);
      /* HOVER ON */
      -webkit-transition: border-radius 2s;
    }

    ^left-arrow:hover {
      transform: scaleX(-1) scale(1.2);
      /* HOVER ON */
      -webkit-transition: border-radius 2s;
    }

    ^container {
      display: inline-block;
      width: 100%;
      height: fit-content;
      overflow-y: visible;
    }
  `,

  properties: [
    {
      name: 'visibleCapabilityDAO',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO with only visible capabilities.
      `,
      factory: function() {
        return this.capabilityDAO
          .where(this.EQ(this.Capability.VISIBLE, true));
      }
    },
    {
      name: 'featuredCapabilities',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find capabilities to feature.
      `,
      factory: function() {
        return this.visibleCapabilityDAO
          .where(this.IN('featured', this.Capability.KEYWORDS));
      }
    },
    {
      name: 'visibleCategoryDAO',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find categories that are visible.
      `,
      expression: function(capabilityCategoryDAO) {
        return capabilityCategoryDAO
          .where(this.EQ(this.CapabilityCategory.VISIBLE, true));
      }
    },
    {
      name: 'carouselCounter',
      class: 'Int',
      documentation: 'left and right scroll counter for featureCardArray index'
    },
    {
      name: 'totalNumCards',
      class: 'Int',
      documentation: 'should be equivalent to featureCardArray.length'
    },
    {
      name: 'featureCardArray',
      value: [],
      documentation: 'stores the styling of each featureCapability'
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
        .add(self.renderFeatured())
        .add(self.accountAndAccountingCard())
        // NOTE: TEMPORARILY REMOVED
        // .start(self.Tabs)
        //   .start(self.Tab, { label: this.TAB_ALL, selected: true })
        //     .add(self.renderFeatured())
        //     .add(self.accountAndAccountingCard())
        //   .end()
        //   // TODO: replace this .call with a .select once
        //   //       duplication error is fixed
        //   .call(function() {
        //     self.visibleCategoryDAO.select().then(a => {
        //       for ( let i = 0 ; i < a.array.length ; i++ ) {
        //         let category = a.array[i];
        //         let e = self.Tab.create({ label: category.name })
        //           .add(self.renderSection(category));
        //         this.add(e);
        //       }
        //     });
        //   })
        .end();
    },

    function renderFeatured() { // Featured Capabilities in carousel view
      var self = this;
      var spot = self.E();
      return this.E().start()// .style({ 'height': 'fit-content', 'overflow-y': 'visible' })
        .addClass(this.myClass('container'))
        .add(this.slot(function(featuredCapabilities) {
          featuredCapabilities.select().then(result => {
            var arr = result.array;
            self.totalNumCards = arr.length;
            self.featureCardArray = [];
            for ( let i = 0 ; i < self.totalNumCards ; i++ ) { // build featured cards as elements
              self.featureCardArray.push(
                () => self.Element.create().start()
                  .addClass(self.myClass('perFeature'))
                  .start(self.CapabilityFeatureView, { data: arr[i] })
                    .addClass(self.myClass('featureSection'))
                  .end()
                  .on('click', () => {
                    self.crunchController
                      .createWizardSequence(arr[i].id).execute();
                  })
                .end());
            }
            spot.start('span').start('img').addClass(self.myClass('left-arrow'))
                .attr('src', 'images/carouselArrow.svg')
                .on('click', function() {
                  self.carouselCounter--;
                })
              .end().end();
            spot.add(self.slot(
              function(carouselCounter, totalNumCards) {
                var ele = self.E().addClass(self.myClass('feature-column-grid'));
                for ( var k = 0 ; k < totalNumCards ; k++ ) {
                  let cc = carouselCounter % totalNumCards; // this stops any out of bounds indecies
                  let index = ( cc + totalNumCards + k ) % totalNumCards; // this ensures circle indecies
                  ele = ele.add(self.featureCardArray[index].call(self));
                }
                return ele;
              }));
            spot.start('span').start('img').addClass(self.myClass('right-arrow'))
              .attr('src', 'images/carouselArrow.svg')
              .on('click', function() {
                self.carouselCounter++;
              })
            .end().end();
          });
          return spot;
       })).end();
    },

    function accountAndAccountingCard() {
      // Capability Store Section Previews
      var self = this;
      return self.E()
        .select(self.visibleCategoryDAO$proxy, function(category) {
          var sectionElement = this.E('span');
          var returnElement = this.E()
            .start('h3')
              .add({ data : category, clsInfo : category.cls_.NAME.name, default : category.name })
            .end()
            .add(sectionElement);
          var previewIdsPromise = self.getCategoryDAO_(category.id).limit(6)
            .select().then(arraySink => arraySink.array.map(x => x.targetId) );

          previewIdsPromise.then(capabilityIds => {
            self.visibleCapabilityDAO.where(
              self.IN(self.Capability.ID, capabilityIds)
            ).select().then(result => {
              let arr = result.array;
              let grid = self.Grid.create();
              for ( let i = 0 ; i < arr.length ; i++ ) {
                let cap = arr[i];
                grid = grid
                  .start(self.GUnit, { columns: 4 })
                    .tag(self.CapabilityCardView, { data: cap })
                    .on('click', () => {
                      self.crunchController
                        .createWizardSequence(cap).execute();
                    })
                  .end();
              }
              sectionElement.add(grid);
            });
          });
          return returnElement;
        });
    },

    function renderSection(category) {
      var self = this;
      var sectionElement = this.E();

      // Promise 'p' reports capability IDs that are in this category
      var p = self.getCategoryDAO_(category.id).select(
        self.PROJECTION(self.CapabilityCategoryCapabilityJunction.TARGET_ID));

      // When 'p' resolves, query all matching capabilities
      p.then(arraySink => {
        capabilityIds = arraySink.projection;
        self.visibleCapabilityDAO.where(
          self.IN(self.Capability.ID, capabilityIds)
        ).select().then(result => {
          let arr = result.array;
          let grid = self.Grid.create();
          for ( let i = 0 ; i < arr.length ; i++ ) {
            let cap = arr[i];
            grid = grid
              .start(self.GUnit, { columns: 4 })
                .tag(self.CapabilityCardView, { data: cap })
                .on('click', () => {
                  self.crunchController
                    .createWizardSequence(cap).execute();
                })
              .end();
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
      return this.auth.check(this.ctrl.__subContext__, 'businessHasSigningOfficer');
    }
  ]
});

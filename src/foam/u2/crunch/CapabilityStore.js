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
    'foam.dao.ArrayDAO',
    'foam.dao.NullDAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
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
    'crunchService',
    'menuDAO',
    'registerElement',
    'theme'
  ],

  messages: [
    { name: 'TAB_ALL', message: 'All' },
    { name: 'TITLE', message: 'Features' },
    { name: 'SUBTITLE', message: 'Unlock more features on {appName}' }
  ],

  css: `
    ^ {
      margin: auto;
      padding: 12px 24px 24px 24px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
    }

    ^label-title {
      font-weight: 900;
      font-size: 32px;
      margin: 24px 16px;
      margin-bottom: 8px;
    }

    ^label-subtitle {
      margin: 16px;
      margin-top: 0;
      color: #9ba1a6;
      font-size: 18px;
    }

    ^category {
      margin-top: 48px;
      padding: 0px 12px;
    }

    ^feature-column-grid {
      display: inline-flex;
      width: calc(100% - 48px);
      overflow-x: auto;
    }

    ^featureSection {
      flex: 0;
      height: auto;
    }

    ^perFeature {
      display: flex;
    }

    ^left-arrow {
      width: 24px;
      height: 24px;
      float: left;
      display: flex;
      cursor: pointer;
      padding-top: 70px;
      -webkit-transition: padding 2s;
    }

    ^right-arrow {
      width: 24px;
      height: 24px;
      float: right;
      display: flex;
      cursor: pointer;
      padding-top: 70px;
      margin-left: -20px;
      z-index: 10000;
      position: relative;
      -webkit-transition: padding 2s;
    }

    ^container {
      display: inline-block;
      width: 100%;
      height: fit-content;
      overflow-y: visible;
      margin-top: 24px;
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
        return this.NullDAO.create();
      }
    },
    {
      name: 'featuredCapabilities',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find capabilities to feature.
      `,
      expression: function(visibleCapabilityDAO) {
        return visibleCapabilityDAO
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
    },
    {
      name: 'cardsOverflow',
      class: 'Boolean'
    },
    'wizardOpened'
  ],

  methods: [
    function init() {
      this.crunchService.getAllJunctionsForUser().then(juncs => {
        this.daoUpdate();
      });
      this.crunchService.getEntryCapabilities().then(a => {
        this.visibleCapabilityDAO = this.ArrayDAO.create({
          array: a.array
        });
      });
    },
    function initE() {
      this.SUPER();
      this.onDetach(this.crunchService.sub('grantedJunction', this.onChange));
      var self = this;
      window.cstore = self;

      self
        .addClass(self.myClass())
        .start('p').addClass(this.myClass('label-title'))
          .add(this.TITLE)
        .end()
        .start('p').addClass(this.myClass('label-subtitle'))
          .add(this.SUBTITLE.replace('{appName}', this.theme.appName))
        .end()
        .add(this.slot(function(featuredCapabilities){
          return self.renderFeatured();
        }))
        // NOTE: TEMPORARILY REMOVED
        // .add(self.accountAndAccountingCard())
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
      this.featuredCapabilities.select().then(result => {
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
                self.openWizard(arr[i].id, true);
              })
            .end());
        }

        spot.start().start('span')
          .start('img').addClass(self.myClass('left-arrow')).show(this.cardsOverflow$)
            .attr('src', 'images/arrow-back-24px.svg')
            .on('click', function() {
              self.carouselCounter--;
            })
          .end()
        .end();
        var ele;
        function checkCardsOverflow(evt) {
          if ( ! ele.el() ) return;
          self.cardsOverflow = ele.el().scrollWidth > ele.el().clientWidth;
        }
        spot.add(self.slot(
          function(carouselCounter, totalNumCards) {
            ele = self.E().addClass(self.myClass('feature-column-grid'));
            for ( var k = 0 ; k < totalNumCards ; k++ ) {
              let cc = carouselCounter % totalNumCards; // this stops any out of bounds indecies
              let index = ( cc + totalNumCards + k ) % totalNumCards; // this ensures circle indecies
              ele = ele.add(self.featureCardArray[index].call(self));
            }
            return ele;
          }));
        spot.start('span')
          .start('img').addClass(self.myClass('right-arrow')).show(this.cardsOverflow$)
            .attr('src', 'images/arrow-forward-24px.svg')
            .on('click', function() {
              self.carouselCounter++;
            })
          .end()
        .end();

        window.addEventListener('resize', checkCardsOverflow);
        checkCardsOverflow();
        self.onDetach(() => {
          window.removeEventListener('resize', checkCardsOverflow);
        });
      });
      return spot;
    },

    function accountAndAccountingCard() {
      // Capability Store Section Previews
      var self = this;
      return self.E().style({ 'width': '94%', 'margin': 'auto '})
        .select(self.visibleCategoryDAO$proxy, function(category) {
          var sectionElement = this.E('span');
          var returnElement = this.E()
            .start('h3')
              .add({ data : category, clsInfo : category.cls_.NAME.name, default : category.name })
            .end()
            .add(sectionElement).addClass(self.myClass('category'));
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
                      self.openWizard(cap, true);
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
                  self.openWizard(cap, false);
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
    function daoUpdate() {
      Promise.resolve()
        // Get visible categories
        .then(() => this.visibleCategoryDAO.select())
        .then(categorySink => categorySink.array.map(cat => cat.id))
        // Get capabilities within visible categories
        .then(categories => {
          return this.capabilityCategoryCapabilityJunctionDAO
            .where(this.IN(
              this.CapabilityCategoryCapabilityJunction.SOURCE_ID,
              categories)).select();
        })
        .then(cccjSink => Object.keys(
          cccjSink.array.map(cccj => cccj.targetId)
          .reduce((set, capabilityId) => ({ ...set, [capabilityId]: true }), {})))
        // Get visible capabilities within visible categories
        .then(visibleList => this.visibleCapabilityDAO
          .where(this.OR(
            this.IN(this.Capability.ID, visibleList),
            this.IN('featured', this.Capability.KEYWORDS)
          )).select())
        .then(sink => {
          if ( sink.array.length == 1 ) {
            this.openWizard(sink.array[0], false);
          }
        })
    },
    function openWizard(cap, showToast) {
      if ( this.wizardOpened ) return;
      this.wizardOpened = true;
      this.crunchController.createWizardSequence(cap)
        .reconfigure('CheckPendingAgent', { showToast: showToast })
          .execute().then(() => {
            this.wizardOpened = false
          });
    }
  ],

  listeners: [
    {
      name: 'onChange',
      isMerged: true,
      mergeDelay: 2000,
      code: async function() {
        let a = await this.crunchService.getEntryCapabilities();
        this.visibleCapabilityDAO = this.ArrayDAO.create({
          array: a.array
        });
        await this.crunchService.getAllJunctionsForUser();
        this.daoUpdate();
        // Attempting to reset menuDAO incase of menu permission grantings.
        this.menuDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
      }
    }
  ]
});

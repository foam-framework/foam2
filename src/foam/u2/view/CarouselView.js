/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CarouselView',
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
    'ctrl',
    'crunchController',
  ],

  css: `
    ^ {
      margin: auto;
      padding: 12px 24px 24px 24px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
    }

    ^feature-column-grid {
      justify-content: space-between;
      display: inline-flex;
      width: 96%;
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
      margin-right: -1.3vw;
      /* HOVER OFF */
      -webkit-transition: padding 2s;
    }

    ^right-arrow { 
      width: 3%;
      float: right;
      display: flex;
      padding-top: 70px;
      margin-left: -20px;
      z-index: 100111;
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
    }
  `,

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to display in carousel.
      `,
    },
    {
      name: 'coursalCounter',
      class: 'Int',
      documentation: 'left and right scroll counter for daoElementArray index'
    },
    {
      name: 'totalNumCards',
      class: 'Int',
      documentation: 'should be equivalent to daoElementArray.length'
    },
    {
      name: 'numCardsThatFit',
      class: 'Int',
      documentation: 'a window size and document.element size calculation storage'
    },
    {
      class: 'Array',
      name: 'daoElementArray',
      documentation: 'stores the styled element to display in carousel.'
    },
    // {
    //   class: 'Function',
    //   name: 'elementGeneration',
    //   factory: function elementGeneration(ele) {
    //     return this.Element.create().add(ele.id);
    //   }
    // }
  ],

  methods: [
    function initE() {
      this.SUPER();
      // window.onresize = this.calcNumOfCardsToDisplay;
      var self = this;

      self.addClass(this.myClass('container'))
        // Left Arrow
      .start('span')
        .start('img').addClass(this.myClass('left-arrow'))
          .attr('src', '/images/carouselArrow.svg')
          .on('click', function() {
            self.coursalCounter--;
          })
        .end()
      .end()
      .add(self.slot(function(dao, coursalCounter) {
        // main section arrow
          dao.select().then(result => {
            self.totalNumCards = result.array.length;
            self.daoElementArray = [];
            var ele = self.E().addClass(self.myClass('feature-column-grid'));

            // for ( let i = 0; i < self.totalNumCards; i++ ) {
            //   self.daoElementArray.push(() => self.elementGeneration(result.array[i]));
            // }
            for ( var k = 0; k < self.totalNumCards; k++ ) {
              let cc = coursalCounter % self.totalNumCards; // this stops any out of bounds indecies
              let index = ( cc + self.totalNumCards + k ) % self.totalNumCards; // this ensures circle indecies
              // var bob = self.elementGeneration.call(self, result.array[k]);
              // ele = ele.add(bob);
              ele = ele.add(self.elementGeneration.call(self, result.array[index]));
              // console.log(`daoElementArray[index]:${self.daoElementArray[index]}`);
            }
            return ele;
          });
          // self.removeAllChildren();
          // var ele = self.E().addClass(self.myClass('feature-column-grid'));
          // var spaces = numCardsThatFit <= totalNumCards && numCardsThatFit > 0 ? numCardsThatFit : totalNumCards;
          // spaces = daoElementArray.length < spaces ? daoElementArray.length : spaces;
          
          // console.log(`spaces:${spaces}`);
          
          // for ( var k = 0; k < spaces; k++ ) {
          //   let cc = coursalCounter % totalNumCards; // this stops any out of bounds indecies
          //   let index = ( cc + totalNumCards + k ) % totalNumCards; // this ensures circle indecies
          //   ele = ele.start().add(daoElementArray[index].call(self)).end();
          //   console.log(`daoElementArray[index]:${daoElementArray[index]}`);
          // }
          // return ele;
        }
      ))
      // Right Arrow
      .start('span')
        .start('img').addClass(this.myClass('right-arrow'))
          .attr('src', '/images/carouselArrow.svg')
          .on('click', function() {
            self.coursalCounter++;
          })
        .end()
      .end();
    },
    // function setUpElementDisplay() {
    //   this.dao.select().then(result => {
    //     this.totalNumCards = result.array.length;
    //     this.daoElementArray = [];
    //     for ( let i = 0; i < this.totalNumCards; i++ ) {
    //       this.daoElementArray.push(() => this.elementGeneration(result.array[i]));
    //     }
    //   });
    // },
    function elementGeneration(daoEle) {
      return this.Element.create().start()
      .addClass(this.myClass('perFeature'))
      .start(foam.u2.crunch.CapabilityFeatureView, { data: daoEle })
        .addClass(this.myClass('featureSection'))
      .end()
      .on('click', () => {
        this.ctrl.crunchController.launchWizard(daoEle.id);
      })
    .end();
    }
  ],

  listeners: [
    function calcNumOfCardsToDisplay(e) {
      var coursalEle = document.getElementsByClassName('foam-u2-view-CarouselView-feature-column-grid');
      if ( ! coursalEle ) this.numCardsThatFit = 4;
      for ( var i = 0; i < coursalEle.length; i++ ) {
        var tt = (coursalEle[i].clientWidth /245)
          .toPrecision(1);
        this.numCardsThatFit = parseInt(tt);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityStore',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.crunch.CapabilityFeatureView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
  ],

  imports: [
    'capabilityDAO',
    'registerElement'
  ],

  css: `
    ^ .subTitle {
      color: #8e9090;
      font-size: 16px;
    }
    ^ .divider {
      background-color: #e2e2e3;
      height: 2px;
      margin: 24px 0 0 0;
      width: 97%;
    }
    /* ^ {
      max-width: 1024px;
      margin: auto;
      padding: 12px 24px 24px 24px;
    } */
    ^four-column-grid {
      margin-top: 32px;
      justify-content: space-between;
    }

    .fix-alignment-to-page-title {
      margin-left: -9px;
      margin-right: -9px;
    }

    .fix-alignment-to-tab-bar {
      margin-left: -9px;
      margin-right: -15px;
    }

    h3 {
      margin-top: 30px;
      width: 272px;
      height: 20px;
      font-family: IBMPlexSans;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: normal;
      color: #5e6061;
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
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      window.cstore = self;

      self
        .addClass(self.myClass())
          .addClass(self.myClass('fix-alignment-to-tab-bar'))
          .addClass(self.myClass('four-column-grid'))
          // .add('things are not working and this is bad')
          .add(self.slot(function (featuredCapabilities) {
            var spot = this.E();
            featuredCapabilities.select().then((result) => {
              let arr = result.array;
              let grid = self.Grid.create();
              console.log(['grid',grid]);
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
          // .select(self.featuredCapabilities, function (cap) {
          //   console.log([this, cap]);
          //   this.__context__.registerElement(self.GUnit);
          //   return this.E('GUNIT', { nodeName: 'div', columns: 3 })
          //     .add('test words')
          //     // .tag(self.CapabilityFeatureView, { data: cap })
          // })
        .end()
        ;
    }
  ]
});
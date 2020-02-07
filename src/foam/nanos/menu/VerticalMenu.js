foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'VerticalMenu',
  extends: 'foam.u2.View',
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'currentMenu',
    'menuListener',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
  ],
  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.VerticalMenu',
    'foam.dao.ArraySink'
  ],
  css: `
  ^ .side-nav-view {
    font-size: medium!important;
    font-weight: normal;
    display: inline-block;
    position: absolute;
    height: 107vh;
    width: 240px;
    overflow-y: scroll;
    overflow-x: hidden;
    z-index: 100;
    font-size: 26px;
    color: /*%GREY2%*/ #9ba1a6;
    border-right: 1px solid /*%GREY4%*/ #e7eaec;
    background: /*%GREY5%*/ #f5f7fas;
  }
  ^ .selected-sub {
    color: /*%BLACK%*/ #1e1f21;
    font-weight: 800;
  }
  ^ .submenu {
    max-height: 204px;
    overflow-y: scroll;
    overflow-x: hidden;
    font-size: 14px;
    border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
  }
  ^ .icon {
    width: 16px;
    height: 16px;
    padding-right: 10px;
    vertical-align: top;
  }
  ^ .menu-label {
    width: calc(100% - 24px);
    padding-top: 15px;
    padding-left: 20px;
    height: 30px;
    font-size: 14px;
    vertical-align: top;
    display: inline-block;
    border-left: 4px solid /*%GREY5%*/ #f5f7fa;
  }
  ^ .menu-label span {
    display: inline-block;
  }
  ^ .selected-root {
    border-left: 4px solid /*%PRIMARY3%*/ #406dea !important;
    background: /*%PRIMARY5%*/ #e5f1fc;
    color: /*%BLACK%*/ black;
  }
  ^ .menu-label:hover {
    color: /*%BLACK%*/ black;
    cursor: pointer;
  }
  ^ .menu-label:not(.selected-root):hover {
    border-left: 4px solid transparent;
    background: /*%GREY4%*/ #e7eaec;
  }
  ^submenu-item {
    display: flex;
    padding: 12px 12px 12px 51px;
  }
  ^submenu-item:hover {
    cursor: pointer;
  }
  ^ .foam-u2-view-RichChoiceView {
    width: calc(240px - 16px - 16px);
    margin: 16px;
  }
  ^submenu-item ^selected-dot {
    border-radius: 999px;
    min-width: 8px;
    height: 8px;
    background-color: transparent;
    display: inline-block;
    margin-right: 8px;
    margin-top: 4px;
  }
  ^ .selected-sub ^selected-dot {
    background-color: /*%PRIMARY3%*/ #406dea;
  }
  .foam-u2-search-TextSearchView {
    text-align: center;
    margin: 4px 0;
  }
  `,
  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'subMenu',
      documentation: 'Used to store selected submenu element after window reload and scroll into parent view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER);
      }
    },
    {
      name: 'menuSearch',
      value: ''
    },
    {
      name: 'filteredDAO',
      // expression: function(dao_, menuSearch) {
      //   self.dao_.where(this.CONTAINS_IC(this.Menu.LABEL, self.menuSearch)).select(this.Map.create({
      //     arg1: self.Menu.PARENT, 
      //     delegate: this.ArraySink.create()
      //   })).then(function (val) {
      //     var parentIds = val.array;
      //     self.filteredDAO = self.dao_.where(this.OR(this.CONTAINS_IC(this.Menu.LABEL, self.menuSearch), this.IN(this.Menu.ID, parentIds)));
      //   })
      //   //the only way: to do selection map to new menu object then this new menu object to TreeViewRow with the same relationship
      //   //+ need to add onclick function to TreeViewRow
      //   return dao_.where(this.CONTAINS_IC(this.Menu.LABEL, menuSearch));
      // }
    }
  ],
  methods: [
    function initE() {
      self = this;
      //self.menuSearch = 'a';
      self.filteredDAO = self.dao_;

      this.menuSearch$.sub(function() {
        self.dao_.where(self.CONTAINS_IC(self.Menu.LABEL, self.menuSearch)).select(self.Map.create({
          arg1: self.Menu.PARENT, 
          delegate: self.ArraySink.create()
        })).then(function (val) {
          var parentIds = val.delegate.array;
          self.filteredDAO = self.dao_.where(self.OR(self.CONTAINS_IC(self.Menu.LABEL, self.menuSearch), self.IN(self.Menu.ID, parentIds)));
        })
      });

      var firstSearchMatch = foam.core.SimpleSlot.create({value: ''});
      firstSearchMatch.sub(function() {
        if(firstSearchMatch.get() && firstSearchMatch.get().length != 0) {
          self.menuListener(firstSearchMatch.get());
          self.pushMenu(firstSearchMatch.get());
        }
      });
      this
      .addClass(this.myClass())
      .start()
      .addClass('side-nav-view')
      .start()
      .startContext({ data: this })
      .start()
        .add(self.MENU_SEARCH.clone().copyFrom({ view: {
          class: 'foam.u2.view.TextField',
          onKey: true
        } }))
        .addClass('foam-u2-search-TextSearchView')
      .end()
      .endContext()
      .add(self.slot(function(filteredDAO) {
        return self.E()
        .tag({ 
          class: 'foam.u2.view.TreeView',
          data: self.dao_,
          relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
          startExpanded: true,
          query: self.menuSearch$.get(),
          formatter: function(data) { this.add(data.label); }
        });
      }))
      
    .end();

    this.subMenu$.dot('state').sub(this.scrollToCurrentSub);

    }
  ],

  listeners: [
    async function menuSearchSelect() {
      var menu = await this.menuDAO.find(this.menuSearch);
      this.pushMenu(this.menuSearch);
      this.menuListener(menu);
      // Scroll to submenu selected from search.
      document.getElementsByName(this.menuSearch)[0].scrollIntoView({ block: 'end' });
    },
    function scrollToCurrentSub() {
      // When submenu element is loaded, scroll element into parent view TODO: Fix to align to middle of parent div.
      if ( this.subMenu.state === this.subMenu.LOADED ) {
        this.subMenu.el().scrollIntoView({ block: 'end' });
      }
    }
  ]
});
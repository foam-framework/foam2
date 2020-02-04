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
    'foam.nanos.menu.VerticalMenu'
  ],
  css: `
  ^ .side-nav-view {
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
  }`,
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
    }
  ],
  methods: [
    function initE() {
      self = this;
      this
      .addClass(this.myClass())
      .start()
      .addClass('side-nav-view')
      .start()
      .add(self.MENU_SEARCH.clone().copyFrom({ view: {
        class: 'foam.u2.view.TextField',
        onKey: true
      } }))
      .add(this.slot(function(menuSearch) {
        return self.E().select(this.dao_.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
          var slot = foam.core.SimpleSlot.create({ value: false });
          var viewChildren = foam.core.SimpleSlot.create({ value: false});
          var hasChildren = foam.core.SimpleSlot.create({ value: false });
          var visibilitySlot = foam.core.ArraySlot.create({ slots: [slot, hasChildren] }).map((results) => results.every(x => x));
          var searchVisibily = menu.label.includes(menuSearch);
          return self.E()
            .start()
            .show(searchVisibily)
            .attrs({ name: menu.label })
            .addClass('sidenav-item-wrapper')
              .start().addClass('menu-label')
              .on('click', function() {
                viewChildren.set(!viewChildren.get());
                if ( self.currentMenu != null && self.currentMenu.parent == menu.id ) {
                  return;
                }
  
                if ( ! hasChildren.get() ) {
                  self.menuListener(menu.id);
                  self.pushMenu(menu.id);
                }
                //self.menuSearch = menu.id;
              })
              .enableClass('selected-root', slot)
              .enableClass('selected-root', self.currentMenu$.map((currentMenu) => {
                var selectedRoot = window.location.hash.replace('#', '') == menu.id ||
                  currentMenu != null && (
                    currentMenu.id == menu.id ||
                    currentMenu.parent == menu.id
                  );
                slot.set(selectedRoot);
                return selectedRoot;
              }))
              .start('img').addClass('icon')
                .attr('src', menu.icon)
              .end()
              .start('span')
                .add(menu.label)
              .end()
              .start()
                .style({
                    visibility: hasChildren.map(function(c) { return c ? 'visible' : 'hidden'; }),
                    'margin-bottom': '6px',
                    'border': '1px solid /*%PRIMARY3%*/ #406dea',
                    'display': 'inline-block',
                    'padding': '3px',
                    'float': 'right',
                    'position': 'relative',
                    'right': '40px',
                    'top': '7px',
                    'transform': viewChildren.map(function(c) { return c ? 'rotate(225deg)' : 'rotate(45deg)' } ),
                    'border-width': '1px 0px 0px 1px'                    
                })
              .end()
            .end()

            .start()
              .addClass('submenu')
              .show(viewChildren)
              .select(self.dao_.where(self.EQ(self.Menu.PARENT, menu.id)), function(subMenu) {
                var subMenuSearchVisibility = subMenu.label.includes(menuSearch);                      
                searchVisibily = searchVisibily || subMenuSearchVisibility;
                hasChildren.set(true);
                var e = this.E()
                .show(subMenuSearchVisibility)
                  .addClass(self.myClass('submenu-item'))
                  .start().addClass(self.myClass('selected-dot')).end()
                  .attrs({ name: subMenu.id })
                  .on('click', function() {
                    if ( self.currentMenu != null && self.currentMenu.id != subMenu.id ) {
                      self.pushMenu(subMenu.id);
                      //self.menuSearch = menu.id;
                    }
                  })
                  .start('span').add(subMenu.label).end()
                  .enableClass('selected-sub', self.currentMenu$.map((currentMenu) => {
                    return currentMenu != null && currentMenu.id === subMenu.id;
                  }));

                if ( self.currentMenu == subMenu ) self.subMenu = e;

                return e;
              })
            .end()
          .end();
          //return self.E().start().add(menu.label).end();
        });//.start().add(menuSearch).end();
      }))
      // .select(this.dao_.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
      //   var slot = foam.core.SimpleSlot.create({ value: false });
      //   var hasChildren = foam.core.SimpleSlot.create({ value: false });
      //   var visibilitySlot = foam.core.ArraySlot.create({ slots: [slot, hasChildren] }).map((results) => results.every(x => x));
      //   return this.E()
      //     .start()
      //     //.show(searchVisibilySlot)
      //       .attrs({ name: menu.label })
      //       .on('click', function() {
      //         if ( self.currentMenu != null && self.currentMenu.parent == menu.id ) {
      //           return;
      //         }
      //         if ( ! hasChildren.get() ) {
      //           self.menuListener(menu.id);
      //           self.pushMenu(menu.id);
      //         }
      //         self.menuSearch = menu.id;
      //       })
      //       .addClass('sidenav-item-wrapper')
      //         .start().addClass('menu-label')
      //         .enableClass('selected-root', slot)
      //         .enableClass('selected-root', self.currentMenu$.map((currentMenu) => {
      //           var selectedRoot = window.location.hash.replace('#', '') == menu.id ||
      //             currentMenu != null && (
      //               currentMenu.id == menu.id ||
      //               currentMenu.parent == menu.id
      //             );
      //           slot.set(selectedRoot);
      //           return selectedRoot;
      //         }))
      //         .start('img').addClass('icon')
      //           .attr('src', menu.icon)
      //         .end()
      //         .start('span')
      //           .add(menu.label)
      //         .end()
      //         .start().enableClass('up-arrow', visibilitySlot).end()
      //       .end()

      //       .start()
      //         .addClass('submenu')
      //         .show(visibilitySlot)
      //         .select(self.dao_.where(self.EQ(self.Menu.PARENT, menu.id)), function(subMenu) {

      //           self.searchVisibilySlot = self.searchVisibilySlot || subMenu.label.includes(self.menuSearch);
                

      //           hasChildren.set(true);
      //           var e = this.E()
      //           .show()
      //             .addClass(self.myClass('submenu-item'))
      //             .start().addClass(self.myClass('selected-dot')).end()
      //             .attrs({ name: subMenu.id })
      //             .on('click', function() {
      //               if ( self.currentMenu != null && self.currentMenu.id != subMenu.id ) {
      //                 self.pushMenu(subMenu.id);
      //                 self.menuSearch = menu.id;
      //               }
      //             })
      //             .start('span').add(subMenu.label).end()
      //             .enableClass('selected-sub', self.currentMenu$.map((currentMenu) => {
      //               return currentMenu != null && currentMenu.id === subMenu.id;
      //             }));

      //           if ( self.currentMenu == subMenu ) self.subMenu = e;

      //           return e;
      //         })
      //       .end()
      //     .end();
      // })
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
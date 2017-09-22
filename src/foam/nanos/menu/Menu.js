/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.menu',
   name: 'AbstractMenu',

   methods: [
     function launch(X, menu) { X.stack.push(this.createView(X, menu)); }
   ]
 });


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ViewMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    }
  ],

  methods: [
    function createView(X) { return this.view.clone ? this.view.clone() : this.view; }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    { class: 'foam.u2.ViewSpec', name: 'summaryView',
    // TODO: remove next line when permanently fixed in ViewSpec
    fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function createView(X) {
      var view = { class: 'foam.comics.BrowserView', data: X[this.daoKey] };

      if ( this.summaryView ) view.summaryView = this.summaryView;
      return view;
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ListMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.u2.Element' ],

  methods: [
    function createView(X, menu) {
      var e = this.Element.create(undefined, X);

      X.stack.push(e);

      menu.children.select({
        put: function(menu) {
          if ( menu.handler ) {
            e.tag(menu.handler.createView(X, menu));
          } else {
            e.add('Coming Soon!');
          }
        },
        eof: function() {}
      });

      return e;
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'TabsMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.u2.Tabs' ],

  methods: [
    function createView(X, menu) {
      var tabs = this.Tabs.create(undefined, X);

      X.stack.push(tabs);

      menu.children.select({
        put: function(menu) {
          tabs.start({class: 'foam.u2.Tab', label: menu.label}).call(function() {
            if ( menu.handler ) {
              this.tag((menu.handler && menu.handler.createView(X, menu)));
            } else {
              this.add('Coming Soon!');
            }
          }).end();
        },
        eof: function() {}
      });

      return tabs;
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenuView',
  extends: 'foam.nanos.menu.PopupMenu',

  properties: [ 'X', 'menu' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^inner {
          -webkit-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
          -moz-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
          box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;

          position: absolute;
          top: 65px;
          font-weight: 300;
        }
        ^inner div {
          box-sizing: border-box;
          padding: 8px 24px;
          padding-right: 48px;
          cursor: pointer;
          background: white;
          color: black;
          border-left: solid 1px #edf0f5;
          border-right: solid 1px #edf0f5;
        }
        ^inner div:last-child {
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
        }
        ^inner div:hover {
          color: white;
          background: #1cc2b7;
          border-left: solid 1px #1cc2b7;
          border-right: solid 1px #1cc2b7;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());
      var self = this;
      var menu = this.menu;
      var X = this.X;

      menu.children.select({
        put: function(menu) {
          if ( ! menu.handler ) return;
          self.start('div')
            .on('click', function() { self.close(); menu.launch(X); })
            .add(menu.label)
          .end();
        },
        eof: function() {}
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  requires: [ 'foam.nanos.menu.SubMenuView' ],

  methods: [
    function createView(X, menu, parent) {
      return this.SubMenuView.create({menu: menu, parent: parent}, X);
    },

    function launch(X, menu, parent) {
      var view = this.createView(X, menu, parent);
      view.open();
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'Menu',

  tableColumns: [ 'id', 'parent', 'label', 'order' ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'FObjectProperty',
      name: 'handler',
      view: 'foam.u2.view.FObjectView'
    },
    {
      class: 'Int',
      name: 'order',
      value: 1000
    }
  ],

  actions: [
    {
      name: 'launch',
      code: function(X) {
        console.log('MENU: ', this.id, this.label);
        this.handler && this.handler.launch(X, this);
      }
    }
  ]
});


var MenuRelationship = foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.menu.Menu',
  targetModel: 'foam.nanos.menu.Menu',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    class: 'String',
    value: ''
  }
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'MenuBar',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.nanos.menu.Menu' ],

  imports: [ 'menuDAO' ],

  documentation: 'Navigational menu bar',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: inline-block;
          vertical-align: top;
        }
        ^ ul{
          margin-top: 20px;
          font-size: 13px;
          list-style-type: none;
        }
        ^ li{
          margin-left: 25px;
          display: inline-block;
          cursor: pointer;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
          .addClass(this.myClass())
          .start()
            .start('ul')
              .select(this.menuDAO.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
                this.start('li')
                  .call(function() {
                    var e = this;
                    this.start()
                      .add(menu.label)
                      .on('click', function() { menu.handler && menu.handler.launch(self.__context__, menu, e) })
                    .end();
                  })
                .end()
              })
            .end()
          .end()
        .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'PopupMenu',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^container {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: space-around;
          position: relative;
          width: 100%;
        }
        ^background {
          bottom: 0;
          left: 0;
          opacity: 0.4;
          position: absolute;
          right: 0;
          top: 0;
        }
        ^inner {
          z-index: 3;
        }
      */}
    })
  ],

  properties: [
    'parent'
  ],

  methods: [
    function init() {
      this.SUPER();
      var content;

      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.close)
        .end()
        .start()
          .call(function() { content = this; })
          .addClass(this.myClass('inner'))
        .end();

      this.content = content;
    },

    function open() {
      if ( this.parent ) {
        this.parent.add(this);
      } else {
        this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
        this.load();
      }
    }
  ],

  listeners: [
    function close() {
      this.remove();
    }
  ]
});

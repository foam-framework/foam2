/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'MenuToolBar',
  extends: 'foam.u2.View',

  documentation: 'A toolbar made out of menus according to a given classification (menu id prefix).',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'menuDAO',
    'pushMenu'
  ],

  requires: [
    'foam.nanos.menu.Menu'
  ],

  css: `
    ^ {
      width: auto;
    }
    ^title {
      margin: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^options {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 0 26px 32px 26px;
    }
    ^option {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 96px;
      height: 118px;
      padding-bottom: 5px;
      padding-top: 15px;
      border-radius: 3px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #edf0f5;
    }
    ^option:hover {
      border: solid 1px #604aff;
      cursor: pointer;
    }
    ^option-title {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }
    ^option-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 62px;
      width: 62px;
      margin-bottom: 8px;
    }
    ^option-icon {
      width: 50px;
      height: 50px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'classification'
    },
    {
      class: 'String',
      name: 'parent'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.menuDAO
          .where(
            this.AND(
              this.STARTS_WITH(this.Menu.ID, this.classification),
              this.EQ(this.Menu.PARENT, this.parent),
              this.NEQ(this.Menu.ID, `${this.classification}.toolbar`)
            )
          );
      }
    },
    {
      class: 'Int',
      name: 'availableMenuCount',
      expression: async function(dao) {
        let count = await dao.select(this.Count.create());
        return count.value;
      }
    }
  ],

  methods: [
    async function initE() {
      var self = this;
      if ( await this.availableMenuCount === 1 ) {
        this.dao.select().then( (res) => {
          self.pushMenu(res.array[0].id);
        });
        return;
      }
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('title'))
          .attr('name', this.myClass('title'))
          .add(this.title)
        .end()
        .start()
          .addClass(this.myClass('options'))
          .select(this.dao$proxy, function(menu) {
            return this.E().style({
              padding: '0 8px 0'
            }).start()
              .addClass(self.myClass('option'))
              .on('click', function() {
                self.pushMenu(menu.id);
              })
              .start()
                .addClass(self.myClass('option-icon-container'))
                .start('img')
                  .addClass(self.myClass('option-icon'))
                  .attrs({ 'src': menu.icon, 'name': menu.id + 'Icon' })
                .end()
              .end()
              .start()
                .addClass(self.myClass('option-title'))
                .attr('name', menu.id + 'Label')
                .add(menu.label)
              .end()
            .end();
          })
        .end(); 
    }
  ]
});

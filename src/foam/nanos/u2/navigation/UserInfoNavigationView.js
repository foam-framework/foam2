/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'UserInfoNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Displays user and agent label if present. Clicking view opens settings submenu.',

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.SubMenuView'
  ],

  imports: [
    'agent',
    'user',
    'theme'
  ],

  css: `
    ^ {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    ^carrot {
      margin-left: 15px;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
    }
    ^userName {
      color: /*%GREY4%*/;
      font-weight: 600;
      font-size: 12px;
    }
    ^agentName{
      color: /*%GREY3%*/;
      font-weight: 400;
      font-size: 11px;
    }
    ^ .name-container {
      max-width: 75px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ^container {
      cursor: pointer;
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .on('click', () => {
            this.tag(this.SubMenuView.create({
              menu: this.Menu.create({ id: this.theme.settingsRootMenu })
            }));
          })
          .start()
             .add(this.slot((user) => {
              return this.E().addClass('name-container')
                  .start('span').addClass(this.myClass('userName'))
                    .add(user.toSummary())
                  .end();
            }))
            .add(this.slot((agent) => {
              if ( ! agent ) return;
              return this.E().addClass('name-container')
                  .start('span').addClass(this.myClass('agentName'))
                    .add( agent.toSummary() )
                  .end();
            }))
          .end()
          .start()
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    }
  ]
});

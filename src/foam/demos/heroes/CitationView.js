/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.heroes',
  name: 'CitationView',
  extends: 'foam.u2.Element',

  imports: [
    'dao',
    'editHero'
  ],

  css: `
    ^ {
      padding-right: 8px;
      margin: 8px;
      display: flex;
      background: #EEE;
      width: 220px;
      border-radius: 5px;
//      height: 44px;
    }
    ^:hover {
      background: #DDD;
    }
    ^id {
      padding: 12px 8px;
      border-radius: 4px 0 0 4px;
      color: white;
      background: #607D8B;
    }
    ^name {
      margin: 12px;
      width: 100%;
    }
    ^ button {
      box-shadow: none;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      margin: 4px;
      margin-right: -4px;
      background: gray;
      color: white;
    }
    ^ i {
      margin-top: 5px;
    }
  `,

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        on('click', this.onClick).
        start('div').addClass(this.myClass('id')).add(this.data.id).end().
        start('div').addClass(this.myClass('name')).add(this.data.name).end().
        start(this.REMOVE_HERO, { data: this }).end();
    }
  ],

  actions: [
    {
      name: 'removeHero',
      label: 'X',
      ariaLabel: 'delete',
      toolTip: 'delete',
      xxxiconFontName: 'delete_forever',
      code: function() { this.dao.remove(this.data); }
    }
  ],

  listeners: [
    function onClick() { this.editHero(this.data); }
  ]
});

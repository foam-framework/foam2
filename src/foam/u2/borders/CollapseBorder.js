/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CollapseBorder',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      position: relative;
      padding: 10px;
      border-top: 1px solid #999;
      margin-top: 16px;
    }
    ^.expanded {
      border: 1px solid #999;
      padding-left: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      padding-top: 20px;
    }
    ^control {
      display: inline;
      float: right;
      height: 30px;
      position: relative;
      top: -10px;
      width: 30px;
    }
    ^toolbar {
      display: inline-block;
      position: absolute;
      padding: 3px;
      width: calc(100% - 16px);
      left: 8px;
      top: -8px;
      color: #666;
    }
    ^title {
      background: white;
      padding: 3px;
      position: relative;
      top: -3px;
    }
    ^control > .foam-u2-ActionView-toggle {
      transform: rotate(-90deg);
      transition: transform 0.3s;
      border: none;
      outline: none;
      padding: 3px;
      width: 30px;
      height: 30px;
    }
    ^.expanded .foam-u2-ActionView-toggle {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
  `,

  properties: [
    'title',
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        enableClass('expanded', this.expanded$).
        start('div').
          addClass(this.myClass('toolbar')).
          start('span').
            addClass(this.myClass('title')).
            add(this.title$).
          end().
          start('div').
            addClass(this.myClass('control')).
            tag(this.TOGGLE, {label: '\u25BD'}).
          end().
        end().
        start('div', null, this.content$).
          show(this.expanded$).
          addClass(this.myClass('content')).
        end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
});

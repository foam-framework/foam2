/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableView',
  extends: 'foam.u2.view.UnstyledTableView',

  css: `
    ^ {
      border-spacing: 14px 8px;
    }

    ^ th {
      text-align: left;
      white-space: nowrap;
      font-family: 'Roboto';
      padding-left: 15px;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.4px;
      color: #2b2b2b;
    }

    ^ td {
      white-space: nowrap;
      font-family: Roboto;
      line-height: 1.33;
      letter-spacing: 0.2px;
      padding-left: 15px;
      font-size: 14px;
      color: #2b2b2b;
    }

    ^row:hover {
      background: #eee;
      cursor: pointer;
    }

    ^ tbody {
      box-shadow: 0 2px 2px 0 #dae1e9;
    }

    ^ tbody > tr {
      height: 48px;
      background: white;
    }

    ^ tbody > tr > td {
      border-top: solid 1px #e2e2e3;
      border-bottom: solid 1px #e2e2e3;
    }

    ^ tbody > tr > td:first-child {
      border-top-left-radius: 5px;
      border-left: solid 1px #e2e2e3;
    }
    
    ^ tbody > tr > td:last-child {
      border-top-right-radius: 5px;
      border-right: solid 1px #e2e2e3;
    }

    ^selected {
      background: #eee;
    }

    ^vertDots {
      font-size: 20px;
      font-weight: bold;
      padding-right: 12px;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^context-menu-item {
      padding: 10px;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^context-menu-item:hover:not(.disabled) {
      cursor: pointer;
      background-color: %ACCENTCOLOR%;
    }
  `,
});

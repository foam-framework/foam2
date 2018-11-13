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
    }

    ^ tr {
      border-bottom: solid 1px #e2e2e3;
    }

    ^ td {
      white-space: nowrap;
    }

    ^row:hover {
      background: #eee;
      cursor: pointer;
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

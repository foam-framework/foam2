/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'Style',
  extends: 'foam.u2.View',

  css: `
    ^ {
      padding: 8px;
      width: 216px;
      height: 211px;
      border: 1px solid rgba(255,255,255,0);

      /* width is calculated width from ^cardpart plus 4 pixels */
      width: calc(254px - (2*24px)/3);

      /* Card highlight transition */
      transition: background 200ms ease-in, border 200ms ease-in;
      -webkit-transition: background 200ms ease-in, border 200ms ease-in;
      -moz-transition: background 200ms ease-in, border 200ms ease-in;
    }

    ^cardpart {
      display: inline-block;
      /* width: 272px;
      /* height: 153px;
      /**/
      width: calc(250px - (2*24px)/3);
      height: 132px;
      margin-bottom: 15px;

      /* Calculated 86% for this but 103% renders correctly */
      background-size: 103%;

      background-repeat: no-repeat;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
      background-position: 50% 50%;
    }

    ^card-title {
      min-height: 20px;
      font-family: /*%FONT1%*/;
      font-size: 16px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.25;
      letter-spacing: normal;
      color: #1e1f21;
    }

    ^card-subtitle {
      height: 14px;
      font-family: /*%FONT1%*/;
      font-size: 11px;
      font-weight: normal;
      font-style: italic;
      font-stretch: normal;
      line-height: 1.27;
      letter-spacing: normal;
      color: #9ba1a6;
    }

    ^card-description {
      margin-top: 9px;
      height: 20px;
      font-family: /*%FONT1%*/ Helvetica;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: normal;
      color: #5e6061;

      cursor: pointer;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      /* normalize for transitions */
      border: solid 1px rgba(255,255,255,0);

      /* Card highlight transition */
      transition: background 200ms ease-in, border 200ms ease-in;
      -webkit-transition: background 200ms ease-in, border 200ms ease-in;
      -moz-transition: background 200ms ease-in, border 200ms ease-in;
    }

    ^.state-hover {
      cursor: pointer;
    }

    ^mode-card.state-hover {
      background-color: rgba(255,255,255,0.5);
      border: solid 1px #e7eaec;
    }

    ^.state-hover ^card-description {
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: rgba(255,255,255,0.7);
      text-align: center;

      white-space: normal;
      text-overflow: initial;
    }

    ^mode-card.state-hover ^card-description {
      position: relative;
      left: -15px;
      width: calc(250px - (2*24px)/3 + 30px);
    }
    ^mode-circle.state-hover ^card-description {
      width: auto;
      height: auto;
    }

    ^icon-circle {
      display: inline-block;
      margin-right: 15px;
      width: 80px;
      height: 80px;
      border-radius: 40px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      background-color: #ffffff;
    }

    ^mode-card {
    }

    ^mode-circle {
      display: inline-block;
      height: 80px;
      width: calc(100% - 16px);
    }
    ^mode-circle::not(:first-of-type) {
      margin-left: 14px;
    }

    ^badge {
      float: right;
      width: auto;
      height: 24px;
      border-radius: 12px;

      padding: 0 8px;
      background-color: #b5b5b5;

      font-family: /*%FONT1%*/;
      font-size: 11px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 24px;
      letter-spacing: normal;
      text-align: right;
      color: #ffffff;
    }

    ^badge-neutral {
      background-color: #b5b5b5;
    }
    ^badge-good {
      background-color: #32bf5e;
    }
    ^badge-info {
      background-color: #604aff;
    }
    ^badge-bad {
      background-color: #bf3232;
    }

    ^category {
      display: inline-block;
      padding: 0;
    }
    ^category:not(:last-child) {
      margin-right: 8px;
    }
  `,

  methods: [
    function addBinds(subj) {
      subj.on('mouseover', function() {
        subj.addClass('state-hover');
      });
      subj.on('mouseout', function() {
        subj.removeClass('state-hover');
      });
      return subj;
    }
  ]
});
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
      padding: 8px 12px 8px 12px;
      width: 216px;
      height: auto;
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
      margin: 0;
      min-height: 20px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.25;
      letter-spacing: normal;
      color: #1e1f21;
    }

    ^card-subtitle {
      margin: 0;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: normal;
      font-stretch: normal;
      line-height: 1.27;
      letter-spacing: normal;
      color: #9ba1a6;
    }

    ^card-description {
      margin-top: 9px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: normal;
      color: #5e6061;
      cursor: pointer;

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
      width: 80px;
      height: 80px;
      border-radius: 40px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      background-color: #ffffff;
    }

    ^mode-card {
    }

    ^mode-circle {
      display: flex;
      align-items: center;

      padding: 24px;

      width: 100%;
      height: 100%;

      background-color: white;

      border: 2px solid #f3f3f3;
      border-radius: 5px;
      box-sizing: border-box;

      transition: all 0.3s ease-out;
    }
    ^mode-circle::not(:first-of-type) {
      margin-left: 14px;
    }
    ^mode-circle:hover {
      -webkit-box-shadow: 0 10px 6px -6px #e0e0e0;
      -moz-box-shadow: 0 10px 6px -6px #e0e0e0;
      box-shadow: 0 10px 6px -6px #e0e0e0;
      border-color: white;
    }

    ^badge {
      height: 24px;
      border-radius: 12px;
      width: 79px;

      padding: 0 8px;
      background-color: #b5b5b5;

      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 24px;
      letter-spacing: normal;
      text-align: center;
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

    ^renewable-description {
      height: 24px;
      padding: 2px 8px;
      background-color: /*%WHITE%*/ #ffffff;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 24px;
      letter-spacing: normal;
      text-align: center;
      opacity: 80%;
      width: -moz-available;
      width: -webkit-fill-available;
      width: fill-available;
    }

    ^category {
      display: inline-block;
      padding: 0;
    }
    ^category:not(:last-child) {
      margin-right: 8px;
    }

    ^tooltip {
      position: absolute;
      bottom: 12px; 
    }
    ^tooltip ^tooltiptext {
      visibility: hidden;
      width: max-content;
      max-width: 300%;
      background-color: #555;
      color: #f3f3f3;
      text-align: left;
      border-radius: 5px;

      padding: 16px;
      font-size: 12px;

      position: absolute;
      z-index: 101;
      bottom: -115%;
      right: calc(100% + 16px);

      opacity: 0;
      transition: opacity 0.3s;

      -webkit-box-shadow: 0 10px 6px -6px #e0e0e0;
      -moz-box-shadow: 0 10px 6px -6px #e0e0e0;
      box-shadow: 0 10px 6px -6px #e0e0e0;
    }
    ^tooltip ^tooltiptext::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 100%;
      margin-top: -8px;
      border-width: 8px;
      border-style: solid;
      border-color: transparent transparent transparent #555;
    }

    ^tooltiptext^tooltip-bottom {
      max-width: 200%;
      top: calc(100% + 16px);
      bottom: auto;
      right: 0;
    }
    ^tooltip ^tooltiptext^tooltip-bottom::after {
      top: 0;
      right: 17%;
      left: auto;
      margin-top: -16px;
      border-color: transparent transparent #555 transparent;
    }

    ^tooltip:hover ^tooltiptext {
      visibility: visible;
      opacity: 1;
    }

    ^tooltiptext^tooltipDisabled {
      visibility: hidden !important;
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

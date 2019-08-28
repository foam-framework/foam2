/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Demonstrates how to do two way data-binding in FOAM. 
// See the same demo implemented with other JS libraries.
// http://n12v.com/2-way-data-binding/?hn

foam.CLASS({
  package: 'com.foamdev.demos.twoWayDataBindingMVC',
  name: 'TemperatureView',
  extends: 'foam.u2.View',// it will imports 'data'

  css: `
    .temperature-converter {
      margin-top: 50px;
    }
    .temperature-converter, ^.temperature-converter ^input {
      cursor: default;
    }
    .temperature-converter ^input {
      width: 5em;
      text-align: right;
      border: none;
      background: none;
      color: inherit;
      height: 2em;
      vertical-align: baseline;
      padding-right: .4em;
    }
    .temperature-converter ^.arrows {
      font-size: 20px;
      vertical-align: middle;
    }
    .temperature-converter ^input:focus {
      outline: none;
    }
    .celsius-wrap,
    .fahrenheit-wrap {
      display: inline-block;
      border: 1px solid currentColor;
      outline-color: currentColor;
      padding: 0 4px 0 0;
      border-radius: 4px;
    }
    .fahrenheit-wrap {
      border-color: hsl(151, 21%, 77%);
      color: hsl(151, 60%, 30%);
      background: hsl(151, 24%, 90%);
    }
    .celsius-wrap {
      border-color: hsl(34, 43%, 72%);
       background: hsl(46, 52%, 90%);
      color: hsl(31, 100%, 30%);
    }
    input::-webkit-inner-spin-button {
      font-size: 166%;
      opacity: 1;
    }
  `,

  methods: [
    function initE() {
      //TODO it show the UTF-8 code not the character
      this.start('p').addClass('temperature-converter').
             start('label').addClass('celsius-wrap').add(this.data.C).add('°C').end().
             start('span').addClass('arrows').add('⇄').end().
             start('label').addClass('fahrenheit-wrap').add(this.data.F).add('°F').end().
           end();
    }
  ]
});

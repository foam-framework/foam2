/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddressDetailView',
  extends: 'foam.u2.View',

  documentation: 'Address Detail View',

  requires: [ 'foam.nanos.auth.Address' ],

  css: `
    ^ {
      height: auto;
    }
    ^ .property-type {
      width: 120px;
      margin-left: 180px;
      margin-bottom: 10px;
    }
    ^ .property-verified {
      margin-left: 20px;
      margin-bottom: 10px;
    }
    ^ .property-structured {
      margin-left: 215px;
      margin-bottom: 10px;
    }
    ^ .property-streetNumber {
      width: 110px;
      margin-bottom: 10px;
    }
    ^ .property-streetName {
      width: 160px;
      margin-left: 114px;
      margin-bottom: 10px;
    }
    ^ .property-address1 {
      width: 200px;
      margin-bottom: 10px;
      displayWidth: 10;
    }
    ^ .property-address2 {
      width: 200px;
      margin-left: 23px;
      margin-bottom: 10px;
      displayWidth: 50;
    }
    ^ .property-suite {
      width: 90px;
      margin-left: 60px;
      margin-bottom: 10px;
    }
    ^ .property-city {
      width: 110px;
      margin-bottom: 10px;
    }
    ^ .property-postalCode {
      width: 120px;
      margin-bottom: 10px;
    }
    ^ .property-countryId {
      display: inline;
      margin-bottom: 10px;
    }
    ^ .property-regionId {
      display: inline;
      margin-left: 115px;
      margin-bottom: 10px;
    }
    ^ .frequency-div {
      display: inline-block;
      margin: 0 36px 20px 0;
    }
    ^.span {
      display: inline;
      margin-top: 10px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
          start().
            start('span').add('Country').end().
            start('span').style({'margin-left': '170px'}).add(this.Address.TYPE.label).end().
          end().
          start().
            add(this.Address.COUNTRY_ID).add(this.Address.TYPE).
          end().
          start().
            start('span').add(this.Address.VERIFIED.label).end().
            start('span').style({'margin-left': '170px'}).add(this.Address.STRUCTURED.label).end().
          end().
          start().
            add(this.Address.VERIFIED).add(this.Address.STRUCTURED).
          end().
          startContext({data: this.data}).
            start().hide(this.data.structured$).
              start().
                start('span').add(this.Address.ADDRESS1.label).end().
                start('span').style({'margin-left': '158px'}).add(this.Address.ADDRESS2.label).end().
              end().
              start().
                add(this.Address.ADDRESS1).add(this.Address.ADDRESS2).
              end().
            end().

            start().show(this.data.structured$).
              start().
                start('span').add(this.Address.STREET_NUMBER.label).end().
                start('span').style({'margin-left': '120px'}).add(this.Address.STREET_NAME.label).end().
                start('span').style({'margin-left': '127px'}).add(this.Address.SUITE.label).end().
              end().
              start().
                add(this.Address.STREET_NUMBER).add(this.Address.STREET_NAME).add(this.Address.SUITE).
              end().
            end().
          endContext().
          start().
            start('span').add(this.Address.CITY.label).end().
            start('span').style({'margin-left': '198px'}).add('Province/State').end().
          end().
          start().
            add(this.Address.CITY).add(this.Address.REGION_ID).
          end()
    }
  ]
});

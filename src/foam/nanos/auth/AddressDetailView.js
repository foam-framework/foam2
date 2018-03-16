/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
    
    ^ .address-container{
      background: white;
      padding: 4px 25px;
      margin-bottom: 20px;
    } 
    ^ .input-container-half{
      width: 46%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    ^ .input-container-sixth{
      width: 15%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    ^ .input-container-third{
      width: 30%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    ^ .foam-u2-Textfield{
      height: 40px;
      width: 100%;
      background: white;
      border: 1px solid lightgrey;
      margin-top: 5px;
    }
    ^ .foam-u2-tag-Select{
      height: 40px;
      width: 100%;
      background: white;
      border: 1px solid lightgrey;
      margin-top: 5px;
    }
    ^ .foam-u2-ActionView {
      opacity: 0.6;
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.3px;
      color: #093649;
      padding: 0;
      padding-left: 30px;
      display: inline-block;
      cursor: pointer;
      margin: 0;
      border: none;
      background: transparent;
      outline: none;
      line-height: 40px;
    }
    ^ .frequency-div {
      display: inline-block;
      margin: 0 36px 20px 0;
    }
    ^ .span {
      display: inline;
      margin-top: 10px;
    }

    
    ^ p{
      font-size: 10px;
      color: #093649;
      font-weight: 300;
      display: inline-block;
      position: relative;
      right: 100;
    }
    ^ input{
      width: 100%;
      height: 40px;
      margin-top: 7px;
    }
    ^ label{
      font-weight: 300;
      font-size: 14px;
      color: #093649;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'showType',
      value: true
    },
    {
      class: 'Boolean',
      name: 'showVerified',
      value: true
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('address-container'))
          .start().addClass('input-container-half')
            .start('label').add('Country').end()
            .start(this.Address.COUNTRY_ID).end()
          .end()
          .callIf(this.showType, function(){
            this.start().addClass('input-container-half')
              .start('label').add('Type').end()
              .start(self.Address.TYPE).end()
            .end()
          })
          .callIf(this.showVerified, function(){
            this.start().addClass('input-container-half')
              .start('label').add('Verified').end()
              .start(self.Address.VERIFIED).end()
            .end()
          })
          .start().addClass('input-container-half')
            .start('label').add('Structured').end()
            .start(this.Address.STRUCTURED).end()
          .end()
          .startContext({data: this.data})
            .start().hide(this.data.structured$)
              .start().addClass('input-container-half')
                .start('label').add('Address 1').end()
                .start(this.Address.ADDRESS1).end()
              .end()
              .start().addClass('input-container-half')
                .start('label').add('Address 2').end()
                .start(this.Address.ADDRESS2).end()
              .end()
            .end()
            .start().show(this.data.structured$)
              .start().addClass('input-container-sixth')
                .start('label').add('Street Number').end()
                .start(this.Address.STREET_NUMBER).end()
              .end()
              .start().addClass('input-container-half')
                .start('label').add('Street Name').end()
                .start(this.Address.STREET_NAME).end()
              .end()
              .start().addClass('input-container-third')
                .start('label').add('Suite').end()
                .start(this.Address.SUITE).end()
              .end()
            .end()
          .endContext()
          .start().addClass('input-container-half')
            .start('label').add('City').end()
            .start(this.Address.CITY).end()
          .end()
          .start().addClass('input-container-half')
            .start('label').add('Province').end()
            .start(this.Address.REGION_ID).end()
          .end()    
          .start().addClass('input-container-half')
            .start('label').add('Postal Code').end()
            .start(this.Address.POSTAL_CODE).end()
          .end()
        .end()
    }
  ]
});

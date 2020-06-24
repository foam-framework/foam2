foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityRequirementView',
  extends: 'foam.u2.View',

  css: `
    ^ .text-container {
      width: 330px;
      font-size: 16px;
      text-align: center;
      color: #525455;
      margin: auto;
      margin-top: 30px;
      padding: 2vh;
    }
    ^ .body-paragraph {
      color: #525455;
      line-height: 1.5;
      padding: 5vh;
    }
    
    ^ p {
      display: inline-block;
      position: relative;
      bottom: 5px;
      left: 10px;
    }
    
    ^ .table-heading > img {
      display: inline-block;
    }
    
    ^ .table-heading {
      margin-top: 30px;
      font-size: 14px;
      font-weight: 600;
      color: /*%BLACK%*/ #1e1f21;
    }
    
    ^ .table-content {
      font-size: 14px;
      line-height: 15px;
      font-weight: 900;
    }
    .foam-u2-dialog-Popup {
      align-items: center;
      bottom: 0;
      display: flex;
      justify-content: space-around;
      left: 0;
      right: 0;
      top: 0;
      position: sticky;
      display: inline-flex;
      z-index: 1000;
    }
    
  `,

  messages: [
    {
      name: 'INTRO_TEXT',
      message: `I’ll be asking you for some information that will verify your personal 
          identity and your organization's identity. It may feel like a lot, but we take 
          security very seriously, and we want to make sure that your account is protected 
          at all times.  We are dealing with your hard earned money after all, so a little 
          extra security goes a long way!`
    }
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'arrayRequirement'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .addClass('body-paragraph')
          .add(this.INTRO_TEXT)
        .end()
        .start()
        .add(this.slot(
          (arrayRequirement) => {
            return this.E().forEach(arrayRequirement,
              (helpString) => {
                return this.start().addClass('table-heading') // return this.start('span').addClass('table-heading')
                  .start('img').attrs({ src: 'images/checkmark-small-green.svg' }).end()
                  // .start('p').add(this.INTRO_TITLE_1).end()
                  .start()
                    .addClass('table-content')
                    .add(helpString)
                  .end()
                .end();
              }
            );
          }
        ))
      .end();
    }
  ]
});
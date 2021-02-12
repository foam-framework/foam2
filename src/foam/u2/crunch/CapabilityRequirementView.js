/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityRequirementView',
  extends: 'foam.u2.View',

  imports: [
    'ctrl'
  ],

  requires: [
    'foam.u2.crunch.Style',
  ],

  css: `
    ^ {
      max-width: 40vw;
      max-height: 70vh;
      overflow: auto;
      margin: 28px;
    }

    ^ .titles {
      text-align: center;
    }

    ^ .makeBold {
      font-size: 22px;
      font-weight: 600;
      padding-bottom: 2vh;
    }

    ^ .subTitle {
      font-size: 20px;
      color: #7f8385;
      width: 85%;
      display: inline-block;
      padding-bottom: 4vh;
    }

    ^ p {
      display: inline-block;
      position: relative;
      bottom: 5px;
      left: 10px;
    }

    ^ .table-content {
      font-size: 14px;
      color: #7f8385;
      padding-left: 1.5vw;
      margin-top: -19px;
      line-height: 1em;
      padding-bottom: 2vh;
    }

    ^ .circle-center {
      padding-top: 3vh;
      padding-bottom: 2vh;
      text-align: center;
      height: 80px;
    }

    ^ .list-position {
      padding-left: 5vw;
      padding-right: 5vw;
    }

    ^ .img-position {
      width: 16px;
    }

    ^ .actionPosition {
      float: right;
      padding: 3vh;
    }
  `,

  messages: [
    {
      name: 'INTRO_TEXT',
      message: `In this section, we ask you to enter some details relating to your business.`
    }
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'arrayRequirement'
    },
    {
      class: 'Function',
      name: 'onClose'
    },
    {
      class: 'Object',
      name: 'functionData'
    },
    {
      class: 'String',
      name: 'capabilityId'
    }
  ],

  methods: [
    function initE() {
      var style = this.Style.create();
      style.addBinds(this);
      var mainCapability = this.functionData ?
        this.functionData.caps.filter(
          capability =>
            capability.id == this.capabilityId
        ) :
        undefined;
      this.addClass(this.myClass()).addClass('start')
        // center icon image
        .start().callIf(mainCapability, function() {
          return this.addClass('circle-center')
            .start()
              .addClass(style.myClass('icon-circle'))
              .style({
                'background-image': `url('${mainCapability[0].icon}')`,
                'background-size': 'cover',
                'background-position': '50% 50%'
              })
            .end();
        }).end()

        .start().addClass('titles')
          // title
          .start().addClass('makeBold').translate(mainCapability[0].id+'.name', mainCapability[0].name).end()
          // subTitle
          .start().addClass('subTitle')
            .translate(mainCapability[0].id + '.requirementViewTitle' , mainCapability[0].requirementViewTitle || this.INTRO_TEXT)
          .end()
        .end()
      .start().addClass('actionPosition')
        .startContext({ data: this })
          .start(this.GET_STARTED).end()
          .start(this.CANCEL, { buttonStyle: 'SECONDARY' }).end()
        .endContext()
      .end();
    }
  ],
  actions: [
    {
      name: 'getStarted',
      label: 'Get started',
      code: function(x) {
        x.closeDialog();
        this.onClose(x, true);
      }
    },
    {
      name: 'cancel',
      code: function(x) {
        x.closeDialog();
        this.onClose(x, false);
      }
    }
  ]
});

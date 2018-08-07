foam.CLASS({
  package: 'demo.build',
  name: 'ModelToBuild',
  
  //extends: 'foam.u2.Controller',
  //extends: 'foam.u2.View',
  //extends: 'foam.u2.Element',

  imports: [ 'ctrl' ],
  
  requires: [
    'foam.u2.dialog.NotificationMessage'
    ,'foam.u2.View'
    /* ' demo.build.ModelToBuild' */
  ],
    /* 
    {
      path: 'foam.swift.parse.json.output.Outputter',
      flags: ['swift'],
    },
    {
      path: 'foam.dao.EasyDAO',
      flags: ['js'],
    },
  ], */

  properties: [
    {
      name: 'jsProp',
      flags: ['js'],
    },
    {
      class: 'String',
      name: 'iAMASPROPERTY'
    },
    {
      name: 'Choices',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'one-way flight',
          'return flight'
        ]
      }
    },
    {
      class: 'Float',
      name: 'volume',
      value: 0.5,
      view: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.FloatView' },
        viewb: { class: 'foam.u2.RangeView', onKey: true, maxValue: 1, step: 0.01 }
      }
    } /* ,
    {
      class: 'Boolean',
      name: 'pop',
      default: true
      //flags: ['swift'],
    },  */
  ],

/*   methods: [
    function initE() {
      var self = this;
      console.log("HERE")
      this
        .addClass(this.myClass())
        .start()
        .add(this.VOLUME)
        .end()
    }
  ], */

  actions: [
    {
      name: 'activate',
      isAvailable: function() {return true;},
      //isEnabled: function() {return !this.pop;},
      code: function () {
        console.log("Testing work");

        //return pop;
        //debugger;
        //console.log(this.E().outerHTML);
        //debugger;
        
      //  view: {
      //   class: 'foam.u2.dialog.NotificationMessage',
      //   data: this.NotificationMessage.create({ message: 'Please Enter Title.' });
      // }
      var bob = this.NotificationMessage.create({ message: 'Please enter an email address'});
      console.log(bob);
      if(NotificationMessage.isInstance(bob)){console.log('bob is a notification');}
      else console.log('bob is not a notification, instead bob is a '+ typeof bob + ' notification is type of '+ typeof NotificationMessage);
      
        // 
      }
    }
  ] /* ,
  methods: [
    function init() {
      this.SUPER.apply(this, arguments);
    }
  ] */
});

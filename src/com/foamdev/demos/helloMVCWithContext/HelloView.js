/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVCWithContext',
  name: 'HelloView',
  extends: 'foam.u2.View',// it will imports 'data'

 /* imports: [
    'HelloUser'
  ],*/

  methods: [
    function initE() {
      this
        .start('h1').add('Name:').end()
        .start('div').add(this.data.yourName).end()
        //start(this.data.YOUR_NAME).attrs({onKey: true, placeholder:'Your name please'}).end().
        .start('h1').add('Hello ').add(this.data.yourName$).add('!').end()
        .start('h1').add('Hello ').add(this.data.YOUR_NAME).end();

      //when we render a property based on it own property type
      //in this case, you khow the type
      this.start('h3').add('alive ').add(this.data.ALIVE).end();

      //when we render an object that we don't know the type,
      //The context will manage to cast it to the appropriete slot
      //FOAM ensure to convert the object based on there type, but in some context, we will require to manage the FObject (getting a response)
      //in this case the view anywiew,will render the element.
      this
        .start('h3').add('alive ')
        .startContext({data: this.data })
          .tag( this.data.ALIVE)
        .endContext();

      this
        .start('h3').add('alive ')
        .startContext({data: this.data })
          .tag( this.data.ALIVE, {enableChoice: false})
        .endContext();
        
      //specify the view to render the element
      this.tag({
        class: 'foam.u2.view.AnyView', 
        enableChoice: false,
        data$: this.data.alive$ 
        });
    }
  ]
});

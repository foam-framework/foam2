/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.md',
  name: 'ControllerForms',
  extends: 'foam.u2.Element',
  
  requires: [ 
    'foam.u2.md.TextField',
    'foam.u2.md.CheckBox',
  ],

  exports: [ 'as data' ],

  imports: [ 'window' ], //To add MD JavaScript

  properties: [
    {
      class: 'Boolean',
      name: 'checkBoxTest',
      value: true,
      view: {
        class: 'foam.u2.CheckBox',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'firstName',
      value: 'Mark2',
      id: 'validationCustom01',
      view: {
        class: 'foam.u2.TextField',//start('input')
        onKey: true,
        placeholder: 'First name',
        required: 'true',
        type: 'text',
      }
    },

    {
      class: 'Boolean',
      name: 'checkTest',
      view: {
        class: 'foam.u2.CheckBox',
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      foam.__context__.register(this.TextField,'foam.u2.TextField' );
      foam.__context__.register(this.CheckBox,'foam.u2.CheckBox' );
      
      /*<div class = "mdl-textfield mdl-js-textfield">
          <input class = "mdl-textfield__input" type = "text" id = "text1">
          <label class = "mdl-textfield__label" for = "text1">Text...</label>
        </div>
      */
      
      this.
        start('h4').add('First example with MD').end().
        start().addClass('mdl-textfield').addClass('mdl-js-textfield').
          start('input').addClass('mdl-textfield__input').attrs({ type: 'text', id: 'text1' }).end().
          start('label').addClass('mdl-textfield__label').attrs({ for: 'text1'}).add('Text...').end().
        end();

      this.
        start('div').addClass('container').add('Hello, Forms!').end().
        add('Custom styles').
          /*<form class="needs-validation" novalidate>
            <div class="form-row">*/
          start('form').//addClass('needs-validation').attrs({ novalidate: 'true'}).
            start('div').//addClass('form-row').
              /*<div class="col-md-4 mb-3">
                <label for="validationCustom01">First name</label>
                <input type="text" class="form-control" id="validationCustom01" placeholder="First name" value="Mark" required>
                <div class="valid-feedback">
                  Looks good!
                </div>
              </div>*/
              start('div').addClass('col-md-4').addClass('mb-3').
                start('label').attrs({ for: 'validationCustom01' }).add('First name2').end().
                add(this.firstName$).
                add(this.FIRST_NAME).
                tag('hr').
                add(this.checkTest$).
                add(this.CHECK_TEST).add('check box test').
              end().
            end().
          end().
        end();
    }
  ],
  listeners: [
    
  ],
});

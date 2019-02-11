/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO fix the checkbox to be responsive.

foam.CLASS({
  package: 'com.foamdev.demos.bootstrap',
  name: 'ControllerForms2',
  extends: 'foam.u2.Element',
  
  requires: [ 
    'foam.u2.bootstrap.TextField',
    'foam.u2.bootstrap.CheckBox',
    //'foam.u2.md.CheckBox',
    //'foam.u2.md.TextField',
    //'foam.u2.md.ActionView'
  ],

  exports: [ 'as data' ],

  imports: [ 'window' ], //To add bootstrap JavaScript

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
      class: 'Boolean',
      name: 'checkTest',
      value: false,
      view: {
        class: 'foam.u2.CheckBox',
        required: 'true',
      }
    },
    {
      class: 'String',
      name: 'firstName',
      value: 'Mark2',
      view: {
        class: 'foam.u2.TextField',//start('input')
        onKey: true,
        placeholder: 'First name',
        required: 'true',
        type: 'text',
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      
      foam.__context__.register(this.TextField,'foam.u2.TextField' );//the CSS style will be apply to the all TextField in this context.
      foam.__context__.register(this.CheckBox,'foam.u2.CheckBox' );
      //foam.__context__.register(this.CheckBox,'foam.u2.bootstrap.CheckBox' );
      //foam.__context__.register(this.CheckBox,'foam.u2.md.CheckBox' );

      this.
        start('div').addClass('container').add('Hello, Forms!').end().add('Custom styles').
          /*<form class="needs-validation" novalidate>
            <div class="form-row">*/
          start('form').addClass('needs-validation').attrs({ novalidate: 'true'}).
            start('div').addClass('form-row').
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

                /*<div class="custom-control custom-checkbox mb-3">
                    <input type="checkbox" class="custom-control-input" id="customControlValidation1" required="">
                    <label class="custom-control-label" for="customControlValidation1">Check this custom checkbox</label>
                    <div class="invalid-feedback">Example invalid feedback text</div>
                  </div>*/

                start('div').addClass('valid-feedback').add('Looks good!').end().

                start('input').
                  addClass('form-control').
                    attrs({ type: 'text', id: 'validationCustom01', placeholder: 'First name', value: 'Mark', required: 'true' }).
                end().
                start('div').addClass('valid-feedback').add('Looks good!').end().
                
                tag('hr').
                
                start('input').addClass('form-control').attrs({ type: 'text', id: 'validationCustom01', placeholder: 'First name', value: 'Mark', required: 'true' }).end().
                
                //callIf( ! this.firstName, function(){this.start('div').addClass('valid-feedback').add('Looks good!').end()}).
                start('div').addClass('valid-feedback').add('Looks good!').end().
              end().
  
              /*<div class="col-md-4 mb-3">
                <label for="validationCustom02">Last name</label>
                <input type="text" class="form-control" id="validationCustom02" placeholder="Last name" value="Otto" required>
                <div class="valid-feedback">
                  Looks good!
                </div>
              </div>*/
              start('div').addClass('col-md-4').addClass('mb-3').
                start('label').attrs({ for: 'validationCustom02' }).add('Last name').end().
                start('input').attrs({ type: 'text', id: 'validationCustom02', placeholder: 'Last name', value: 'Otto', required: 'true' }).addClass('form-control').end().
                start('div').addClass('valid-feedback').add('Looks good!').end().
              end().
              /*<div class="col-md-4 mb-3">
                  <label for="validationCustomUsername">Username</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="inputGroupPrepend">@</span>
                    </div>
                    <input type="text" class="form-control" id="validationCustomUsername" placeholder="Username" aria-describedby="inputGroupPrepend" required>
                    <div class="invalid-feedback">
                      Please choose a username.
                    </div>
                  </div>
                </div>
              </div>*/
              start('div').addClass('col-md-4').addClass('mb-3').
                start('label').attrs({ for: 'validationCustomUsername' }).add('Username').end().
                start().addClass('input-group').start().addClass('input-group-prepend').
                  start('span').addClass('input-group-text').attrs({ id: 'inputGroupPrepend' }).add('@').end().
                end().
                start('input').attrs({ type: 'text', id: 'validationCustomUsername', placeholder: 'Username', 'aria-describedby': 'inputGroupPrepend', required: 'true' }).addClass('form-control').end().
                start('div').addClass('invalid-feedback').add('Please choose a username.').end().
              end().
            end().
          end().

          //<div class="form-row">
          start('div').addClass('form-row').
          /*
          <div class="col-md-6 mb-3">
            <label for="validationCustom03">City</label>
            <input type="text" class="form-control" id="validationCustom03" placeholder="City" required>
            <div class="invalid-feedback">
              Please provide a valid city.
            </div>
          </div>*/

          start('div').addClass('col-md-6').addClass('mb-3').
            start('label').attrs({ for: 'validationCustom03' }).add('City').end().
            start('input').attrs({ type: 'text', id: 'validationCustom03', placeholder: 'City', required: 'true'}).addClass('form-control').end().
            start('div').addClass('invalid-feedback').add('Please provide a valid city.').end().
          end().
          /*
          <div class="col-md-3 mb-3">
            <label for="validationCustom04">State</label>
            <input type="text" class="form-control" id="validationCustom04" placeholder="State" required>
            <div class="invalid-feedback">
              Please provide a valid state.
            </div>
          </div>*/
  
          start('div').addClass('col-md-3').addClass('mb-3').
            start('label').attrs({ for: 'validationCustom04' }).add('State').end().
            start('input').attrs({ type: 'text' , id: 'validationCustom04' , placeholder: 'State' , required: 'true' }).addClass('form-control').end().
            start('div').addClass('invalid-feedback').add('Please provide a valid State.').end().
          end().
          /*
          <div class="col-md-3 mb-3">
            <label for="validationCustom05">Zip</label>
            <input type="text" class="form-control" id="validationCustom05" placeholder="Zip" required>
            <div class="invalid-feedback">
              Please provide a valid zip.
            </div>
          </div>
        </div>*/
          start('div').addClass('col-md-3').addClass('mb-3').
            start('label').attrs({ for: 'validationCustom05' }).add('Zip').end().
            start('input').attrs({ type: 'text' , id: 'validationCustom05' , placeholder: 'Zip' , required: 'true' }).addClass('form-control').end().
            start('div').addClass('invalid-feedback').add('Please provide a valid Zip.').end().
          end().
        end().
            /*
            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
                <label class="form-check-label" for="invalidCheck">
                  Agree to terms and conditions
                </label>
                <div class="invalid-feedback">
                  You must agree before submitting.
                </div>
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Submit form</button>
          </form>*/

          start('div').addClass('form-group').addClass('form-check').
            start('div').addClass('custom-control').addClass('custom-checkbox').addClass('mb-3').//.addClass('form-check-input')
              start('input').addClass('custom-control-input').attrs({ type: 'checkbox', id: 'customControlValidation1', value: '', required: 'true' }).end().
              start('label').addClass('form-check-label').addClass('custom-control-label').attrs({ for: 'customControlValidation1' }).add('Agree to terms and conditions').end().
              start('div').addClass('invalid-feedback').add('You must agree before submitting.').end().
            end().
          end().
          start('button').addClass('btn').addClass('btn-primary').attrs({ type: 'submit' }).add('Submit form').on('click', this.MyEvent).end().
        end().
        
        tag('hr').    
        start('label').addClass('custom-control-label').attrs({ for: 'customCheck1' }).add('Check this custom checkbox').
          /*start().add(this.CHECK_BOX_TEST).addClass(this.checkBoxTest$.map(function(checkBoxTest) {
            console.log(checkBoxTest);
            return checkBoxTest ? self.start('div').addClass('valid-feedback').add().end() : self.start('div').addClass('invalid-feedback').end()
            //TODO the css class exist in the web page, but in the function I got the error of Uncaught (in promise) Invalid CSS classname
            })).
          end().*/
        end().
        //start('div').addClass('invalid-feedback').add('Example invalid feedback text').end().
        //callIf( this.customControlValidation1.checkValidity() , function(){ console.log('000');this.start('div').addClass('valid-feedback').add('Looks good!').end()}).

        /*<div class="form-group form-check">
            <div class="custom-control custom-checkbox mb-3">
              <input class="custom-control-input" type="checkbox" value="" id="customControlValidation1" required>
              <label class="custom-control-label form-check-label" for="customControlValidation1">
                Agree to terms and conditions
              </label>
              <div class="invalid-feedback">
                You must agree before submitting.
              </div>
            </div>
          </div>*/

          tag('hr').
            start().addClass('custom-control').addClass('custom-checkbox').addClass('mb-3').
              add(this.CHECK_TEST).
              start('label').
                addClass('custom-control-label').
                addClass('form-check-label').
                add('Agree to terms and conditions').
              end().
            start('div').addClass('invalid-feedback').add('You must agree before submitting.').end().
          end().

          add(this.checkTest$).
          tag('hr').
          start().addClass('form-group').addClass('form-check').addClass('was-validated').
            start().addClass('custom-control').addClass('custom-checkbox').addClass('mb-3').
              add(this.CHECK_TEST).addClass(this.checkTest$.map(function(checkTest) {
                //return checkTest ? self.myClass('invalid-feedback'); console.log('oook'): self.myClass('valid-feedback')
                if (checkTest) {  console.log('oook'); console.log(this.CHECK_TEST) ;return checkTest = true;} else  self.myClass('valid-feedback');
              })).
            start('label').addClass('custom-control-label').addClass('form-check-label').add('Agree to terms and conditions').end().
            start('div').addClass('invalid-feedback').add('You must agree before submitting.').end().
          end().
        end();

      this. tag('hr').
        add(this.checkTest$).
        tag('hr').
        add(this.CHECK_TEST);

    }
  ],
  listeners: [
    function MyEvent() {
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if ( form.checkValidity() === false ) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    },
  ],
});

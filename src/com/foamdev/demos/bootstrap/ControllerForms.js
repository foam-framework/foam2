/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.bootstrap',
  name: 'ControllerForms',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      },
      placeholder: 'First name',
    //value:'Mark'
    },
    {
      class: 'Boolean',
      name: 'checkBoxTest',
      value: true,
      view: {
        class: 'foam.u2.CheckBox'
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

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
                start('label').attrs({ for: 'validationCustom01' }).add('First name').end().
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
                start('input').attrs({ type: 'text', id: 'validationCustom02', placeholder: 'Last name', value: 'Otto', required: 'true' }).addClass('form-control').end(). //.addClass('is-valid')
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

        start('div').addClass('form-group').
          start('div').addClass('form-check').
            start('input').attrs({ type: 'checkbox', id: 'invalidCheck', value: '', required: 'true' }).addClass('form-check-input').end().
            start('label').addClass('form-check-label').attrs({ for: 'invalidCheck' }).add('Agree to terms and conditions').end().
            start('div').addClass('invalid-feedback').add('You must agree before submitting.').end().
          end().
        end().
        start('button').addClass('btn').addClass('btn-primary').attrs({ type: 'submit' }).add('Submit form').on('click', this.MyEvent).end().
        end().
          
        start('label').addClass('custom-control-label').attrs({ for: 'customCheck1' }).add('Check this custom checkbox').
          start().add(this.CHECK_BOX_TEST).addClass(this.checkBoxTest$.map(function(checkBoxTest) {
            console.log(checkBoxTest);
            //return checkBoxTest ? self.start('div').addClass('valid-feedback').add().end() : self.start('div').addClass('invalid-feedback').end()
            //TODO to test
            })).
          end().
        end().
        start('div').addClass('invalid-feedback').add('Example invalid feedback text').end();
    }
  ],
  
  actions: [
    /*function MyEvent() {
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
    },*/
    {
      name: 'MyEvent',
      isEnabled: function(form) { 
        return form.checkValidity();
      },
      code: function() {
        
      }  
    }
  ],
});

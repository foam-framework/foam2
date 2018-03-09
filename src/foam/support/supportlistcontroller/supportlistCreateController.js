foam.CLASS({
    package: 'foam.support.supportlistcontroller',
    name: 'supportlistCreateController',
    extend: 'foam.u2.View',
    requires:[
        'foam.us.TableView',
        'foam.u2.ListCreateController',
        'foam.support.model.SupportEmail',
      
    ],
    imports: ['supportEmailDAO'],

    methods: [
            function initE(){
                var view = this;

                this.
                addClass(this.myClass())
                    .start('h2').add('Email Support Table').end()
                    .tag({ class: 'foam.u2.ListCreateController', dao: this.supportEmailDAO})
                
            }
    ],
})
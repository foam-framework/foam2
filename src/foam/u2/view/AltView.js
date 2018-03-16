/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'AltView',
  extends: 'foam.u2.View',

  documentation: "Provides the ability to switch between multiple views for data set" +
  "Takes a views property which should be the value of an array containing arrays that contain desired views, and label." +
  "Ex. views: [[ { class: 'foam.u2.view.TableView' }, 'Table' ]]",

  requires: [
    'foam.u2.stack.Stack'
  ],

  properties: [
    {
      name: 'of',
      factory: function() { return this.data.of }
    },
    {
      name: 'views',
      value: []
    },
    {
      name: 'altStack'
    },
    {
      name: 'viewChoices',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          choices: X.data.views
        });
      }
    }
  ],

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
    ^ .foam-u2-tag-Select{
      width: 100px;
      height: 40px;
    }
    ^ .property-viewChoices{
      margin: 0 0 25px 15px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.altStack = null;
      this.altStack = this.Stack.create();
      this.viewChoices$.sub(this.changeView);

      this.views.forEach(function(view){
        view[0].data = view[0].data ? view[0].data : self.data;
      });
      this.altStack.push(this.views[0][0]);

      this.addClass(this.myClass())
      this.startContext({data: this})
        this.start()
          .add(this.VIEW_CHOICES)
        .end()
      .endContext()
      .start('div').addClass('stack-wrapper')
        .tag({class: 'foam.u2.stack.StackView', data: this.altStack, showActions: false})
      .end();
    }
  ],

  listeners: [
    function changeView(){
      this.altStack.push(this.viewChoices);
    }
  ]
});

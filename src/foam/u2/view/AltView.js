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

  css: `
    ^ {
      margin: auto;
    }
    ^ .foam-u2-tag-Select {
      float: right;
      width: 100px;
      height: 28px;
    }
  `,

  properties: [
    {
      name: 'of',
      factory: function() { return this.data.of }
    },
    {
      name: 'views',
      factory: function() { return []; }
    },
    {
      name: 'selectedView',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.views});
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

     this.selectedView = this.views[0][0];

      this.addClass(this.myClass())
      this.startContext({data: this})
        this.start()
          .add(this.SELECTED_VIEW)
        .end()
      .endContext()
      .start('div')
        .add(this.selectedView$.map(function(v) {
          return self.E().tag(v, {data: self.data$proxy});
        }))
      .end();
    }
  ]
});

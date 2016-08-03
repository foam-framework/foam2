/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'PopupView',
  extends: 'foam.ui.SimpleView',

  imports: [
    'document'
  ],

  topics: [
    'closed'
  ],
    
  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^ {
        background: #999;
        box-shadow: 3px 3px 6px 0 gray;
        color: white;
        font-size: 18px;
        opacity: 0.9;
        padding: 20px;
        position: absolute;
        box-sizing: border-box;
      }
      */}
    })
  ],

  properties: [
    {
      name: 'view',
      // type: 'foam.ui.View',
    },
    {
      name: 'x'
    },
    {
      name: 'y'
    },
    {
      name: 'width'
    },
    {
      name: 'maxWidth'
    },
    {
      name: 'maxHeight'
    },
    {
      name: 'height'
    }
  ],

  methods: {
    open: function() {
      if ( this.$ ) return;
      var document = this.X.document;
      var div      = document.createElement('div');
      div.style.left = this.x + 'px';
      div.style.top  = this.y + 'px';
      if ( this.width )     div.style.width     = this.width     + 'px';
      if ( this.height )    div.style.height    = this.height    + 'px';
      if ( this.maxWidth )  div.style.maxWidth  = this.maxWidth  + 'px';
      if ( this.maxHeight ) div.style.maxHeight = this.maxHeight + 'px';
      div.style.position = 'absolute';
      div.id = this.id;
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(div);
      this.view.initHTML();
    },

    openOn: function(parent) {
      var self     = this;
      var document = this.document;

      var div = this.E('div').
        cssClass(this.myCls()).
        style({
          zIndex: 999
        });

      var bg = this.E('div').
        style({
          width: '10000px',
          height: '10000px',
          opacity: 0,
          top: 0,
          zIndex: 998
        });

      if ( ! this.y ) this.y = (parent.clientHeight - this.height)/2;
      if ( ! this.x ) this.x = (parent.clientWidth  - this.width )/2;

      div.style({
        left: this.x + 'px',
        top: this.y + 'px'
      });

      if ( this.width )     div.style({width    : this.width     + 'px'});
      if ( this.height )    div.style({height   : this.height    + 'px'});
      if ( this.maxWidth )  div.style({maxWidth : this.maxWidth  + 'px'});
      if ( this.maxHeight ) div.style({maxHeight: this.maxHeight + 'px'});

      parent.style({position: 'relative'});

      div.id = this.id;
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(bg);
      bg.on('click', function() {
        div.remove();
        bg.remove();
        self.destroy();
        self.closed.pub();
      });

      parent.appendChild(div);
      this.view.initHTML();
    },

    close: function() {
      this.remove();
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      this.close();
      this.view.destroy();
    }
  }
});

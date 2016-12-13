/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// TODO: doc
foam.CLASS({
  package: 'foam.u2',
  name: 'ReadWriteView',
  extends: 'foam.u2.View',

  requires: [ 'foam.u2.tag.Input' ],

  methods: [
    function initE() {
      // Don't create ReadView if no data (saves memory and startup time).
      if ( this.isLoaded() ) {
        this.initReadView();
      } else {
        this.listenForLoad();
      }
    },

    // Template Methods

    function isLoaded() {
      /** Return true iff data is available for this view. **/
      return this.data;
    },

    function listenForLoad() {
      this.data$.sub(this.onDataLoad);
    },

    function toReadE() {
      return this.E('span').add(this.data$);
    },

    function toWriteE() {
      this.data$.sub(this.onDataLoad);
      return this.Input.create({data$: this.data$});
    }
  ],

  listeners: [
    function onDataLoad(s) {
      s.detach();
      this.initReadView();
    },

    function initReadView() {
      this.removeAllChildren().add(this.toReadE().on('click', this.initWriteView));
    },

    function initWriteView() {
      this.removeAllChildren().add(this.toWriteE().on('blur', this.initReadView).focus());
    }
  ]
});

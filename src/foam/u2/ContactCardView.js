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

 foam.CLASS({
   package: 'foam.u2',
   name: 'ContactCardView',
   extends: 'foam.u2.View',

   documentation: 'View for displaying Contact Card',

   axioms: [
     foam.u2.CSS.create({
       code: function CSS() {/*
           //CSS classes here
           ^{
             background: white;
            }
           ^.cardContainer {
             width: 200px;
             height: 150px;
             border-color: 1px solid black;
            }
         */}
     })
   ],

   properties: [
     {
      name: 'dao',
      factory: function() { return this.businessDao;}
     }
   ],

   methods: [
     function initE() {
       this
        .addClass(this.myClass())
        .start('div').addClass('cardContainer')
        .end()  
     }
   ]
 })

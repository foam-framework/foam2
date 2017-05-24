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
           ^ {
              border-radius: 2px;
              background-color: #ffffff;
              width: 300px;
              height: 160px;
             }
           ^ h5 {
              font-family: 'Roboto';
              font-size: 12px;
              font-weight: normal;
              letter-spacing: 0.2px;
              padding-bottom: 4px;
              margin: 0;
              color: #093649;
             } 
           ^ .cardContainer {
              padding: 20px 20px 20px 20px;
              margin: 0;
             }
           ^ .profilePicture {
              width: 40px;
              height: 40px;
              background: black;
              margin-right: 20px;
              display: inline-block;
             }
           ^ .contactInfoDiv {
              float: bottom;
              padding-top: 22px;
             }
           ^ .companyInfoDiv {
              display: inline-block;
              height: 40px;
             }
           ^ .contactName {
              font-family: 'Roboto';
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 0.2px;
              color: #093649;
              padding-bottom: 10px;
              margin: 0;
             }
           ^ .companyName {
              width: 103px;
              height: 16px;
              font-family: 'Roboto';
              font-size: 14px;
              font-weight: 300;
              letter-spacing: 0.2px;
              text-align: left;
              color: #093649;
              margin: 0;
              float: top;
             }
           ^ .vendor {
              width: 46px;
              height: 12px;
              opacity: 0.6;
              font-family: 'Roboto';
              font-size: 14px;
              line-height: 0.86;
              letter-spacing: 0.2px;
              text-align: left;
              color: #093649;
              padding-top: 15px;
              margin: 0;
             }    
         */}
     })
   ],

   properties: [
     
   ],

   methods: [
     function initE() {
       this
        .addClass(this.myClass())
        .start('div').addClass('cardContainer')
          .start('img').addClass('profilePicture').end()
          .start('div').addClass('companyInfoDiv')
            .start('h2').addClass('companyName').add('Company Name').end()
            .start('h2').addClass('vendor').add('Vendor').end()
          .end()
          .start('div').addClass('contactInfoDiv')
            .start('h2').addClass('contactName').add('Tyler Sims').end()
            .start('h5').add('tyler.sims@jacobi.ca').end()
            .start('h5').add('284-436-9607').end()
          .end()
        .end();  
     }
   ]
 });

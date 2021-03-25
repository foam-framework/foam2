/**
 * @license
 * Copyright 2021 Google Inc. All Rights Reserved.
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
 **/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'BadgeView',
  extends: 'foam.u2.View',
  
  css:`
    ^Wrapper{
      height: 24px;
     
      width: 79px;

      padding: 0 8px;
 

      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 24px;
      letter-spacing: normal;
      text-align: center;
    }
   
  `,

  documentation:`Creates badges with rounded/squared sides based on display context`,

  properties: [
    {
        class: 'Boolean',
        name: 'isAttachedToCard'
    },
    {
        class: 'String',
        name: 'label',
    },
    {
        class: 'String',
        name: 'backgroundColor',
    },
    {
        class: 'String',
        name: 'color',
    },
  ],

  methods: [
    function initE(){
        this  
          .addClass(this.myClass('Wrapper'))
          .callIfElse(this.isAttachedToCard,
            function(){this.style({'border-radius': '0px 11.2px 11.2px 0px'})},
            function(){this.style({'border-radius': '11.2px'})}
          )
          .style({
            'background-color': this.backgroundColor,
            'color': this.color
          })
          .start()
          .addClass(this.myClass('label'))
          .add(this.label)
          .end()
          
    }
  ],

})

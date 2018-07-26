/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.u2.navigation',
  name: 'SubMenuBar',
  extends: 'foam.u2.Element',

  documentation: 'Childrens menu dropdown',

  css: `
    ^ {
      width: 100px;
      vertical-align: top;
    }
    ^ ul{
      margin-top: 20px;
      font-size: 13px;
      list-style-type: none;
    }
    ^ li{
      margin-top: 25px;
    }
    .highlight{
      background: blue;
    }
  `,

  properties: [
    'data',
    'parent'
  ],

  methods: [
    function initE(){
      var self   = this;
      var menus  = self.data;
      var parent = self.parent;

      this
          .addClass(this.myClass())
            .start()
              .start('ul')
                .forEach(this.filterSubMenus(menus, parent), function(i){
                  this.start('li')
                    .add(i.label)
                    .on('click', function() {
                      if(!i.selected){
                        self.selected = true;
                        self.tag({class: 'foam.u2.navigation.SubMenuBar', data: menus, parent: i })
                      }
                    })
                  .end()
                })
              .end()
            .end()
          .end();
    },

    function filterSubMenus(menus, parent){
      var subMenus = menus.filter(function(obj){
        return obj.parent == parent.id
      })

      return subMenus;
    }
  ]
});

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.boot',
   name: 'DAOConfigSummaryView',
   extends: 'foam.u2.View',

   css: `
     ^ {
       padding: 6px;
     }
     ^dao, ^header {
       display: inline-block;
       font-size: smaller;
       margin: 2px;
       padding: 2px;
       width: 190px;
     }
     ^dao {
       color: #555;
     }
     ^dao:hover {
       background: lightgray;
     }
     ^section {
       display: inline-grid;
     }
     ^header {
       background: %PRIMARYCOLOR%;
       color: white;
       font-weight: 800;
     }
   `,

   requires: [ 'foam.comics.BrowserView', 'foam.nanos.boot.NSpec' ],

   implements: [ 'foam.mlang.Expressions' ],

   imports: [ 'nSpecDAO', 'stack' ],

   properties: [
     {
       name: 'data',
       factory: function() {
         return this.nSpecDAO;
       }
     },
     {
       name: 'filteredDAO',
       factory: function() {
         return this.data.where(
           this.AND(
             this.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'),
             this.EQ(foam.nanos.boot.NSpec.SERVE,     true)
           ))
           .orderBy(this.NSpec.ID);
       }
     }
   ],

   methods: [
     function initE() {
       this.SUPER();

       var self          = this;
       var currentLetter = '';
       var section;

       this.addClass(this.myClass());

       this.filteredDAO.select(function(spec) {
         var label = foam.String.capitalize(spec.id.substring(0, spec.id.length-3));
         var l     = label.charAt(0);

         if ( l != currentLetter ) {
           currentLetter = l;
           section = self.start('span').addClass(self.myClass('section')).start('span').addClass(self.myClass('header')).add(l).end();
         }

         section.start('span')
           .addClass(self.myClass('dao'))
           .add(label)
           .attrs({title: spec.description})
           .on('click', function() {
             self.stack.push(self.BrowserView.create({
               data: self.__context__[spec.id]
             }));
           });
       });
     }
   ]
 });

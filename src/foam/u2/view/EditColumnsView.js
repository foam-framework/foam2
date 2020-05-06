// /**
//  * @license
//  * Copyright 2019 The FOAM Authors. All Rights Reserved.
//  * http://www.apache.org/licenses/LICENSE-2.0
//  */
// foam.CLASS({
//   package: 'foam.u2.view',
//   name: 'EditColumnsView',
//   extends: 'foam.u2.Element',
//   requires: [
//     'foam.u2.DetailView',
//     'foam.u2.view.ColumnOptionsSelectConfig',
//     'foam.u2.view.ColumnConfigPropView',
//     'foam.u2.view.SubColumnSelectConfig'
//   ],
//   properties: [
//     {
//       class: 'Class',
//       name: 'of',
//       hidden: true
//     },
//     {
//       name: 'isColumnChanged',
//       class: 'Boolean',
//       hidden:true
//     },
//     {
//       name: 'columnsAvailable',
//       hidden: true
//     },
//     {
//       name: 'columns',
//       factory: function() {
//         var arr = [];
//         for (var i = 0; i < this.selectedColumnNames.length; i++) {
//           arr.push(this.ColumnOptionsSelectConfig.create({selectedColumns: this.selectedColumnNames[i].split('.'), of:this.of, columnsAvailable:this.columnsAvailable, labels:this.labels }));
//         }
//         return arr;
//       },
//       view: function(_, X) {
//         return {
//           class: 'foam.u2.view.FObjectArrayView',
//           of: 'foam.u2.view.ColumnOptionsSelectConfig',
//           valueView: 'foam.u2.view.ColumnConfigPropView',
//           defaultNewItem: foam.u2.view.ColumnOptionsSelectConfig.create({selectedColumns:[], of:X.data.of, columnsAvailable:X.data.columnsAvailable, labels:X.data.labels })
//         };
//       }
//     },
//     {
//       name: 'labels',
//       hidden: true,
//       factory: function() {
//         var arr = [];
//         for ( var i = 0; i < this.columnsAvailable.length; i++ ) {
//           var p = this.of.getAxiomByName(this.columnsAvailable[i]);
//           arr.push([p.name, p.label ? p.label : p.name]);
//         }
//         return arr.sort((a, b) => {
//         if (a[1].toLowerCase() < b[1].toLowerCase())
//           return -1;
//         if (a[1].toLowerCase() > b[1].toLowerCase())
//           return 1;      
//         return 0;
//       });
//       }
//     },
//     {
//       name: 'selectedColumnNames',
//       hidden: true
//     }
//   ],
//   // This shouldn't be needed.
//   imports: [
//     'stack'
//   ],
//   actions: [
//     {
//       name: 'cancel',
//       code: function() {
//         this.stack.back();
//       },
//       view: function() {
//         return {
//           class: 'foam.u2.ActionView',
//           action: this,
//           buttonStyle: 'SECONDARY'
//         };
//       }
//     },
//     {
//       name: 'save',
//       code: function() {
//         var selectedColumns = [];
//         for ( var i = 0; i < this.columns.length; i++ ) {
//           if ( this.columns[i].selectedColumns.length != 0)
//             selectedColumns.push(this.columns[i].selectedColumns.join('.'));
//         }
//         // if ( this.view.isColumnChanged ) {
//           localStorage.removeItem(this.of.id);
//           localStorage.setItem(this.of.id, JSON.stringify(selectedColumns));
//           this.isColumnChanged = !this.isColumnChanged;
//         // }
//         this.stack.back();
//       }
//     }
//   ],
//   methods: [
//     function initE() {
//       return this.ColumnConfigPropView.create({ data: this });
//     }
//   ]
// });

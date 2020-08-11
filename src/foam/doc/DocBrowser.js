/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.doc',
  name: 'DocBorder',
  extends: 'foam.u2.Element',

  documentation: 'Titled raised View border used by the DocBrowser.',

  css: `
    ^ {
         border-radius: 3px;
         box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
         display: inline-block;
         width:100%;
    }
    ^title { padding: 6px; align-content: center; background: #c8e2f9; }
    ^info { float: right; font-size: smaller; }
    ^content { padding: 6px; min-width: 220px; height: 100%; background: white; }
  `,

  properties: [
    'title',
    'info'
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div').
          addClass(this.myClass('title')).
          add(this.title$).
          start('span').
            addClass(this.myClass('info')).
            add(this.info$).
          end().
        end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomInfo',

  ids: [ 'name' ],

  requires: [
    'foam.doc.ClassLink'
  ],

  properties: [
    {
      name: 'axiom',
      hidden: true
    },
    {
      name: 'documentation',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      name: 'cls',
      label: 'Source',
      tableCellView: function(o, e) {
        return foam.doc.LinkView.create({data: o.cls}, e.__subSubContext__);
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.tag(foam.doc.LinkView, { data: value });
      }
    },
    {
      name: 'type',
      tableCellView: function(o, e) {
        return o.type ?
          foam.doc.LinkView.create({data: foam.doc.Link.create({path: o.type.id, label: o.type.name})}, e.__subSubContext__) :
          'anonymous';
      },
      tableCellFormatter: function(value, obj, axiom) {
        if ( value ) {
          this.tag(foam.doc.LinkView, { data: foam.doc.Link.create({ path: value.id, label: value.name }) });
          return;
        }
        this.add('anonymous');
      }
    },
    {
      name: 'name',
      tableCellFormatter: function(value, obj, axiom) {
        if ( obj.type === foam.core.Requires ) {
          this.tag(obj.ClassLink, {data: obj.axiom.path, showPackage: true});
        } else if ( obj.type === foam.core.Implements ) {
          this.tag(obj.ClassLink, {data: obj.axiom.path, showPackage: true});
        } else {
          this.add(value);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'EnumInfo',

  ids: [ 'name' ],

  requires: [
    'foam.doc.ClassLink'
  ],

  properties: [
    {
      name: 'name',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      name: 'label',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
    {
      name: 'documentation',
      tableCellFormatter: function(value, obj, axiom) {
        this.add(value);
      }
    },
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ClassList',
  extends: 'foam.u2.View',

  requires: [
    'foam.doc.ClassLink',
    'foam.doc.DocBorder'
  ],

  css: `
    ^ a {
      display: inline-block;
      padding: 2px;
      width: 200px;
    }
    ^package {
      font-weight: 700;
    }
    ^indent {
      margin-left: 30px;
    }
  `,

  properties: [
    'title',
    {
      name: 'info',
      expression: function (data) {
        return data && data.length;
      }
    },
    {
      of: 'Boolean',
      name: 'showPackage',
      value: true
    },
    {
      of: 'Boolean',
      name: 'showSummary'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var pkg  = '';

      this.
        addClass(this.myClass()).
        start(this.DocBorder, {title: this.title, info$: this.info$}).
          start('div').
            add(this.slot(function (data) {
              return self.E('span').forEach(data, function(d) {
                if ( ! this.showPackage ) {
                  if ( d.package !== pkg ) {
                    pkg = d.package;
                    this.start('div').addClass(self.myClass('package')).add(pkg).end();
                  }
                }

                this.start('div')
                  .start(self.ClassLink, {data: d, showPackage: this.showPackage}).
                    addClass(this.showPackage ? null : self.myClass('indent')).
                  end().
                  call(function(f) {
                    if ( d.model_ && self.showSummary ) {
                      this.add(' ', self.summarize(d.model_.documentation));
                    }
                  }).
                end();
              });
            })).
          end().
        end();
    },

    function summarize(txt) {
      if ( ! txt ) return null;
      var i = txt.indexOf('.');
      if ( i < 60 ) return txt.substring(0, i+1);
      return txt.substring(0, 56) + ' ...';
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ClassDocViewEnumValue',
  extends: 'foam.u2.View',

  requires: [
    'foam.dao.ArrayDAO',
    'foam.doc.ClassLink',
    'foam.doc.EnumInfo',
    'foam.u2.view.TableView'
  ],

  imports: [
    'selectedAxiom'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var data = this.data;
      this.
          start('b').add(data.id).end().
          br().
          add('extends: ');

      var cls = data;
      for ( var i = 0 ; cls ; i++ ) {
        cls = foam.lookup(cls.model_.extends, true);
        if ( i ) this.add(' : ');
        this.start(this.ClassLink, {data: cls}).end();
        if ( cls === foam.core.FObject ) break;
      }
      this.br();
      this.start(foam.u2.HTMLElement).add(data.model_.documentation).end();

      this.add( this.slot(function () {
        var axs = [];
        for ( var key in data.model_.values ) {
          var a  = data.model_.values[key];
          var ai = foam.doc.EnumInfo.create({
            label: data[a.name].label,
            documentation: data[a.name].documentation,
            name: a.name
          });
          axs.push(ai);
        }
        return this.TableView.create({
          of: this.EnumInfo,
          data: this.ArrayDAO.create({array: axs}),
          hoverSelection$: this.selectedAxiom$
        });
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ClassDocView',
  extends: 'foam.u2.View',

  requires: [
    'foam.dao.ArrayDAO',
    'foam.doc.AxiomInfo',
    'foam.doc.ClassLink',
    'foam.doc.Link',
    'foam.u2.view.TableView'
  ],

  imports: [
    'selectedAxiom',
    'showInherited',
    'showOnlyProperties'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var data = this.data;

      this.
          start('b').add(data.id).end().
          start('span').style({float:'right','font-size':'smaller'}).add(data.count_, ' created').end().br().
          add('extends: ');

      var cls = data;
      for ( var i = 0 ; cls ; i++ ) {
        cls = foam.lookup(cls.model_.extends, true);
        if ( i ) this.add(' : ');
        this.start(this.ClassLink, {data: cls}).end();
        if ( cls === foam.core.FObject ) break;
      }
      this.br();
      this.start(foam.u2.HTMLElement).add(data.model_.documentation).end();

      this.add( this.slot(function (showInherited, showOnlyProperties) {
        // TODO: hide 'Source Class' column if showInherited is false
        var axs = [];
        for ( var key in data.axiomMap_ ) {
          if ( showInherited || Object.hasOwnProperty.call(data.axiomMap_, key) ) {
            var a  = data.axiomMap_[key];
              if ( ( ! showOnlyProperties ) || foam.core.Property.isInstance(a) ) {
                var ai = foam.doc.AxiomInfo.create({
                  axiom: a,
                  type: a.cls_,
                  cls: this.Link.create({
                    path:  a.sourceCls_ ? a.sourceCls_.id   : '',
                    label: a.sourceCls_ ? a.sourceCls_.name : ''
                  }),
                name: a.name
              });
              axs.push(ai);
            }
          }
        }

        return this.TableView.create({
          of: this.AxiomInfo,
          data: this.ArrayDAO.create({array: axs}),
          hoverSelection$: this.selectedAxiom$
        });
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'Link',

  properties: [
    'path',
    'label'
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'LinkView',
  extends: 'foam.u2.View',

  imports: [ 'browserPath' ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('a').
        on('click', this.click).
        attrs({href: this.data.path}).
        add(this.data.label);
    }
  ],

  listeners: [
    function click(e) {
      this.browserPath$.set(this.data.path);
      e.preventDefault();
    }
  ]
});

foam.CLASS({
  package: 'foam.doc',
  name: 'DocBrowser',
  extends: 'foam.u2.Element',

  documentation: 'FOAM documentation browser.',

  requires: [
    'foam.doc.ClassDocView',
    'foam.doc.ClassDocViewEnumValue',
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.UMLDiagram'
  ],

  imports: [ 'document' ],

  exports: [
    'as data',
    'axiom as selectedAxiom',
    'conventionalUML',
    'path as browserPath',
    'showInherited',
    'showOnlyProperties'
  ],

  css: `
    ^ {
      font-family: roboto, arial;
      color: #555;
    }
    ^ th {
      color: #555;
    }
    ^ td {
      padding-right: 12px;
    }
  `,

  constants: [
    {
      name: 'MODEL_COMPARATOR',
      factory: function() {
        return foam.compare.compound([foam.core.Model.PACKAGE, foam.core.Model.NAME]).compare;
      },
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'path',
      width: 80,
      factory: function() {
        var path = 'foam.core.Property';

        // TODO: this should be made generic and added to Window
        this.document.location.search.substring(1).split('&').forEach(function(s) {
          s = s.split('=');
          if ( s[0] === 'path' ) path = s[1];
        });

        return path;
      }
    },
    {
      name: 'selectedClass',
      expression: function (path) {
        return foam.lookup(path, true);
      }
    },
    {
      class: 'Boolean',
      name: 'showInherited',
      value: true
    },
    {
      class: 'FObjectProperty',
      name: 'axiom',
      view: { class: 'foam.u2.DetailView' }
    },
    {
      name: 'subClasses',
      expression: function (path) {
        return Object.values(foam.USED).
            filter(function(cls) {
              if ( ! cls.model_ ) return false;
              return cls.model_.extends == path || 'foam.core.' + cls.model_.extends == path;
            }).
          sort(this.MODEL_COMPARATOR);
      }
    },
    {
      name: 'requiredByClasses',
      expression: function (path) {
        return Object.values(foam.USED).
            filter(function(cls) {
              if ( ! cls.model_ ) return false;
              return cls.model_.requires && cls.model_.requires.map(
                  function(r) { return r.path; }).includes(path);
            }).
            sort(this.MODEL_COMPARATOR);
      }
    },
    {
      name: 'relationshipClasses',
      expression: function (path) {
        return [];
      }
    },
    'subClassCount',
    {
      class: 'Boolean',
      name: 'conventionalUML',
      // this property will allow to switch from the conventional UML diagram (diagram contain
      // a set of properties ) to UML ++ diagram ( and vice versa ).
      value: true
    },
    {
      class: 'Boolean',
      name: 'showOnlyProperties',
      value: true
    }
  ],

  methods: [
    function initE() {
      for ( var key in foam.UNUSED ) foam.lookup(key);
      this.SUPER();
      this.
        addClass(this.myClass()).
        tag(this.PATH, {displayWidth: 80}).
        start('span').
          style({'margin-left': '12px', 'font-size':'small'}).
          add('  Show Inherited Axioms: ').
        end().
        tag(this.SHOW_INHERITED, {data$: this.showInherited$}).
        br().br().
        start('table').
          start('tr').
            start('td').
              style({'vertical-align': 'top'}).
              start(this.DocBorder, {
                title: 'UML ++',
                info$: this.slot(function(selectedClass) {
                  return selectedClass.getOwnAxioms().length + ' / ' + selectedClass.getAxioms().length;
                })
              }).
                add( 'Conventional UML : ' ).tag( this.CONVENTIONAL_UML, { data$: this.conventionalUML$ } ).
                add(this.slot(function(selectedClass, conventionalUML) {
                  if ( ! selectedClass ) return '';
                  return this.UMLDiagram.create({
                    data: selectedClass
                  });
                })).
              end().
            end().
            start('td').
              style({'vertical-align': 'top'}).
              tag(this.ClassList, {title: 'Class List', showPackages: false, showSummary: true, data: Object.values(foam.USED).filter((e) => {e != undefined }).sort(this.MODEL_COMPARATOR)}).
            end().
            start('td').
              style({'vertical-align': 'top'}).
              start(this.DocBorder, {title: 'Class Definition', info$: this.slot(function(selectedClass) { return selectedClass.getOwnAxioms().length + ' / ' + selectedClass.getAxioms().length; })}).
                add( 'Show just properties : ' ).
                tag( this.SHOW_ONLY_PROPERTIES, { data$: this.showOnlyProperties$ } ).
                add(this.slot(function(selectedClass) {
                  if ( ! selectedClass ) return '';
                  return this.ClassDocView.create({data: selectedClass});
                })).
              end().
            end().
            start('td').
              style({'vertical-align': 'top'}).
              start(this.DocBorder, {title: 'Axiom Definition'}).
                add(this.slot(function (axiom) { return axiom && foam.u2.DetailView.create({data: axiom.axiom}); })).
              end().
            end().
            start('td').
              style({'vertical-align': 'top'}).
              start(this.DocBorder, {title: 'Enum values'}).
                add(this.slot(function(selectedClass) {
                  if ( ! selectedClass ) return '';
                  return this.ClassDocViewEnumValue.create({data: selectedClass});
                  })).
              end().
            end().
            start('td').
              style({'vertical-align': 'top'}).
              tag(this.ClassList, {title: 'Sub-Classes', data$: this.subClasses$}).
            end().
            start('td').
              style({'vertical-align': 'top'}).
              tag(this.ClassList, {title: 'Required-By', data$: this.requiredByClasses$}).
            end().
            start('td').
              style({'vertical-align': 'top'}).
              tag(this.ClassList, {title: 'Relationships', data$: this.relationshipClasses$}).
            end().
          end().
        end();
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'DocBrowserWindow',

  requires: [
    'foam.core.Window',
    'foam.doc.DocBrowser'
  ],

  imports: [ 'window' ],

  properties: [
    'initialClass'
  ],

  methods: [
    function init() {
      // TODO: There should be some helper support to make this easier
      var w = this.window.open('', '', 'width=700, heigh=1000');
      var window = foam.core.Window.create({window: w});
      var browser = this.DocBrowser.create({path: this.initialClass}, window.__subContext__);
      w.document.body.insertAdjacentHTML('beforeend', browser.outerHTML);
      browser.load();
    }
  ]
});


foam.debug.doc = function(opt_obj, showUnused) {
  if ( showUnused ) {
    for ( var key in foam.UNUSED ) foam.lookup(key);
  }

  return foam.doc.DocBrowserWindow.create({
    initialClass: foam.core.FObject.isSubClass(opt_obj) ?
      opt_obj.id :
      ( opt_obj && opt_obj.cls_ ) ? opt_obj.cls_.id :
      'foam.core.FObject' });
};


// TODO:
//    remove LinkView


foam.CLASS({
  package: 'foam.doc',
  name: 'UMLDiagram',
  extends: 'foam.u2.Element',

  imports: [
    'browserPath' ,
    'conventionalUML'
  ],

  requires: [
    'foam.doc.ClassLink',
    'foam.doc.DocBorder',
    'foam.doc.Link',
    'foam.graphics.Box',
    'foam.graphics.Label',
    'foam.graphics.Transform',
    'foam.u2.PopupView'
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR:   'white',
    UNSELECTED_COLOR: '#FFFFCC'
  },

  css: `
    ^ {
      width: 1200px;
      margin: 20px;
    }

    ^ canvas {
      border: 1px solid black;
    }

    ^ .foam-u2-ActionView- {
      margin: 10px;
    }

    ^ input[type='range'] {
      width: 400px;
    }
 `,

  properties: [
    'feedback_',
    {
      name: 'selected',
      postSet: function(o, n) {
        if (o) o.color = this.UNSELECTED_COLOR;
        if (n) n.color = this.SELECTED_COLOR;
      }
    },
    {
      name: 'height',
      value: 800,
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          width: 1200,
          height: this.height,
          color: '#f3f3f3'
        });
      }
    },
    {
      class: 'String',
      name: 'className',
      value: 'className'
    },
    {
      name: 'elementMap'
    },
    {
      class: 'String',
      name: 'prop',
      value: 'propName'
    },
    {
      name: 'triangleSize',
      value: 5
    },
    {
      name: 'dashedstep',
      value: 10
    },
    {
      name: 'properties',
      value: 0
    },
    {
      name: 'widthCenterModel',
      value: 350
    },
    {
      name: 'widthRequiredBox',
      value: 300,
      documentation: 'the default size of required box.',
    },
    {
      name: 'widthExtendsBox',
      value: 200
    },
    'data',
    {
      name: 'canvasHeightExtension',
      value: 0
    },
    //To avoid the overlap between different element.
    {
      name: 'lastRequireY',
      value: 0,
      documentation: 'the y of the last require element draw in the canvas.',
    },
    {
      name: 'lastRequiredByY',
      value: 0,
      documentation: 'the y of the last required by element draw in the canvas.',
    },
    {
      name: 'lastRelatedFromY',
      value: 0,
      documentation: 'the y of the last required from element draw in the canvas.',
    },
    {
      name: 'lastRelatedToY',
      value: 0,
      documentation: 'the y of the last required to element draw in the canvas.',
    }
  ],

  methods: [
    function initE() {
      var data = this.data;
      var nbrOfPropInNonConventionalDiag = 5;
      var propertyHeight = 20;
      this.className  = this.data.name;
      this.elementMap = new Map();
      this.properties = this.getAllProperties( data );

      this.canvas.height = this.conventionalUML && this.properties.length >= 15 ? this.properties.length * 30 + this.height : this.height;

      var heightCenterBox = (this.conventionalUML ? this.properties.length : nbrOfPropInNonConventionalDiag) * propertyHeight;
      this.addModel(this.canvas.width / 2 - this.widthCenterModel / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox , this.widthCenterModel);
      this.addExtends(this.canvas.width / 2 - this.widthExtendsBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      this.addImplements(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      this.addRequires(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      this.addRequiredBy(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      /*this.addImports(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?2.5:1.5) - heightCenterBox );
      this.addExports(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?2.5:1.5) - heightCenterBox );*/
      this.addRelatedto(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      this.addRelatedFrom(this.canvas.width / 2 - this.widthRequiredBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );
      this.addSubClasses(this.canvas.width / 2 - this.widthExtendsBox / 2, this.canvas.height / (this.conventionalUML?1.5:1.5) - heightCenterBox );

      this.canvas.height = this.canvasHeightExtension >= this.canvas.height ? this.canvasHeightExtension: this.canvas.height;

      this.addLegend();

      this
        .addClass(this.myClass())
        .start('center')
          .tag('br')
          .start(this.canvas)
            .on('click', this.onClick)
          .end()
        .end();
    },

    function sign(ex, sx) {
      if ( ex - sx > 0 ) return 1;
      if ( ex - sx < 0 ) return -1;
      return 0;
    },

    function triangle(ptX, ptY, ang) {
      return foam.graphics.Polygon.create({
        xCoordinates: [ ptX + this.triangleSize * Math.sin(ang), ptX + this.triangleSize * Math.cos(ang), ptX - this.triangleSize * Math.cos(ang), ptX + this.triangleSize * Math.sin(ang) ],
        yCoordinates: [ ptY, ptY + this.triangleSize * Math.sin(ang) + this.triangleSize * Math.cos(ang), ptY - this.triangleSize * Math.sin(ang) + this.triangleSize * Math.cos(ang), ptY ],
        color: 'black'
      });
    },

    function addLegend(x, y, w, h) {
      var startX = 180;
      var startY = 20;
      var d      = 120;

      var marge = 4;
      var cls = this.data;
      var legendBox = this.Box.create({
        x: x || 0,
        y: y || 0,
        width: w || 350,
        height: h || 160,
        color: '#ffffff' || this.UNSELECTED_COLOR,
        border: 'black'
      });

      var legendLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 75,
        y: y - marge || 0,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Legend'
      });

      var ExtendsNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y || startY,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Extends'
      });

      var extendsLinkLine = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 2,
        endX: x + 530 || startX + d,
        endY: y + 530 || startY * 2,
        color: 'black',
        lineWidth: 2
      });

      var triangleEnd = this.triangle( extendsLinkLine.endX, extendsLinkLine.endY, Math.PI / 2 );

      this.selected = this.canvas.add( legendBox, legendLabel, extendsLinkLine, triangleEnd, ExtendsNameLabel );

      var dashedLine = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 3,
        endX: x + 530 || startX + d,
        endY: y + 530 + this.triangleSize || startY * 3,
        color: 'black',
        lineWidth: 2,
        lineDash: [ 10, 20 ]
      });

      var triangleEndImplement = this.triangle( startX + d, startY * 3, Math.PI / 2 );

      var ImplementNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y - marge || startY * 2,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Implement'
      });

      this.selected = this.canvas.add( ImplementNameLabel, triangleEndImplement, dashedLine );

      var requiredLine = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 4,
        endX: x + 530 || startX + d,
        endY: y + 530 + this.triangleSize || startY * 4,
        color: 'black',
        lineWidth: 2
      });

      var requiredConnectorEnd = foam.graphics.Circle.create({
        x: requiredLine.endX,
        y: requiredLine.endY,
        radius: marge,
        border: 'black',
        color: 'white'
      });

      var requiredNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y - marge || startY * 4,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Required By'
      });

      this.selected = this.canvas.add( requiredLine, requiredConnectorEnd, requiredNameLabel );

      requiresLink = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 5,
        endX: x + 530 || startX + d,
        endY: y + 530 || startY * 5,
        color: 'black',
        lineWidth: 2
      });

      var requiresConnectorCircle = foam.graphics.Circle.create({
        x: requiresLink.endX,
        y: requiresLink.endY,
        start: Math.PI / 2,
        end: -Math.PI / 2,
        radius: marge,
        border: 'black',
        color: 'white'
      });

      var RequiresNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y - marge || startY * 3,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Requires'
      });
      this.selected = this.canvas.add( requiresLink, requiresConnectorCircle, RequiresNameLabel );

      var RelatedToNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y || startY * 5,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Related To'
      });

      var RelatedToLinkLine = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 6,
        endX: x + 530 || startX + d,
        endY: y + 530 || startY * 6,
        color: 'black',
        lineWidth: 2
      });
      var arrowRelatedto = this.arrowEnd( RelatedToLinkLine.endX, RelatedToLinkLine.endY, 3 * Math.PI / 2 );
      this.selected = this.canvas.add( RelatedToNameLabel, RelatedToLinkLine, arrowRelatedto );

      var RelatedFromNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x || 0,
        y: y || startY * 6,
        color: 'black',
        font: '20px Arial',
        width: w || 200,
        height: h || 30,
        text: 'Related From'
      });

      var RelatedFromLinkLine = foam.graphics.Line.create({
        startX: x - 510 || startX,
        startY: y - 570 || startY * 7,
        endX: x + 530 || startX + d,
        endY: y + 530 || startY * 7,
        color: 'black',
        lineWidth: 2
      });
      var arrowRelatedFrom = this.arrowEnd( RelatedFromLinkLine.startX, RelatedFromLinkLine.startY, Math.PI / 2 );

      this.selected = this.canvas.add( RelatedFromNameLabel, RelatedFromLinkLine, arrowRelatedFrom );
    },

    function addModel(x, y, w, h) {
      var marge = 5;
      var step = 30;
      var defaultWidth = 300;
      var cls  = this.data;
      var modelBox = this.Box.create({
        x: x,
        y: y,
        width: w || defaultWidth,
        height: h || 30,
        color: '#ffffff', //this.UNSELECTED_COLOR
        border: 'black'
      });

      var modelNameLabel = foam.graphics.Label.create({
        align: 'center',
        x: x,
        y: y - marge,
        color: 'black',
        font: '20px Arial',
        width: w || defaultWidth,
        height: h || 30,
        text: this.className
      });

      var propertyBox = this.Box.create({
        x: x,
        y: y + step,
        width: w || defaultWidth,
        height: h || this.conventionalUML ? step * this.properties.length : step * 5,
        color: '#ffffff', //this.UNSELECTED_COLOR
        border: 'black'
      });

      this.selected = this.canvas.add( modelBox, modelNameLabel, propertyBox );
      var propertyPadding = - this.widthCenterModel +10;

      if ( ! this.conventionalUML ){
         var propertyNameLabel = foam.graphics.Label.create({
          align: 'left',
          x: x + propertyPadding,
          y: y + step,
          color: 'black',
          font: '22px Arial',//Arial monospace
          width: w || defaultWidth,
          height: h || 30,
          text: 'Properties:    ' + ( cls.model_.properties !== undefined ? cls.model_.properties.length : 0 )
        });

        var methodsNameLabel = foam.graphics.Label.create({
          align: 'left',
          x: x + propertyPadding,
          y: y + step * 2,
          color: 'black',
          font: '22px Arial',
          width: w || 200,
          height: h || 30,
          text:  'Methods:      '+ ( cls.model_.methods !== undefined ? cls.model_.methods.length : 0 )
        });

        var actionsNameLabel = foam.graphics.Label.create({
          align: 'left',
          x: x + propertyPadding,
          y: y + step * 3,
          color: 'black',
          font: '22px Arial',
          width: w || 200,
          height: h || 30,
          text: 'Action:          '+ ( cls.getAxiomsByClass(foam.core.Action) !== undefined ? cls.getAxiomsByClass(foam.core.Action).length : 0 )
        });

        var listenersNameLabel = foam.graphics.Label.create({
          align: 'left',
          x: x + propertyPadding,
          y: y + step * 4,
          color: 'black',
          font: '22px Arial',
          width: w || 200,
          height: h || 30,
          text: 'Listener:       ' + ( cls.getAxiomsByClass(foam.core.Listener) !== undefined ?  cls.getAxiomsByClass(foam.core.Listener).length : 0 )
        });

        var RelationshipNameLabel = foam.graphics.Label.create({
          align: 'left',
          x: x + propertyPadding,
          y: y + step * 5,
          color: 'black',
          font: '22px Arial',
          width: w || 200,
          height: h || 30,
          text: 'Relationship:' + ( cls.getAxiomsByClass(foam.dao.Relationship) !== undefined ?  cls.getAxiomsByClass(foam.dao.Relationship).length : 0 )
        });

        this.selected = this.canvas.add( propertyNameLabel, methodsNameLabel, actionsNameLabel, listenersNameLabel,RelationshipNameLabel );
      } else {
        for ( var i in this.properties ) {
           var methodsNameLabel = foam.graphics.Label.create({
                  x: x+10 ,
                  y: y + step + step * (i) ,
                  color: 'black',
                  font: '20px Arial',
                  width: w || 200,
                  height: h || 30,
                  text: this.properties[i].name + ' : ' + this.properties[i].cls_.name
                });
            this.selected = this.canvas.add( methodsNameLabel );
        }
      }
    },

    function getAllProperties(data) {
      var prop=[];
      for ( var key in data.axiomMap_ ) {
        if ( Object.hasOwnProperty.call(data.axiomMap_, key) ) {
          var a  = data.axiomMap_[key];
          if ( foam.core.Property.isInstance( a ) ) {
            prop.push(a);
          }
        }
      }
      return prop;
    },

    function setData(mapDataX, mapDataY, cls) {
      this.elementMap.set({
        x: mapDataX,
        y: mapDataY
      }, cls);
    },

    function addExtends(x, y, w, h) {
      var marge = 5;
      var d     = 90;
      var cls   = this.data;

      for ( var i = 0; cls; i++ ) {
        cls = foam.lookup( cls.model_.extends, true );
        if ( cls === foam.core.FObject ) break;
        var extendsBox = this.Box.create({
          x: x,
          y: y - ((i + 1) * d),
          width: w || 200,
          height: h || 30,
          color: '#ffffff', //this.UNSELECTED_COLOR
          border: 'black'
        });

        this.setData( extendsBox.x, extendsBox.y, cls.id );

        var extendsNameLabel = foam.graphics.Label.create({
          align: 'center',
          x: x,
          y: y - ((i + 1) * d) - marge,
          color: 'black',
          font: '20px Arial',
          width: w || 200,
          height: h || 30,
          text: cls.name
        });

        var extendsLine = foam.graphics.Line.create({
          startX: x + extendsBox.width / 2 || 0,
          startY: y - (d * i),
          endX: x + extendsBox.width / 2 || 0,
          endY: y - (d * i) - (extendsBox.height * 2) + this.triangleSize,
          color: 'black',
          lineWidth: 2
        });

        var triangleEndExtends = this.triangle( x + extendsBox.width / 2, y - (d * i) - (extendsBox.height * 2), 0 );

        this.selected = this.canvas.add( extendsBox, extendsNameLabel, extendsLine, triangleEndExtends );

        this.setData( extendsBox.x, extendsBox.y, cls.id );

        //if ( cls === foam.core.FObject ) break;
      }
    },

    function addImplements(x, y, w, h) {
      var marge = 5;
      var sideY = 150; //d
      var sideX = -400;
      var cls   = this.data;

      if ( cls.model_.implements !== undefined ) {
        for ( var key in cls.model_.implements ) {
          var a = cls.model_.implements[key];
          if ( a.path !== undefined ) {
            var implementsName = this.Box.create({
              x: x - sideX,
              y: y - sideY - key * 45,
              width: w || this.widthRequiredBox,
              height: h || 30,
              color: '#ffffff', //this.UNSELECTED_COLOR
              border: 'black'
            });

            this.setData( implementsName.x, implementsName.y, a.path );

            var implementsNameLabel = foam.graphics.Label.create({
              align: 'center',
              x: x - sideX + this.dashedstep,
              y: y - sideY - marge - key * 45,
              color: 'black',
              font: '20px Arial',
              width: w || this.widthRequiredBox,
              height: h || 30,
              text: eval(a.path).name
            });

            var dashedLine = foam.graphics.Line.create({
              startX: x +200,
              startY: y,
              endX: implementsName.x,
              endY: implementsName.y,
              color: 'black',
              lineWidth: 2,
              lineDash: [ 10, 20 ]
            });

            var triangleEndImplement = this.triangle( implementsName.x, implementsName.y, 0 );

            this.selected = this.canvas.add( implementsName, implementsNameLabel, triangleEndImplement , dashedLine );
          }
        }
      }
    },

    function addRequiredBy(x, y, w, h) {
      var triangleSize = 5;
      var marge = 5;
      var d = 400;
      var cls = this.data;
      if ( cls.model_.requires !== undefined ) {
        for ( var key in cls.model_.requires ) {
          var a = cls.model_.requires[key];
          var requiresByName = this.Box.create({
            x: x + d,
            y: y + triangleSize * (key + 0),
            width: w || this.widthRequiredBox,
            height: h || 30,
            color: '#ffffff', //this.UNSELECTED_COLOR
            border: 'black'
          });

          this.setData(requiresByName.x, requiresByName.y,  a.path);

          var requiresByNameLabel = foam.graphics.Label.create({
            align: 'center',
            x: x + d,
            y: y + triangleSize * (key + 0) - marge,
            color: 'black',
            font: '20px Arial',
            width: w || this.widthRequiredBox,
            height: h || 30,
            text: a.name
          });

          var requiresByLine = foam.graphics.Line.create({
            startX: x + this.widthCenterModel-( this.widthCenterModel - requiresByName.width ) / 2 || 0,
            startY: y + requiresByName.height / 2 || 0,
            endX: x + d || 0,
            endY: y + triangleSize * (key + 0) + requiresByName.height / 2 || 0,
            color: 'black',
            lineWidth: 2
          });

          var requiresByConnectorCircle = foam.graphics.Circle.create({
            x: x + d,
            y: y + triangleSize * (key + 0) + requiresByName.height / 2,
            radius: marge,
            border: 'black',
            color: 'white'
          });
          this.selected = this.canvas.add(requiresByLine, requiresByConnectorCircle, requiresByName, requiresByNameLabel);
          this.lastRelatedToY = this.lastRequiredByY = requiresByName.y + ( h || 30 );
        }
      }
    },

    function addRequires(x, y, w, h) {
      var triangleSize = 5;
      var marge = 5;
      var d = 400;
      var cls = this.data;
      if ( cls !== undefined ) {
        var path = cls.id;
        var req = Object.values(foam.USED).
        filter( function ( cls ) {
          return cls.model_ && cls.model_.requires && cls.model_.requires.map(
            function ( r ) {
              return r.path;
            }).includes(path);
        });

        for ( var key in req ) {
          var a = req[key];
          var requiresName = this.Box.create({
            x: x - d,
            y: y + triangleSize * (key + 0),
            width: w || this.widthRequiredBox,
            height: h || 30,
            color: '#ffffff', //this.UNSELECTED_COLOR
            border: 'black'
          });

          this.setData( requiresName.x, requiresName.y, a.id );

          var requiresNameLabel = foam.graphics.Label.create({
            align: 'center',
            x: x - d,
            y: y + triangleSize * (key + 0) - marge,
            color: 'black',
            font: '20px Arial',
            width: w || this.widthRequiredBox,
            height: h || 30,
            text: a.name
          });

          var requiresLine = foam.graphics.Line.create({
            startX: + x - ( this.widthCenterModel - requiresName.width ) / 2  ,
            startY: y + requiresName.height / 2 || 0,
            endX: x - d + requiresName.width + marge || 0,
            endY: y + triangleSize * (key + 0) + requiresName.height / 2 || 0,
            color: 'black',
            lineWidth: 2
          });
          var requiresConnector = foam.graphics.Circle.create({
            x: x - d + requiresName.width,
            y: y + triangleSize * (key + 0) + requiresName.height / 2,
            radius: marge,
            border: 'black',
            color: 'white'
          });
          this.selected = this.canvas.add( requiresName, requiresNameLabel, requiresLine, requiresConnector );
          this.lastRelatedFromY = this.lastRequireY = requiresName.y + ( h || 30 );
        }
      }
    },

    function addSubClasses(x, y, w, h) {
      var marge = 4;
      var dDefualt = 300 + this.properties.length * 30;
      var d = this.conventionalUML && dDefualt+y > this.lastRelatedFromY && dDefualt+y > this.lastRelatedToY ? dDefualt :
          this.lastRelatedFromY > this.lastRelatedToY ?
            this.lastRelatedFromY > this.height ? this.lastRelatedFromY - 300: 500 :
            this.lastRelatedToY > this.height ? this.lastRelatedToY - 300: 500 ;

      var boxLarge = 35;
      var endPtD = this.conventionalUML ? 30 + this.properties.length * 30 : 180;
      var l = 230;

      var cls = this.data;

      if ( cls !== undefined ) {
        var path = cls.id;
        var req = Object.values(foam.USED).
        filter(function (cls) {
          if ( ! cls.model_ ) return false;
          return cls.model_.extends == path || 'foam.core.' + cls.model_.extends == path;
        }).sort(this.MODEL_COMPARATOR);
      };

      if ( req.length === 0 ) return 0 ;

      var nbr = Math.floor( req.length > 5 ? 5/2 : req.length/2 );// five sub classes by line
      x = x - ( nbr * l );

      for ( var key in req ) {
        var a = req[key];
        var subClassesName = this.Box.create({
          x: x + l * ( key % 5 ),
          y: y + d + ( boxLarge + 20 ) * ( Math.floor( key / 5 ) ),
          width: w || 200,
          height: h || 30,
          color: '#ffffff', //this.UNSELECTED_COLOR
          border: 'black'
        });

        this.setData( subClassesName.x, subClassesName.y, a.id );

        var subClassesNameLabel = foam.graphics.Label.create({
          align: 'center',
          x: x + l * ( key % 5 ),
          y: y + d - marge + ( boxLarge + 20 ) * ( Math.floor ( key / 5 ) ),
          color: 'black',
          font: '20px Arial',
          width: w || 200,
          height: h || 30,
          text: a.name
        });

        var subClassesLine = foam.graphics.Line.create({
          startX: subClassesName.x + subClassesName.width / 2 || 0,
          startY: subClassesName.y - 10 || 0,
          endX: subClassesName.x + subClassesName.width / 2 || 0,
          endY: subClassesName.y || 0,
          color: 'black',
          lineWidth: 2
        });

        if ( req.length - 1 > 8 || ( 4 < key && key < 9) ){ //particular case, to avoid line without object
          var subClassesLineNRow1 = foam.graphics.Line.create({
            startX: subClassesName.x + subClassesName.width / 2 || 0,
            startY: subClassesName.y - 10 || 0,
            endX: subClassesName.x + subClassesName.width / 2 + ( l/2 ) || 0,
            endY: subClassesName.y - 10 || 0,
            color: 'black',
            lineWidth: 2
          });

          var subClassesLineNRow2 = foam.graphics.Line.create({
            startX: subClassesName.x + subClassesName.width / 2 + ( l/2 ) || 0,
            startY: subClassesName.y - 10 || 0,
            endX: subClassesName.x + subClassesName.width / 2 + ( l/2 ) || 0,
            endY: y + d - 10 || 0,
            color: 'black',
            lineWidth: 2
          });

          this.selected = this.canvas.add( subClassesLine, subClassesName, subClassesNameLabel,subClassesLineNRow1, subClassesLineNRow2 );
        }else {
          this.selected = this.canvas.add( subClassesLine, subClassesName, subClassesNameLabel );
        }
      }

      var triangleEndSubClasses = this.triangle( x + subClassesName.width / 2 + ( ( nbr ) * l ), y + endPtD, 0 );

      var subClassesLineV = foam.graphics.Line.create({
        startX: x + subClassesName.width / 2 + ( ( nbr ) * l ) || 0,
        startY: y + endPtD + this.triangleSize || 0,
        endX: x + subClassesName.width / 2 + ( ( nbr ) * l ) || 0,
        endY: y + d - 10 || 0,
        color: 'black',
        lineWidth: 2
      });

      var subClassesLineH = foam.graphics.Line.create({
        startX: x + subClassesName.width / 2 || 0,
        startY: y + d - 10 || 0,
        endX: x + subClassesName.width / 2 + (req.length < 5 && req.length % 2 == 0 ? ( 2* nbr * l  )-l : ( ( 2 * nbr ) * l) ) || 0,
        endY: y + d - 10 || 0,
        color: 'black',
        lineWidth: 2
      });

      this.selected = this.canvas.add( triangleEndSubClasses, subClassesLineV, subClassesLineH );
      if ( subClassesName.y >= this.height && subClassesName.y >= this.canvasHeightExtension ) this.canvasHeightExtension = subClassesName.y + ( ( h || 30 ) * 2 );
    },

    function arrowEnd(ptX, ptY, ang) {
      return foam.graphics.Polygon.create({
        xCoordinates: [ ptX + this.triangleSize * Math.sin(ang) - this.triangleSize * Math.cos(ang), ptX, ptX + this.triangleSize * Math.sin(ang) + this.triangleSize * Math.cos(ang) ],
        yCoordinates: [ ptY + this.triangleSize * Math.sin(ang) + this.triangleSize * Math.cos(ang), ptY, ptY - this.triangleSize * Math.sin(ang) + this.triangleSize * Math.cos(ang) ],
        color: 'black'
      });
    },

    function addRelatedto(x, y, w, h) {
      var d   = 400;
      var d1  = 200;
      var cls = this.data;
      //just to avoid the overlap
      var path = cls.id;
      var req  = Object.values(foam.USED).
      filter( function ( cls ) {
        return cls.model_ && cls.model_.requires && cls.model_.requires.map(
          function ( r ) {
            return r.path;
          }).includes(path);
      });
      d1 += (req.length * (h || 30)) + 20;
      d1 = this.lastRequiredByY > y ? this.lastRequiredByY - d : y - d1 + 10;

      var targetM =  [];
      var recursiveM ;
      if ( cls.getAxioms( foam.dao.Relationship ) !== undefined ) {
        for ( var key in cls.getAxiomsByClass( foam.dao.Relationship ) ) {
          var a = cls.getAxiomsByClass( foam.dao.Relationship )[ key ];
          if ( a.targetModel === cls.id ) {
            if ( a.targetModel === a.sourceModel ) {
              recursiveM = a;
            } else {
              targetM.push(a);
            }
          }
        }

        var relatedtoline;
        if ( recursiveM !== undefined ) {
            a = recursiveM;
          relatedtoline = foam.graphics.Polygon.create( {
              xCoordinates: [ x, x - 20, x - 20, x + 10, x + 10 ],
              yCoordinates: [ y, y, y - 20, y - 20, y ],
              color: 'black'
          } );

          var arrowRelatedto = this.arrowEnd( x+10, y, Math.PI );
          var cardinalityToNameLabel;
          if ( a.cardinality !== 'undefined' ) {
              cardinalityToNameLabel = foam.graphics.Label.create( {
                align: 'center',
                x: x,
                y: y - 35,
                color: 'black',
                font: '20px Arial',
                text: a.cardinality
              } );
              this.selected = this.canvas.add( relatedtoline, arrowRelatedto, cardinalityToNameLabel );
          } else {
            this.selected = this.canvas.add( relatedtoline, arrowRelatedto );
          }
        }
        if ( targetM !== undefined ) {
          for ( var key in targetM ) {//cls.getAxiomsByClass( foam.dao.Relationship )
            a = targetM[key];
            var relatedtoName = this.Box.create( {
              x: x + d,
              y: y + d1 + 5 * ( key + 1 ),
              width: w || this.widthRequiredBox,
              height: h || 30,
              color: '#ffffff', //this.UNSELECTED_COLOR
              border: 'black'
            } );
            this.setData( relatedtoName.x, relatedtoName.y, a.sourceModel );
            var relatedtoNameLabel = foam.graphics.Label.create( {
              align: 'center',
              x: x + d,
              y: y + d1 + 5 * ( key + 1 ),
              color: 'black',
              font: '20px Arial',
              width: w || this.widthRequiredBox,
              height: h || 30,
              text: eval( a.sourceModel ).name
            } );
            relatedtoline = foam.graphics.Line.create( {
              startX: x + this.widthCenterModel-( this.widthCenterModel - relatedtoName.width ) / 2 || 0,
              startY: y + relatedtoName.height || 0,
              endX: x + d || 0,
              endY: y + d1 + 5 * ( key + 1 ) + relatedtoName.height * 1 / 3 || 0,
              color: 'black',
              lineWidth: 2
            } );
            var arrowRelatedto = this.arrowEnd( relatedtoline.endX, relatedtoline.endY, Math.PI );
            var cardinalityToNameLabel;
            if ( a.cardinality !== 'undefined' ) {
              cardinalityToNameLabel = foam.graphics.Label.create( {
                align: 'center',
                x: relatedtoline.endX - relatedtoName.width / 2 - 25,
                y: relatedtoline.endY - relatedtoName.height * 1 / 3,
                color: 'black',
                font: '20px Arial',
                width: w || this.widthRequiredBox,
                height: h || 30,
                text: a.cardinality
              } );
              this.selected = this.canvas.add( relatedtoName, relatedtoNameLabel, relatedtoline, arrowRelatedto, cardinalityToNameLabel );
            } else {
              this.selected = this.canvas.add( relatedtoName, relatedtoNameLabel, relatedtoline, arrowRelatedto );
            }
            if ( relatedtoName.y >= this.height && relatedtoName.y >= this.canvasHeightExtension ) {
              this.canvasHeightExtension = relatedtoName.y + (( h || 30 ) * 2 );
              if ( this.lastRelatedFromY < relatedtoName.y ) this.lastRelatedToY = relatedtoName.y;
            }
          }
        }
      }
    },

    function addRelatedFrom(x, y, w, h) {
      var marge = 45;
      var d     = -400;
      var d1    = 160;
      var cls   = this.data;
      var axeX  = x + d;
      //just to avoid the overlap????
      var path  = cls.id;
      var req   = Object.values(foam.USED).
      filter( function ( cls ) {
        return cls.model_ && cls.model_.requires && cls.model_.requires.map(
          function ( r ) {
            return r.path;
          }).includes(path);
      });

      d1 += (req.length * (h || 30)) +20;
      var axeY = this.lastRequireY > y ? this.lastRequireY  : y + d1 ;

      var targetM =  [];
      var recursiveM ;
      var relatedtoline;

      if ( cls.getAxioms( foam.dao.Relationship ) !== undefined ) {
        for ( var key in cls.getAxiomsByClass( foam.dao.Relationship ) ) {
          var a = cls.getAxiomsByClass( foam.dao.Relationship )[ key ];
          if ( a.sourceModel === cls.id ) {
            if ( a.targetModel === a.sourceModel ) {
              recursiveM = a;
            } else {
              targetM.push(a);
            }
          }
        }

        if ( recursiveM !== undefined ) {
          a = recursiveM;
          relatedtoline = foam.graphics.Polygon.create({
            xCoordinates: [ x, x - 20, x - 20, x + 10, x + 10 ],
            yCoordinates: [ y, y, y - 20, y - 20, y ],
            color: 'black'
          });

          var arrowRelatedto = this.arrowEnd( x+10, y, Math.PI );
          var cardinalityToNameLabel;
          if ( a.cardinality !== 'undefined' ) {
              cardinalityToNameLabel = foam.graphics.Label.create( {
                align: 'center',
                x: x,
                y: y - 35,
                color: 'black',
                font: '20px Arial',
                text: a.cardinality
              } );
              this.selected = this.canvas.add( relatedtoline, arrowRelatedto, cardinalityToNameLabel );
          } else {
            this.selected = this.canvas.add( relatedtoline, arrowRelatedto );
          }
        }

        if ( targetM !== undefined ) {
          for ( var key in targetM ) {
            a = targetM[key];
            axeY = axeY + marge;
            var RelatedFromName = foam.graphics.Box.create( {
                x: axeX,
                y: axeY,
                width: w || this.widthRequiredBox,
                height: h || 30,
                color: '#ffffff', // this.UNSELECTED_COLOR
                border: 'black'
            } );
            this.setData( RelatedFromName.x, RelatedFromName.y, a.targetModel );
            var RelatedFromNameLabel = foam.graphics.Label.create( {
                align: 'center',
                x: axeX,
                y: axeY,
                color: 'black',
                font: '20px Arial',
                width: w || this.widthRequiredBox,
                height: h || 30,
                text: eval( a.targetModel ).name
            } );
            RelatedFromLine = foam.graphics.Line.create( {
                startX:+ x - ( this.widthCenterModel - RelatedFromName.width ) / 2  ,
                startY: y + RelatedFromName.height || 0,
                endX: axeX + RelatedFromName.width || 0,
                endY: axeY + RelatedFromName.height / 2 || 0,
                color: 'black',
                lineWidth: 2
            } );
            var arrowRelatedFrom = this.arrowEnd( RelatedFromLine.startX, RelatedFromLine.startY, 0 );
            var cardinalityFromNameLabel;
            if ( a.cardinality !== 'undefined' ) {
              cardinalityFromNameLabel = foam.graphics.Label.create( {
                align: 'center',
                x: RelatedFromLine.endX - RelatedFromName.width / 2 + 25,
                y: RelatedFromLine.endY - RelatedFromName.height / 2,
                color: 'black',
                font: '20px Arial',
                width: w || this.widthRequiredBox,
                height: h || 30,
                text: a.cardinality
              } );
              this.selected = this.canvas.add( RelatedFromName, RelatedFromNameLabel, RelatedFromLine, arrowRelatedFrom, cardinalityFromNameLabel );
            } else {
              this.selected = this.canvas.add( RelatedFromName, RelatedFromNameLabel, RelatedFromLine, arrowRelatedFrom );
            }
            if ( RelatedFromName.y >= this.height && RelatedFromName.y >= this.canvasHeightExtension ) {
              this.canvasHeightExtension = axeY + ( ( h || 30 ) * 3 );
            }
            if ( this.lastRelatedFromY < axeY ) this.lastRelatedFromY = axeY;
          }
        }
      }
    },

    //************** not supported yet **************************

    function addExports(x, y, w, h) {
      var d   = 100;
      var cls = this.data;
      if ( cls.model_.exports !== undefined ) {
        for ( var key in cls.model_.exports ) {
          var a = cls.model_.exports[key];
          var exportsName = this.Box.create({
            x: x + d,
            y: y + 5 * (key + 1),
            width: w || 200,
            height: h || 30,
            color: '#ffffff', //this.UNSELECTED_COLOR
            border: 'black'
          });

          this.setData(exportsName.x, exportsName.y, a.id);

          var exportsNameLabel = foam.graphics.Label.create({
            align: 'center',
            x: x + d,
            y: y + 5 * (key + 1),
            color: 'black',
            font: '20px Arial',
            width: w || 200,
            height: h || 30,
            text: a.name
          });

          exportsLine = foam.graphics.Line.create({
            startX: x + exportsName.width / 2 || 0,
            startY: y || 0,
            endX: x + exportsName.width / 2 || 0,
            endY: y - d + exportsName.height || 0,
            color: 'black',
            lineWidth: 2
          });

          this.selected = this.canvas.add( exportsName, exportsNameLabel ); // TODO add the link
        }
      }
    },

    function addImports(x, y, w, h) {
      var d   = 100;
      var cls = this.data;
      if ( cls.model_.imports !== undefined ) {
        for ( var key in cls.model_.imports ) {
          var a = cls.model_.imports[key];
          var importsName = this.Box.create({
            x: x + d,
            y: y + 5 * (key + 1),
            width: w || 200,
            height: h || 30,
            color: '#ffffff', //this.UNSELECTED_COLOR
            border: 'black'
          });

          var importsNameLabel = foam.graphics.Label.create({
            align: 'center',
            x: x + d,
            y: y + 5 * (key + 1),
            color: 'black',
            font: '20px Arial',
            width: w || 200,
            height: h || 30,
            text: a.name
          });

          importsLine = foam.graphics.Line.create({
            startX: x + importsName.width / 2 || 0,
            startY: y || 0,
            endX: x + importsName.width / 2 || 0,
            endY: y - d + importsName.height || 0,
            color: 'black',
            lineWidth: 2
          });

          this.selected = this.canvas.add( importsName, importsNameLabel ); //TODO add the link
        }
      }
    }
  ],

  listeners: [
    function onClick( evt ) {
      var x  = evt.offsetX;
      var y  = evt.offsetY;
      var c  = this.canvas.findFirstChildAt(x, y);
      var xc = c.instance_.x;
      var yc = c.instance_.y;

      for ( var [key, value] of this.elementMap.entries() ) {
        if ( key.x === xc && key.y === yc ) {
          this.browserPath$.set(value);
          evt.preventDefault();
        }
      }
    }
  ]
});

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'PropertiesToUpdateView',
  extends: 'foam.u2.View',

  imports: [
    'ctrl'
  ],

  documentation: `Map objects view: Map = propObject,
  each propObject's [key value] pair is stored on propObject,
  where each key represents the property name, and
  where each corresponding value is well property value.
  
  has a max size container that adjusts to overflow scroll, with more properties.
  if propObject.value is an FObject/Object, view goes only one layer in to display `,

  css: `
    ^ .titleClass {
      text-align: center;
    }
    ^ .titlePosition {
      padding: 1%;
    }
    ^ .valueProperty {
      text-align: left;
      display: inline-flex;
      margin-left: 3vw;
    }
    ^ .nameProperty {
      text-align: left;
      margin-left: 2vw;
      margin-right: 0.5vw;
    }
    ^ .containerFixed {
      height: 65%;
      position:relative;
    }
    ^ .boxBackground {
      width: 80vw;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      margin-left: 1vw;
      z-index: -1;
      overflow: scroll;
      max-height: 100%;
    }

    ^ .backPosition {
      float: left;
      margin-left: 1.2vw;
      margin-top: 4vh;
    }

    ^ .upOffsetMargin {
      margin-top: -5px;
    }

  `,
  properties: [
    {
      name: 'objId'
    },
    {
      class: 'String',
      name: 'daoKey',
      postSet: function(o, n) {
        this.locateStoreObj();
      }
    },
    {
      name: 'propObject',
      documentation: 'General obj storing property changes identified in an edit'
    },
    {
      name: 'obj',
      documentation: `This is the dao found obj,
      we want to now look up the obj properties listed (this.propObj).
      Then populate our elementArray with a display for each prop.`,
      postSet: function(o, n) {
       if ( n ) this.defaultView = false;
        // Making the view per property change based on whether
        // class of prop is an FObjectProperty or
        // if has tableCellFormatter available
        // otherwise just adds the value if all else fails
        const addElement = (objValue, objProp, name, fromValue, byPass) => {
          let changingValue;
          let currentValue;
          if ( objProp ) {
            if ( objProp.FObjectPropertyView && ! byPass ) {
              changingValue = this.E().startContext({ data: n, controllerMode: foam.u2.ControllerMode.VIEW }).start(objProp, { data: objValue }).end().endContext();
              currentValue = this.E().startContext({ data: n, controllerMode: foam.u2.ControllerMode.VIEW }).start(objProp).end().endContext();
            } else if ( objProp.tableCellFormatter ) {
              changingValue = this.E().callOn(objProp.tableCellFormatter, 'format', [objValue, n, objProp]);
              currentValue = this.E().callOn(objProp.tableCellFormatter, 'format', [fromValue, n, objProp]);
            } else {
              changingValue = this.E().add(objValue);
              currentValue = this.E().add(fromValue);
            }
          } else {
            return;
          }
          this.elementArray.push({
            value: changingValue,
            fromValue: currentValue,
            name: objProp && objProp.label ? objProp.label : this.userReadPropTypeName(name)
          });
        };

        var sizeOfContainer = 0;
        var index = 0;
        for ( prop in this.propObject ) {
          if ( prop ) {
            let constNameConvention = (prop.split(/(?=[A-Z])/).join('_')).toUpperCase();
            let objProp = n[constNameConvention];
            let byPass = false;
            if ( objProp ) {
              // Checks for specific Property features,
              // Address is an FObjectProperty that we want tableCellFormatter for ... however all else we want FObjectView
              if ( objProp.of && objProp.of.id === 'foam.nanos.auth.Address' ) byPass = true;
              if ( objProp.hidden ) continue;
              if ( objProp.visibility && objProp.visibility.name === 'HIDDEN' ) continue;
              if ( objProp.transient || objProp.networkTransient || objProp.storageTransient ) continue;
            }
            addElement(this.propObject[prop], objProp, this.userReadPropTypeName(prop), n[prop], byPass);
            if ( objProp && objProp.FObjectPropertyView && ! byPass ) {
              this.upOffset.push(index);
              sizeOfContainer += 20;
            }
            sizeOfContainer += 72;
            index++;
          }
        }
        this.containerHeight_ = `${sizeOfContainer}px`;
      }
    },
    {
      class: 'Array',
      name: 'elementArray',
      documentation: 'List of elements per property changes (in this.propObject)'
    },
    {
      class: 'Array',
      name: 'upOffset',
      documentation: 'Array that stores an index of FObjects in our elementArray. For css style.'
    },
    {
      class: 'String',
      name: 'title',
    },
    {
      class: 'String',
      name: 'subTitle',
      expression: function(obj, objId) {
        let fullTitle = () => ` ${this.userReadPropTypeName(obj.cls_.name)} : ${objId}`;
        return 'Changing' + (obj ? fullTitle() : ` object with ID: ${objId}`);
      }
    },
    {
      class: 'String',
      name: 'containerHeight_',
      value: '0%'
    },
    {
      class: 'Array',
      name: 'propList_',
      documentation: 'Used as backup if obj not found.'
    },
    {
      class: 'Boolean',
      name: 'defaultView'
    }
  ],

  methods: [
    function userReadPropTypeName(str) {
      let s = str.split(/(?=[A-Z])/).join(' ');
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    function locateStoreObj() {
      var d = this.daoKey.replace('local', ''); // since client cant find local anything
      d = d.charAt(0).toLowerCase() + d.substring(1); // confirm syntaxStandard with lowerCase first letter;
      this.ctrl.__subContext__[d].find(this.objId)
        .then((ob) => this.obj = ob)
        .catch((e) => {
          console.warn(`error reading obj id: ${e}`);
          this.defaultNoFormattingIfNoObjFound();
          this.defaultView = true;
        });
    },
    function defaultNoFormattingIfNoObjFound() {
      var sizeOfContainer = 0;
      var capitalize = (s) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
      };
      for ( prop in this.propObject ) {
        if ( prop ) {
          let propName = capitalize(prop.split(/(?=[A-Z])/).join(' '));
          if ( typeof this.propObject[prop] === 'string' ) {
            this.propList_.push({ name: propName, value: this.propObject[prop] });
            sizeOfContainer += 50;
          } else {
            if ( this.propObject[prop].instance_ ) {
              for ( nestedProp in this.propObject[prop].instance_ ) {
                if ( nestedProp ) {
                  let nestedPropName = capitalize(nestedProp.split(/(?=[A-Z])/).join(' '));
                  this.propList_.push({ name: `${propName} -> ${nestedPropName}`, value: this.propObject[prop][nestedProp] });
                  sizeOfContainer += 50;
                }
              }
            } else {
              this.propList_.push({ name: propName, value: this.propObject[prop] });
              sizeOfContainer += 50;
            }
          }
        }
      };
      this.containerHeight_ = `${sizeOfContainer}px`;
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
      .start().addClass('titleClass')
        .start().addClass('backPosition')
          .tag(this.BACK, {
            buttonStyle: foam.u2.ButtonStyle.TERTIARY,
            icon: 'images/back-icon.svg'
          })
        .end()
        .start('h1').addClass('titlePosition')
          .add(this.title)
        .end()
        .start('h3').addClass('titlePosition')
          .add(this.slot((obj) => this.E().add(this.subTitle)))
        .end()
      .end()
      .start().addClass('containerFixed')
        .start().addClass('boxBackground').add(this.slot((obj, defaultView) => {
          var index = -1;
          return defaultView ?
          this.E().start().style({ 'height': this.containerHeight_ })
            .add(this.propList_.map((p) => {
              return this.E()
                .start('h3').add(p.name).add(':').addClass('nameProperty').end()
                .start().add(p.value).addClass('valueProperty').end()
              .br();
            }))
          .end()
          :
          this.E().start().style({ 'height': this.containerHeight_ })
              .add(this.elementArray.map((p) => {
                index++;
                return this.E()
                  .start('h3').add(p.name).add(':').addClass('nameProperty').end()
                  .start('span').addClass('valueProperty')
                    .start('strong').add('from:').style({ 'margin-right': '5px' }).end()
                    .start()
                      .add(p.fromValue)
                      .enableClass('upOffsetMargin', this.slot((upOffset) => {
                        var isFobject = false;
                        upOffset.forEach((ind) => {
                          if ( ind === index ) isFobject = true;
                        });
                        return isFobject;
                      }))
                      .end()
                    .start('strong').add('⇨').style({ 'margin-right': '20px', 'margin-left': '20px' }).end()
                    .start('strong').add('to:').style({ 'margin-right': '5px' }).end()
                    .start()
                      .add(p.value)
                      .enableClass('upOffsetMargin', this.slot((upOffset) => {
                        var isFobject = false;
                        upOffset.forEach((ind) => {
                          if ( ind === index ) isFobject = true;
                        });
                        return isFobject;
                      }))
                    .end()
                  .end()
                .br();
              }));
          }))
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'back',
      code: function(x) {
        x.stack.back();
      }
    }
  ]
});

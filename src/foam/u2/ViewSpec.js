/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'ViewSpec',
  extends: 'foam.core.Property',

  documentation: `
    Set a ViewFactory to be a string containing a class name,
    a Class object, or a factory function(args, context).
    Useful for rowViews and similar.`
  ,

  axioms: [
    {
      installInClass: function(cls) {
        cls.createView = function(spec, args, self, ctx, disableWarning) {
          if ( foam.core.FObject.isInstance(ctx) ) {
            ctx = ctx.__subContext__;
          }

          if ( foam.u2.Element.isInstance(spec) ) {
            if ( foam.debug && ! disableWarning ) {
              console.warn('Warning: Use of literal View as ViewSpec: ', spec.cls_.id);
            }
            return spec.copyFrom(args);
          }

          if ( foam.core.Slot.isInstance(spec) )
            return spec;

          if ( spec && spec.toE )
            return spec.toE(args, ctx);

          if ( foam.Function.isInstance(spec) )
            return foam.u2.ViewSpec.createView(spec.call(self, args, ctx, true), args, self, ctx, true);

          if ( foam.Object.isInstance(spec) ) {
            var ret;

            if ( spec.create ) {
              ret = spec.create(args, ctx);
            } else {
              var cls = foam.core.FObject.isSubClass(spec.class) ? spec.class : ctx.lookup(spec.class);
              if ( ! cls ) foam.assert(false, 'ViewSpec specifies unknown class: ', spec.class);
              ret = cls.create(spec, ctx).copyFrom(args || {});
              // test case
//              foam.language = 'fr-CA';
//              foam.language = 'fr-FR';
             foam.language = 'fr';// for test
              if ( ctx.XLIFFTranslation &&
                   ( foam.language == ctx.XLIFFTranslation.locale_variant ||
                     foam.language.substring(0, foam.language.indexOf('-')) == ctx.XLIFFTranslation.locale_variant.substring(0, foam.language.indexOf('-'))  ))
              {
                //what is the different between the source and the id
                let axM   = cls.getOwnAxioms().filter( e => e.message_ != null );//just for MESSAGES
                !!axM.length && axM.forEach(ele => {
                  let trsl = ctx.XLIFFTranslation.translationValues.values.find(e => e.source == (ele.sourceCls_.id + '.' + ele.name))//ctx.XLIFFTranslation.translationValues.values.find(e => e.source == ele.private_.contextParent.id+'.'+ele.name );
                  if ( trsl ) {
                    cls[ele.name] = trsl.target;
                  }
                });

                // example foam.nanos.auth.Address.COUNTRY_ID.label = target;
                let axS   = cls.getOwnAxioms().filter( e => e.path != null );//just for slot properties
                !!axS.length && axS.forEach(ele => {
                  eval(ele.path).getOwnAxioms().forEach (prop => {
                    if ( !!prop.name ) {
                      let trsl = ctx.XLIFFTranslation.translationValues.values.find(e => {
                        return e.source.substring(0,e.source.lastIndexOf('.')) == (ele.path + '.' + foam.String.constantize(prop.name))
                      })
                      if ( trsl ) {
                        prop[trsl.source.substring(trsl.source.lastIndexOf('.')+1)] = trsl.target;
                      }
                    }
                  })
                });

                //example net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_
                //[net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS.section].title
                let axP   = cls.getOwnAxioms();//just for slot properties
                !!axP.length && axP.forEach(prop => {
                  if ( prop.name && !!prop.sourceCls_ ) {
                    let res = ctx.XLIFFTranslation.translationValues.values.find(e => {
                      return e.source.substring(0,e.source.lastIndexOf('.')) == (prop.sourceCls_.id + '.' + foam.String.constantize(prop.name)) 
                    })
                    if ( !!res ) { prop[res.source.substring(res.source.lastIndexOf('.')+1)] = res.target; console.log('++++'+res.target)}
                  }
                });


                let axSect   = cls.getOwnAxioms().filter( e => e.path != null );//just for section
                !!axSect.length && axSect.forEach(ele => {
                  eval(ele.path).getOwnAxioms().forEach (prop => {
                    if ( !!prop.name ) {
                      let trsl = ctx.XLIFFTranslation.translationValues.values.find(e => {
                        return e.source.substring(0,e.source.lastIndexOf('.')) == (ele.path + '.SECTION_' + foam.String.constantize(prop.name))
                      })
                      
                      if ( trsl ) {
                        prop[trsl.source.substring(trsl.source.lastIndexOf('.')+1)] = trsl.target;
                      }
                    }
                  })
                });
              }
            }

            foam.assert(
              foam.u2.Element.isInstance(ret) || ret.toE,
              'ViewSpec result must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.core.FObject.isSubClass(spec) ) {
            var ret = spec.create(args, ctx);

            foam.assert(foam.u2.Element.isInstance(ret), 'ViewSpec class must extend foam.u2.Element or be toE()-able.');

            return ret;
          }

          if ( foam.String.isInstance(spec) || spec === undefined || spec === null )
            return foam.u2.Element.create({ nodeName: spec || 'div' }, ctx);

          throw 'Invalid ViewSpec, must provide an Element, Slot, toE()-able, Function, {create: function() {}}, {class: \'name\'}, Class, or String, but received: ' + spec;
        };
      }
    }
  ],

  properties: [
    /* TODO: uncomment this to fix ViewSpecs converting into Views when loading.
    [
      'fromJSON',
      function fromJSON(value, ctx, prop, json) {
        return value;
      }
    ],
    */
    ['view', { class: 'foam.u2.view.MapView' }],
    [ 'adapt', function(_, spec, prop) {
      return foam.String.isInstance(spec) ? { class: spec } : spec ;
    } ],
    [ 'displayWidth', 80 ]
    /*
    [ 'toJSON', function(value) {
      Output as string if 'class' is only defined value.
    } ]
    */
  ]
});

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'AbstractSectionedDetailView',
  extends: 'foam.u2.View',

  documentation: `
    The abstract for property-sheet style Views with sections for editing an FObject.
  `,

  imports: [
    'auth'
  ],

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data',
      factory: function() {
        return this.hasOwnProperty('of') ? this.of.create(null, this) : null;
      },
      postSet: function(oldValue, newValue) {
        this.of = newValue ? newValue.cls_ : undefined;
      }
    },
    {
      class: 'Class',
      name: 'of',
      expression: function(data) {
        return data && data.cls_;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'propertyWhiteList',
      documentation: `
        If this array is not empty, only the properties listed in it will be
        included in the detail view.
      `,
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0; i < ps.length; i++ ) {
          foam.assert(
              foam.core.Property.isInstance(ps[i]),
              `Non-Property in 'properties' list:`,
              ps);
        }
        return ps;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.layout.Section',
      name: 'sections_',
      factory: null,
      expression: function(of) {
        if ( ! of ) return [];

        sections = of.getAxiomsByClass(this.SectionAxiom)
          .sort((a, b) => a.order - b.order)
          .map((a) => this.Section.create().fromSectionAxiom(a, of));

        var usedAxioms = sections
          .map((s) => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});
        var unusedProperties = of.getAxiomsByClass(this.Property)
            .filter((p) => ! usedAxioms[p.name])
            .filter((p) => ! p.hidden);
        var unusedActions = of.getAxiomsByClass(this.Action)
            .filter((a) => ! usedAxioms[a.name]);

            if ( unusedProperties.length || unusedActions.length ) {
          sections.push(this.Section.create({
            properties: unusedProperties,
            actions: unusedActions
          }));
        }

        if ( this.propertyWhitelist ) {
          sections = sections
            .map((s) => {
              s.properties = s.properties.filter((p) => this.propertyWhitelist.includes(p));
              return s;
            })
            .filter((s) => {
              return s.properties.length > 0 || s.actions.length > 0;
            });
        }

        return sections;
      }
    },
    {
      class: 'Boolean',
      name: 'loading',
      documentation: `True while we're calculating 'sections'.`,
      expression: function(outstandingCalculations_) {
        return outstandingCalculations_ > 0;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.layout.Section',
      name: 'sections',
      factory: function() {
        return this.sections_;
      }
    },
    {
      class: 'Long',
      name: 'outstandingCalculations_',
      documentation: 'Used alongside `loading` to hide the view while it is loading'
    },
    {
      class: 'Long',
      name: 'nextQueuePosition_',
      value: 1, // Start at a value greater than 0 so the first one can succeed.
      documentation: 'Used to avoid race conditions where old results can clobber newer results.'
    },
    {
      class: 'Long',
      name: 'queuePositionWhenLastUpdated_',
      documentation: 'Used to avoid race conditions where old results can clobber newer results.'
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.sections_$.sub(this.updateSections));
      this.onDetach(this.data$.sub(this.updateSections));
      this.updateSections();
    }
  ],

  listeners: [
    {
      name: 'updateSections',
      documentation: `
        This function sets 'sections' to a filtered version of 'sections_'
        after checking a few different things. The goal is to do all of the
        work to determine which sections should be visible in one place, then
        set 'sections' to that set of sections once we know what it is. Then
        views that extend AbstractSectionedDetailView can simply use a slot of
        'sections' and don't need to worry about doing all of this work
        themselves.

        The things we need to check are:
          1. That the user has permission to see the section if the section is
            configured that way.
          2. That the section is visible based on the data and the section's
            'isAvailable' method if there is one.
          3. That the section has at least one visible property or action,
            which is based on:
              (a) Whether or not the property or action requires permission to
                  be seen.
              (b) Whether or not the action is visible based on the
                  'isAvailable' method of the action.
              (c) Whether or not the property is visible based on the
                  controllerMode, visibility, or visibilityExpression.
      `,
      code: function() {
        // Keep track of the number of outstanding calls to this function so we
        // can hide the view while it's loading.
        this.outstandingCalculations_++;

        // Record the order in which calls to this function happen so we can use
        // it to avoid race conditions.
        var queuePos = this.nextQueuePosition_++;

        // First filter out sections by calling their `isAvailable` method on
        // `data`. We do this first because it's the cheapest way to filter out
        // entire sections, which means we don't need to calculate the visibility
        // of properties or actions in those sections.
        var visibleSections = this.sections_.filter(s => s.createIsAvailableFor(this.data$).get());

        if ( visibleSections.length === 0 ) {
          if ( queuePos > this.queuePositionWhenLastUpdated_ ) {
            this.sections = visibleSections;
            this.queuePositionWhenLastUpdated_ = queuePos;
          }
          this.outstandingCalculations_--;
          return;
        }

        // Next we filter out the sections that the user doesn't have permission
        // to see.
        Promise.all(visibleSections.map((s) => {
          if ( ! s.permissionRequired ) return Promise.resolve(true);
          return this.auth.check(null, this.data.cls_.id.toLowerCase() + '.section.' + s.name);
        }))
          .then((sectionPermissionCheckResults) => {
            visibleSections = visibleSections.filter((_, i) => sectionPermissionCheckResults[i]);

            if ( visibleSections.length === 0 ) {
              if ( queuePos > this.queuePositionWhenLastUpdated_ ) {
                this.sections = visibleSections;
                this.queuePositionWhenLastUpdated_ = queuePos;
              }
              return;
            }

            var final = [];

            // Finally, we filter out any remaining sections that have no visible
            // properties or actions in them below.

            // As an optimization, we'll calculate the visible properties and
            // actions here and replace each section with a clone of it where
            // we only set properties to the ones that are visible and likewise
            // for actions.
            Promise.all(visibleSections.map(s => {
              var visibleProperties = s.properties
                .map(prop => {
                  // First filter by visibility based on controllerMode since
                  // that's cheapest.
                  if ( this.controllerMode.getMode(prop) === foam.u2.DisplayMode.HIDDEN ) return null;

                  // Next filter by visibility or visibilityExpression since
                  // that's cheaper than the permission check.
                  var vis = prop.visibilityExpression
                    ? this.data.slot(prop.visibilityExpression).get()
                    : prop.visibility;
                  if ( vis === foam.u2.Visibility.HIDDEN ) return null;

                  return prop;
                })
                .filter(prop => prop);

              // Filter out the actions that user can't see.
              var visibleActions = s.actions
                .map(action => {
                  // First check based on isAvailable, not including permission
                  // check.
                  if ( ! action.isAvailable ) return action;

                  return this.data.slot(action.isAvailable).get() // We assume isAvailable is synchronous.
                    ? action
                    : null;
                })
                .filter(action => action);

              if ( visibleProperties.length + visibleActions.length === 0 ) {
                // No need to do the permission check stuff if we already know
                // the section is empty.
                return;
              }

              // Now we almost have the list of properties that are visible. The
              // last thing we need to do is filter out the ones that the user
              // doesn't have permission to see.
              var propertyPermissionPromises = visibleProperties.map((prop) => {
                var propName = prop.name.toLowerCase();
                var clsName  = prop.forClass_.substring(prop.forClass_.lastIndexOf('.') + 1).toLowerCase();

                if ( ! (prop.readPermissionRequired || prop.writePermissionRequired) ) {
                  return Promise.resolve(true);
                }

                return this.auth.check(null, `${clsName}.rw.${propName}`).then((rw) => {
                  if ( rw ) return foam.u2.Visibility.RW;
                  return this.auth.check(null, `${clsName}.ro.${propName}`).then((ro) => ro ? foam.u2.Visibility.RO : foam.u2.Visibility.HIDDEN);
                });
              });

              // Filter out actions that the user doesn't have permission to see.
              var actionPermissionPromises = visibleActions.map(action => {
                return Promise.all(action.availablePermissions.map(permission => {
                  return this.auth.check(null, permission);
                }));
              });

              return Promise.all([
                Promise.all(propertyPermissionPromises),
                Promise.all(actionPermissionPromises)
              ]).then((tuple) => {
                let [propertyResults, actionResults] = tuple;
                visibleProperties = visibleProperties.filter((_, i) => propertyResults[i]);
                visibleActions = visibleActions.filter((_, i) => actionResults[i].every(b => b));
                if ( visibleProperties.length + visibleActions.length > 0 ) {
                  final.push(s.clone().copyFrom({
                    properties: visibleProperties,
                    actions: visibleActions
                  }));
                }
              });
            })).then(() => {
              if ( queuePos > this.queuePositionWhenLastUpdated_ ) {
                this.sections = final;
                this.queuePositionWhenLastUpdated_ = queuePos;
              }
            }).finally(() => {
              this.outstandingCalculations_--;
            });
          })
          .catch((err) => {
            console.error(err);
            this.outstandingCalculations_--;
          });
      }
    }
  ]
});

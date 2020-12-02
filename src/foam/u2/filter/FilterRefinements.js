/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'PropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      // Set this field to override the default logic for choosing a view.
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupAutocompleteSearchView' }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'StringRefinement',
  refines: 'foam.core.String',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.StringFilterView' }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'BooleanRefinement',
  refines: 'foam.core.Boolean',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.BooleanFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ReferenceRefinement',
  refines: 'foam.core.Reference',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.ReferenceFilterView' }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'EnumRefinement',
  refines: 'foam.core.Enum',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.EnumFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'UnitValueRefinement',
  refines: 'foam.core.UnitValue',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.CurrencySearchView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'DateRefinement',
  refines: 'foam.core.Date',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.DateFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'IntRefinement',
  refines: 'foam.core.Int',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.IntegerFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ShortRefinement',
  refines: 'foam.core.Short',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.IntegerFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'LongRefinement',
  refines: 'foam.core.Long',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.IntegerFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ByteRefinement',
  refines: 'foam.core.Byte',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.IntegerFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FloatRefinement',
  refines: 'foam.core.Float',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.filter.properties.FloatFilterView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'DAOPropertyRefinement',
  refines: 'foam.dao.DAOProperty',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: null
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ManyToManyRelationshipPropertyRefinement',
  refines: 'foam.dao.ManyToManyRelationshipProperty',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: null
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ReferenceRefinement',
  refines: 'foam.core.Reference',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      expression: function(of) {
        return of.ID.searchView;
      }
    }
  ]
});

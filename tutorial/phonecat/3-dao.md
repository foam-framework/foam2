---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3-dao/
tutorial: 3
---

## DAO - Data Access Objects

Data Access Object, or DAO, is a generic interface for a collection of objects.

The interface supports fetching and deleting many rows (`select`, `removeAll`),
fetching and deleting single rows (`find`, `remove`) and inserts (`put`). The
interface also includes a rich and extensible query language, for filtering,
sorting, and aggregation.

The model (M of MVC) defined in the previous chapter describes what our data is:
a `Phone`. The DAO defines how we store a collection of `Phone`s.

FOAM's data storage library contains many implementations of the common DAO
interface:
- In-memory (lightning fast, with automatic indexing and query optimization)
- `LocalStorage` and `chrome.storage.*`
- `IndexedDB`
- Plain Javascript arrays
- REST services
- XML and JSON files
- MongoDB (in Node.js)

There are also many DAO "decorators", which add extra functionality on top of
other DAOs. This spares each DAO's author from having to reimplement caching,
autoincrement, logging, and timing.

## Controllers

At the top level of our app, we have a Controller, the C of MVC, which is responsible for connecting the views and models together. For this simple app, we have a small Controller with very few parts. There are a couple of inputs (search box, sort order), and the data (from the `phones.js` file).

The Controller knows nothing about how the app is laid out visually, it just creates the components and binds them together.

- A `TextField` for the search box.
- A `ChoiceView` for the sort order drop-down.
- A `DAOList` for the list of phones.

Let's look into the code, which should go in a new file, `$PROJECT/Controller.js`:

{% highlight js %}
foam.CLASS({
  package: 'tutorial',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [
    'as data',
  ],

  properties: [
    {
      name: 'search',
      class: 'String',
      view: { class: 'foam.u2.TextField', onKey: true }
    },
    {
      name: 'order',
      value: Phone.NAME,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [Phone.NAME, 'Alphabetical'],
          [Phone.AGE, 'Newest']
        ]
      }
    },
    { name: 'dao', value: phones },
    {
      name: 'filteredDAO',
      class: 'foam.dao.DAOProperty',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'tutorial.PhoneCitationView' }
      },
      expression: function (dao, search, order) {
        var expr = foam.mlang.Expressions.create();
        return dao.orderBy(order).where(expr.OR(expr.CONTAINS_IC(Phone.SNIPPET, search), expr.CONTAINS_IC(Phone.SNIPPET, search)));
      }
    }
  ]
});
{% endhighlight %}

Let's explain a few pieces of this code in detail.

- Setting `view` to an object like
  `{ class: 'TextField', onKey: true }` specifies the class
  (`TextField`) that should be used for this view, as well as some arguments
  to pass to the view, like setting `onKey` mode to `true`.
- `search` has its `view` set to `TextField`. By default, `TextField`
  fires updates when it loses focus or the user presses Enter. Setting
  `onKey: true` will make it fire an update on every keystroke, meaning the
  list of phones will filter as you type.
- `order` defaults to sorting by `Phone.NAME`.
    - For each property `someProp` on a class `MyClass`, there is a static
    property spelled `MyClass.SOME_PROP` that is used for sorting and filtering
    in DAOs. There are several examples of these here.
- `order` is displayed as a `ChoiceView`, which represents a drop-down box.
    - `ChoiceView` expects an array of choices. Each choice is an array
      `[internalValue, 'user label']`. The value of the `order` property is
      two-way bound to the current value of the drop-down box.
- `dao` is the master DAO containing all the phones.
    - `phones.js` creates a global array called `phones`. We set the
    default `value` of our `dao` property to this global value.
- `filteredDAO` is the interesting DAO. This is the one that actually drives the
  main view on the page, which gets filtered by the search and ordered by the
  sort order.
    - Its view is `DAOList`. This view shows a vertical list of rows, one
      for each entry in the DAO it is bound to. The view for each row is
      `PhoneCitationView`, which we'll define shortly.
    - `expression` takes a function that is treated like a spreadsheet cell:
      it registers listeners on each of the inputs in the function. Then when
      any of the inputs changes, the function will be run again and the value of
      `filteredDAO` updated.
        - Here, those inputs are `this.dao`, `this.order` and `this.search`.
        - The return value becomes the value of `this.filteredDAO`, which will
          be a sorted and filtered version of the master `this.dao`.
    - `CONTAINS_IC` checks if the string on the left contains the string on the
      right, ignoring case.


## `DetailView` and UI Library

We told our `DAOList` above that its `rowView` is called
`PhoneCitationView`. We need to define this view, which will specify how to
display a summary of a phone for the catalog page.

`DetailView` is a very important view in FOAM. It has a `data` property which is
set to some FOAM object. The `DetailView` has a default template, which runs
through the list of `properties` on the object, and displays their
`name`s (or `label`s, if set) in the left column of a table, and their `view`s
on the right.

Therefore we don't really have to define a custom view here, if we don't care
what it looks like. To demonstrate, let's load our app using the default
`DetailView` templates. Then we'll add custom templates so we get the layout and
style we want.

Add this dummy view to `Controller.js`:

{% highlight js %}
foam.CLASS({
  package: 'tutorial',
  name: 'PhoneCitationView',
  extends: 'foam.u2.DetailView',
});
{% endhighlight %}

With this, the catalog page will be usable, though ugly. Update `index.html` to be the following:

{% highlight html %}
<html>
  <head>
    <script language="javascript" src=“foam2/src/foam.js"></script>
    <script src="Phone.js"></script>
    <script src="phones.js"></script>
    <script src="Controller.js"></script>
  </head>
  <body>
    <foam class="tutorial.Controller"></foam>
  </body>
</html>
{% endhighlight %}

If you load that up in your browser, you'll see that it's far from pretty, but
that searching and sorting work properly.

The `<foam>` tag is a convenience for loading a given model and view, and
inserting it into the DOM.

Next we'll add custom UI components in
[part 4]({{ site.baseurl }}/tutorial/phonecat/4-templates).

There's also quite a bit more about the DAO interface in the
[appendix]({{ site.baseurl }}/tutorial/phonecat/8-appendix).


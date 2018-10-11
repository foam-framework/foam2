---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/4-UI/
tutorial: 4
---

A view is responsible for presenting some data to the user. This might be a
single object, or a collection.

In FOAM, a `view` needs to present some UI components, by calling a template method called `initE()` in the U2 library. The U2 library provides a variety of views, such as `DetailView`, `TableView`, `ImageView`, etc. These views extend `Element`, which is a virtual-DOM element that serves as the root model for all U2 UI components.

## UI Library

FOAM’s U2 syntax provides methods for adding and interacting with UI components, including:

{% raw %}
- `start()` ecreates an element and adds it as a child.
- `end()` terminates a `start()`.
- `add(args)` adds UI components to this element.
- `addClass(cls)` specifies a CSS class to this element.
- `tag(spec, args, slot)` creates a tag and adds it as a child.
- `addEventListener(topic, listener)` adds a DOM listener.
{% endraw %}

Let’s define the `initE()` for each phone in the catalog. Expand `PhoneCitationView` so it looks like this:

{% highlight js %}
{% raw %}
foam.CLASS({
  package: 'tutorial',
  name: 'PhoneCitationView',
  extends: 'foam.u2.DetailView',

  methods: [
    function initE() {
      this
        .start('li')
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .start({ class: 'foam.u2.tag.Image', data: this.data.imageUrl }).addClass('thumb').end()
          .end()
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .add(this.data.name)
          .end()
          .start()
            .add(this.data.snippet)
          .end()
        .end();
    }
  ]
});
});
{% endraw %}
{% endhighlight %}

Now reload your app and see that... it's a complete mess. That's because `PhoneCitationView` is putting in `<li>` tags but they're not in a `<ul>`, and the custom CSS for the app is not being loaded.

We'll get back to the CSS shortly. First, let's add a second template, for the top-level `ControllerView`. Add this code to `Controller.js`, expanding our `ControllerView`:

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
    },
    'image'
  ],

  methods: [
    function initE() {
      this.initHTML();
      window.addEventListener('hashchange', this.initHTML.bind(this));
    },

    function initHTML() {
      var self = this;
      this.removeAllChildren();

      this
        .add('Search: ').add(this.SEARCH)
        .br()
        .add('Sort by: ').add(this.ORDER)
        .br()
        .start('ul')
        .addClass('phones').add(this.FILTERED_DAO)
        .end();
    }
  ]
});
{% endhighlight %}

- Most FOAM views support `className` and `tagName`. The default `tagName` for a
  `DAOList` is `<div>`, but we want to use `<ul>` here.
- `search` has `view` set to `TextField`, so it will render as a text box.
- `order`'s `view` is `ChoiceView`, which renders a drop-down list.
- `filteredDAO` is the `DAOList`, which renders the list of entries.

The custom CSS still isn't loaded, so add the following to `index.html`'s
`<head>` tag:

{% highlight html %}
<link rel="stylesheet" href="css/app.css" />
<link rel="stylesheet" href="css/bootstrap.css" />
{% endhighlight %}

and reload your app. Now it should look much better, and the search and sort
functions work!

[Part 5]({{ site.baseurl }}/tutorial/phonecat/5-navigation) will add navigation to our
app.


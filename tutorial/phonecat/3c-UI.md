---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3c-UI/
tutorial: 3c
---
# **Part III - Applied Learning - User Interface**

A view is responsible for presenting specific data to the user. An example of this kind of data would be a single object or a collection.

In FOAM, a `view` needs to present a UI component by defining a template method `initE()` in the U2 library. The U2 library provides a variety of views such as `DetailView`, `TableView`, `ImageView`, etc. These views extend `Element` which is a virtual-DOM element that serves as the root model for all U2 UI components.

## **UI Library**

FOAM’s U2 syntax provides methods for adding and interacting with UI components, including:

{% raw %}
- `start()` creates an element and adds it as a child.
- `end()` terminates a `start()`.
- `add(args)` adds UI components to this element.
- `addClass(cls)` specifies a CSS class to this element.
- `tag(spec, args, slot)` creates a tag and adds it as a child.
- `addEventListener(topic, listener)` adds a DOM listener.
{% endraw %}


## **Tutorial Application**

Let’s define the `initE()` for each phone in the catalog. 

**STEP #1.** Expand `PhoneCitationView` so it looks like this:

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
            .start({ class: 'foam.u2.tag.Image', 
                     data: this.data.imageUrl })
              .addClass('thumb').end()
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

**STEP #2.** Reload your app and see that... it's a complete mess. That's because `PhoneCitationView` is putting in `<li>` tags but they're not in a `<ul>`, and the custom CSS for the app is not being loaded.  We'll get back to the CSS shortly. 

**STEP #3.** Add a second template for the top-level `ControllerView`. 

**STEP #4.** Add the followng code to `Controller.js`and expand your `ControllerView`:

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
        return dao.orderBy(order).where(expr.OR(
          expr.CONTAINS_IC(Phone.SNIPPET, search), 
          expr.CONTAINS_IC(Phone.SNIPPET, search)));
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

#### **About the Above Code:**

1. Most FOAM views support `className` and `tagName`. The default `tagName` for a `DAOList` is `<div>`.
2. `search` has `view` set to `TextField`,so it will render as a text box.
3. `order`'s `view` is `ChoiceView` which renders a drop-down list.
4. `filteredDAO` is the `DAOList` which renders the list of entries.

**STEP #5.** Add the following to `index.html`'s `<head>` tag to load the custom CSS:

{% highlight html %}
<link rel="stylesheet" href="css/app.css" />
<link rel="stylesheet" href="css/bootstrap.css" />
{% endhighlight %}

**STEP #6.** Reload your app. 

## **Conclusion**

Now your app should look much better and the search and sort functions work! You are now ready for the final stage of your basic app in FOAM.  Please proceed to the next lesson on navigation.

## **[NEXT: Part III - Applied Learning - Navigation](../3d-navigation/)** 

### **Tutorial Menu:**

1. [Getting Started](../1-gettingstarted/)
1. [Core Concepts](../2-concepts/)
1. Applied Learning: Build a Basic App with FOAM
    * [Defining the Model](../3a-model/)
    * [The Controller](../3b-dao/)
    * [UI Library](../3c-UI/)
    * [Navigation](../3d-navigation/)

* [Tutorial Overview](../0-intro/)
* [About FOAM](/foam/about/)
* [Appendix](../4-appendix/)
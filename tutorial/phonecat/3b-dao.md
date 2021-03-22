---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3b-dao/
tutorial: 3b
---
# **Part III - Applied Learning - The Controller**

In this chapter, for the purpose of building our simple app on FOAM, you will learn about the following:

  1. DAOs (Data Access Objects)
  2. the FOAM DetailView  
  3. the Controller 
  
In the previous chapter, by defining the model (the M of MVC) you described what your data is: a `Phone`.  As mentioned in the Core Concepts of this tutorial, MVC is a classic pattern for breaking up applications into reusable, decoupled components. DAOs further define the model (M) by defining how you store your data. The DetailView (V) is how your data will be presented to the user for viewing and editing. The controller (C) will connect the views with the model. 

## **1. DAO - Data Access Objects**

A Data Access Object (DAO) is a generic interface for a collection of objects.

The DAO interface supports fetching and deleting many rows (`select`, `removeAll`), fetching and deleting single rows (`find`, `remove`) and inserts (`put`). The interface also includes a rich and extensible query language for filtering, sorting and aggregation.

FOAM's data storage library contains many implementations of the common DAO interface, such as:
- In-memory (lightning fast, with automatic indexing and query optimization)
- `LocalStorage` and `chrome.storage.*`
- `IndexedDB`
- Plain Javascript arrays
- REST services
- XML and JSON files
- MongoDB (in Node.js)

There are also many DAO "decorators" which add extra functionality on top of other DAOs. This spares each DAO's author from having to reimplement caching, autoincrement, logging and timing.

## **2. The FOAM DetailView** 

The FOAM `DetailView` has a `data` property which is set to a specified FOAM object. 

The FOAM `DetailView` has a default template which runs through the list of `properties` on the object and displays their `name`s (or `label`s, if set) in the left column of a table and their `view`s on the right. Therefore, we don't really have to define a custom view here. 

## **3. The Controller**

At the top level of an app, the controller (C of MVC) is responsible for connecting the views and model. The controller knows nothing about how the app is laid out visually; it just creates the components and binds them together.


## **Tutorial Application**

For this simple app, you will have a small controller with very few parts:

1. A `TextField` for the search box.
2. A `ChoiceView` for the sort order drop-down.
3. A `DAOList` for the list of phones (from the `phones.js` file).

**STEP #1.** Enter the following code into a new js file called `$PROJECT/Controller.js`:

      {% highlight js %}
      foam.CLASS({
        package: 'tutorial',
        name: 'Controller',
        extends: 'foam.u2.Element',

        exports: [
          'as data'
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
          }
        ]
      });
      {% endhighlight %}

#### **About the Above Code:**

1. Setting `view` to an object like `{ class: 'TextField', onKey: true }` specifies the class (`TextField`) that should be used for this view, as well as some arguments   to pass to the view, like setting `onKey` mode to `true`.

2. `search` has its `view` set to `TextField`. By default, `TextField` fires updates when it loses focus or the user presses Enter. `Setting onKey: true` will make it fire an update on every keystroke.  This means that the list of phones for your app will filter as you type.

3. `order` defaults to sorting by `Phone.NAME`.

    * For each property `someProp` on a class `MyClass`, there is a static property spelled `MyClass.SOME_PROP` that is used for sorting and filtering in DAOs. There are several examples of these here. 

4. `order` is displayed as a `ChoiceView` which represents a drop-down box. 
          
    * `ChoiceView` expects an array of choices. Each choice is an array `[internalValue, 'user label']`. The value of the `order` property is two-way bound to the current value of the drop-down box.

5. `dao` is the master DAO containing all the phones.

    * `phones.js` creates a global array called `phones`. You set the default `value` of your `dao` property to this global value.

6. `filteredDAO` is the interesting DAO. This is the one that actually drives the main view on the page which gets filtered by the search and ordered by the sort order.

    * Its view is `DAOList`. This view shows a vertical list of rows, one for each entry in the DAO to which it is bound. The view for each row is `PhoneCitationView` which we'll define shortly.

    * `expression` takes a function that is treated like a spreadsheet cell: it registers listeners on each of the inputs in the function. Then when any of the inputs changes, the function will be run again and the value of `filteredDAO` updated.
      - In the above code, those inputs are `this.dao`, `this.order` and `this.search`.
      - The return value becomes the value of `this.filteredDAO` which will be a sorted and filtered version of the master `this.dao`.
    * `CONTAINS_IC` checks if the string on the left contains the string on the right, ignoring case.

The `rowView` in the `DAOList` above is called `PhoneCitationView`. The above code defined this view to specify how to display a summary of a phone for the catalog page. Now, load your app using the default `DetailView` templates. 


**STEP #2.** Add the following dummy code to `Controller.js`.  After this step the catalog page will be functional:

    {% highlight js %}
    foam.CLASS({
      package: 'tutorial',
      name: 'PhoneCitationView',
      extends: 'foam.u2.DetailView'
    });
    {% endhighlight %}

**STEP #3.** Update `index.html` to be the following:

    {% highlight html %}
    <html>
      <head>
        <script language="javascript" src="foam3/src/foam.js"></script>
        <script src="Phone.js"></script>
        <script src="phones.js"></script>
        <script src="Controller.js"></script>
      </head>
      <body>
        <foam class="tutorial.Controller"></foam>
      </body>
    </html>
    {% endhighlight %}

If loaded into your browser, you'll see that it's far from pretty but that searching and sorting work properly.

The `<foam>` tag is convenient for loading a given model and view and inserting it into the DOM.


## **Conclusion**

In this part of the tutorial, we have explained the use of DAOs, the DetailView and the controller in FOAM.  You have applied a controller to your app and used DetailView to assess your work. You are now ready to move onto learning about FOAM UI components and add them to your app.

## **[NEXT: Part III - Applied Learning - User Interface Library](../3c-UI/)**
  

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

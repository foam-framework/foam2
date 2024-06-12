---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/1-gettingstarted/
tutorial: 1
---

# **Part I:  Getting Started**

Let's dive right in. 

1. Create a new folder for your project and open it. 

1. Ensure all the required tools are available or have been downloaded. 

     There are only four required tools for this tutorial. The following list includes links to locations where the required tools may be downloaded:

     1. [FOAM framework](https://github.com/foam-framework/foam3.git)
     2. [GIT GUI](https://www.sourcetreeapp.com/)
     3. [Python](https://www.python.org/downloads/) (Python is our recommended local web server)
     4. [Tutorial Companion File](../bundle.zip)

     When downloading, save the FOAM framework to your project folder. A sub-directory will be created that holds all the code for FOAM as well as numerous demos and test pages.

1. Create and save a new JS file in your project directory called `$PROJECT/foam_powered.js` with the following contents:

     {% highlight html %}
     var FOAM_POWERED = '<a style="text-decoration:none;" href="https://github.com/foam-framework/foam/" target="_blank">\
     <font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
     <font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
     <font color="#555555" > POWERED</font></font></a>';
     {% endhighlight %}

   The FOAM library is split across many files, but you only need to include this one JS file in your HTML document: `foam3/src/foam.js`.  

1. Create and save a new HTML file in your project directory called `$PROJECT/index.html` with the following contents:

     {% highlight html %}
     <html>
       <head>
         <script src="foam3/src/foam.js"></script>
         <script src="foam_powered.js"></script>
       </head>
       <body>
         <script>
           document.write(FOAM_POWERED);
         </script>
       </body>
     </html>
     {% endhighlight %}

1. Launch your local web server and direct your browser to this file. Using Python, the local web server will look like:

    python -m SimpleHTTPServer    # Python 2
    python -m http.server         # Python 3

   This will serve as the current directory on port 8000: [http://localhost:8000/](http://localhost:8000/).

1. Load the page in your local web browser.  It should display the "FOAM Powered" logo, and no JS console errors.

If that's what you're seeing, then congratulations! You've got FOAM running and you're ready to move on to the next stage in this tutorial: Core Concepts.

## **[NEXT:  Part II - Core Concepts](../2-concepts/)** 

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

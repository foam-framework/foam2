foam.LIB({
  name: 'foam.UI',
  methods: [
    //quickly makes a paragraph
    function getP(str, cls, innerTag){
        var p = foam.u2.Element.create("p");
        if (cls && typeof cls === "string") p.cssClass(cls);
        if (innerTag && typeof innerTag === "string"){
            p = p.start(innerTag).add(str).end(innerTag);
        }else{
            p = p.add(str); 
        }
        
        return p; 
    }, 
    
    //used in GroupByIdSearchView
    function formatGroupByEntry(key, label, c, maxLength){
        var count = foam.String.intern(
               '(' + c + ')');

        var subKey = ""; 
        if (maxLength){
            subKey = ('' + label)
                .substring(0, maxLength- count.length - 3);
        }else {
            subKey = label;
        }
        var cleanKey =  subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    
        return [
          key,
          cleanKey + foam.String.intern(
              Array(maxLength- subKey.length - count.length).join(' ')) +
              count
        ];
    },
    ], 

}); 
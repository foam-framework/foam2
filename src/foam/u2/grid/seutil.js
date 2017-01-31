console.log("Loading SE.util");
var SE = {};


SE.util = {};
/*
 *(fucntion(ns) { ns.fct = function(){...} }_)(SE.util)
 * is a convenient way to decorate and assign functions to SE.util
 *
*/
(function(ns) {
    /* local ServiceEcho functions */
    ns.getRandomInt = function(max, min){
            if (!min) min = 0; 
        return Math.floor(Math.random() * (max - min + 1)) + min;
    
    };
    
    
    ns.invertMap = function (obj) {
    
      var new_obj = {};
    
      for (var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          new_obj[obj[prop]] = prop;
        }
      }
    
      return new_obj;
    };

    ns.compareObj = function(obj1, obj2){
        return  JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    ns.isArray = function(obj){
        if (obj.constructor === Array || (obj.prop && obj.prop.constructor === Array))
            return true;
        return false;
    };


    ns.arrayContains = function(array, item, comparator) {
        if (array && item) {
            for (var i = 0; i < array.length; i++) {
                if (comparator && comparator(array[i], item) || array[i] === item) {
                    return i;
                }
            }
        }
        return -1;
    };

    ns.compareArrays = function (arr1, arr2){
        if (!ns.isArray(arr1) || !ns.isArray(arr2)){
            console.log("SE.util.compareArrays: One or more of input is not an array, comaring them as elements. ");
            return arr1 == arr2;
        }
        if (arr1 && arr2 && arr1.length === 0 && arr2.length === 0)
            return true;
        if (! arr1 || ! arr2 || !(arr1.length == arr2.length))
            return false;
        for (var j=0; j<arr1.length; j++){
            if (ns.isArray(arr1[j]) && ns.isArray(arr2[j]) ){
                    if (! ns.compareArrays(arr1[j], arr2[j])) return false;
            } else if (ns.isArray(arr1[j]) || ns.isArray(arr2[j]) ){
                    return false;
            }else if (arr1[j] != arr2[j]){
                return false;
            }else{
                return true;
            }
        }
        return true;
    };

    ns.toUniqueArray = function(arr)
    {
        var r=[];
        for(var i = 0; i < arr.length; i++)
        {
            var currObj = arr[i];
            if (ns.isArray(currObj)){
                if (!(ns.arrayContains(r, currObj, ns.compareArrays)>-1))
                    r.push(currObj);
            }else {
                if(!(r.indexOf(currObj) >-1))
                    r.push(currObj);
            }
        }
        arr = r;
        return r;
    };

    ns.intersectArrays = function(arr1, arr2){
        var arr = [];
        if (!arr1 || !arr2 || !arr1.length || !arr2.length)
        return arr;
        for (var j=0; j<arr1.length; j++){
            if (arr2.indexOf(arr1[j])>-1)
                arr.push(arr1[j]);
        }
        return arr;
    };

    ns.concatArray = function (arr1, arr2){
        return arr1.concat(arr2);
    };


    ns.removeFromArray = function(origArr, removeArr){
        for (var j=0; j<removeArr.length; j++){
            var currObj = removeArr[j];
            var index = -1;
            if (! ns.isArray(currObj)){
                index = origArr.indexOf(removeArr[j]);
            }else {
                index = ns.arrayContains(origArr, currObj, ns.compareArrays);
            }

            if (index > -1) {
                origArr.splice(index, 1);
            }
        }
        return origArr;
    };

    /*
     *turns [["id001","john doe"], ["id002","my dear"]] to {{"id001","john doe"}, {"id002","my dear"}}
     *I'm implementing it the slow way, because every time I use array.map, I screw up.
     */
    ns.arrayToObj = function(arr, model){
        var obj = {};
        if (!arr) {
            return {};
        }
        if (model) {
            var instance = model.create();
            for (var i=0; i<arr.length; i++) {
                var key = (instance.unAdaptPropertyName && instance.unAdaptPropertyName(arr[i][0])) || arr[i][0];
                obj[key] = arr[i][1];
            }
            
        }else {
            for (var i=0; i<arr.length; i++) {
                obj[arr[i][0]] = arr[i][1];
            }
        }
        return obj;
    };

    ns.objValues = function(obj){
        var v = [];
        for (var item in obj) {
            v.push(obj[item]);
        }
        return v;
    };

    /*var maxSpeed = {car:300, bike:60, motorbike:200, airplane:1000,
        helicopter:400, rocket:8*60*60}
    var sortable = [];
    for (var vehicle in maxSpeed)
          sortable.push([vehicle, maxSpeed[vehicle]])
    sortable.sort(function(a, b) {return a[1] - b[1]})*/
    ns.sortObjByValue = function(obj){
        var sortable = [];
        for (var item in obj) {
            sortable.push([item, obj[item]]);
            sortable.sort(function(a, b) {
                return a>b?1:-1;
                });
        }
        return ns.arrayToObj(sortable);
    };

    ns.sort2DArray = function(arr){

    };

    ns.sortByName = function(a, b) {
        if (a && b) {
            return a[1].toString().localeCompare(b[1].toString());
        } else {
            return a ? 1 : b ? -1 : 0;
        }
    };

    ns.isEmptyObj = function(obj) {
        for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
        return true;
    };
    
    ns.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    ns.getDAOName = function(o) {
        if ((typeof o) === "string"){
            return ns.capitalizeFirstLetter(o) + "DAO"; 
        }else if (o.cls_ && o.cls_.name){
            return ns.capitalizeFirstLetter(o.cls_.name) + "DAO"; 
        }
        return; 
    }; 


    ns.floatToMinutes = function(obj){
        return (obj?Math.round(obj):0);
    };
    
    ns.toLocalTime = function(dd){
        var d = new Date(dd);
        return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); 
    }; 

    //for example, date to hh:mm:ss
    ns.timeToDelimStr = function(dd, delim = ":", ignoreSeconds){
        var d = new Date(dd);
        /*if (delim == null || delim == undefined) {
            delim = ":";
        }*/
        var h  = d.getHours();
        var m   = d.getMinutes();
        var s = d.getSeconds();
        if (h <10) h = "0" + h;
        if (m < 10) m = "0" + m;
        if(s <10) s = "0" + s;
        return h + delim + m + (ignoreSeconds?"":(delim + s));
    }; 

    //for example, date to dd/mm/yyyy
    ns.dateToDelimStr = function(dd, delim="-", format="dmy"){
        var d = new Date(dd);
        /*if (delim == null || delim == undefined) {
            delim = "-";
        }*/
        var dd   = d.getDate();
        var mm   = d.getMonth() + 1;
        var yyyy = d.getFullYear();
        if(dd<10) {
                    dd='0'+dd;
        }
        if(mm<10) {
            mm='0'+mm;
        }
        return format == 'dmy' ? mm + delim + dd + delim + yyyy : yyyy + delim + mm + delim + dd
    }; 

    //returns a string. (technically does not need a return. )
    //set the time to 00:00:00 GMT. (need to fix it to local time. )

    ns.startOfToday = function(){
        var d = new Date();
        ns.toStartOfDay(d);
        return d;
    }; 

    ns.toStartOfDay = function(d){
        if (!d || !(d instanceof Date)) {
            d = new Date(d);
        }

        //d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
        d.setHours(0,0,0,0);


        return d;
    }; 

    /*get the last say, friday (5), that comes before day d. */
    /*includes the day in questions. */
    ns.toLastDayOfWeek = function(date, dayofweek){
        var diff = date.getDay() - dayofweek;
        diff = (diff>=0)?diff:(diff+7);
        date.setDate(date.getDate() - diff);
        return date;
    }; 

    /*excludes day in quesiton. */
    ns.toNextDayOfWeek = function(date, dayofweek){
        var diff = dayofweek - date.getDay();
        diff = (diff>0)?diff:(diff+7);
        date.setDate(date.getDate() + diff);
        return date;
    }; 

    ns.toNextDay = function(d){
        if (d) {
            d.setDate(d.getDate() +1);
        }
        return d;
    };

    ns.dateAddMonthsUTC = function(date, count) {
        //http://stackoverflow.com/a/35299103
        if (date && count) {
            var m, d = (date = new Date(+date)).getUTCDate();

            date.setUTCMonth(date.getUTCMonth() + count, 1);
            m = date.getUTCMonth();
            date.setUTCDate(d);
            if (date.getUTCMonth() !== m) date.setUTCDate(0);
        }
        return date;

    };
    ns.dateAddMonths = function(date, count) {
        if (date && count) {
            var m, d = (date = new Date(+date)).getDate();

            date.setMonth(date.getMonth() + count, 1);
            m = date.getMonth();
            date.setDate(d);
            if (date.getMonth() !== m) date.setDate(0);
        }
        return date;
    };

    ns.getDayName = function(d){
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return days[d.getDay()]; 
    };
    
    ns.getDayCardinal = function (day) {
        var d = day.getDate();
      if(d>3 && d<21) return 'th'; 
      switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }; 

    ns.getMonthName = function(d){
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return months[d.getMonth()]; 
    };
    
    ns.getShortMonthName = function(d){
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[d.getMonth()]; 
    };
    

    ns.toEndOfDay = function(d){
        if (!d || !(d instanceof Date)) {
            d = new Date(d);
        }
        //d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
        d.setHours(23,59,59,999);
        return d;
    }; 

    ns.isValidDate = function(d) {
          if ( Object.prototype.toString.call(d) !== "[object Date]" )
            return false;
          return !isNaN(d.getTime());
        };
        
    ns.getWeekDateArray = function(d, startOfWeek){
        var days = [];
        var day = ns.toLastDayOfWeek(new Date(d), startOfWeek);
        day = ns.toStartOfDay(day);
        for (var i=0; i<7; i++){
            var currDay = new Date(day);
            currDay.setDate(currDay.getDate() + i);
            days.push(currDay);
        }
        return days; 
    }; 
    

    //strictly witin.
    ns.inDateRange = function(d, dstart, dend){
        if (d>= dstart && d<= dend) {
            return true;
        }
        return false;
    }; 

    ns.isSalesforceId = function (str){
        return /^([a-zA-Z0-9]{18,18})$/.test(str);
    }; 

    ns.loadTest = function(){
    }; 

  //ns.snakeCase = memoize1(function(str) {
  ns.snakeCase = function(str) {
    return str.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "_" : "") + $1;});
  }; 

}) (SE.util);

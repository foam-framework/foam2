foam.LIB({
  name: 'foam.DateTime',
    methods: [
    function isInstance(o) { return typeof o === 'string'; },
    
    function floatToMinutes(obj){
        return (obj?Math.round(obj):0);
    }, 
    
    function toLocalTime(dd){
        var d = new Date(dd);
        return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); 
    }, 

    //for example, date to hh:mm:ss
    function timeToDelimStr (dd, delim = ":", ignoreSeconds){
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
    }, 

    //for example, date to dd/mm/yyyy
    function dateToDelimStr(da, delim="-", format="dmy"){
        var d = new Date(da);
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
        return format == 'dmy' ? mm + delim + dd + delim + yyyy : yyyy + delim + mm + delim + dd;
    }, 

    //returns a string. (technically does not need a return. )
    //set the time to 00:00:00 GMT. (need to fix it to local time. )
    function startOfToday(){
        var d = new Date();
        this.toStartOfDay(d);
        return d;
    }, 

    function toStartOfDay(d){
        if (!d || !(d instanceof Date)) {
            d = new Date(d);
        }
        //d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
        d.setHours(0,0,0,0);
        return d;
    }, 

    /*get the last say, friday (5), that comes before day d. */
    /*includes the day in questiothis. */
    function toLastDayOfWeek(date, dayofweek){
        var diff = date.getDay() - dayofweek;
        diff = (diff>=0)?diff:(diff+7);
        date.setDate(date.getDate() - diff);
        return date;
    }, 

    /*excludes day in quesiton. */
    function toNextDayOfWeek(date, dayofweek){
        var diff = dayofweek - date.getDay();
        diff = (diff>0)?diff:(diff+7);
        date.setDate(date.getDate() + diff);
        return date;
    }, 

    function toNextDay(d){
        if (d) {
            d.setDate(d.getDate() +1);
        }
        return d;
    }, 

    function dateAddMonthsUTC(date, count) {
        //http://stackoverflow.com/a/35299103
        if (date && count) {
            var m, d = (date = new Date(+date)).getUTCDate();

            date.setUTCMonth(date.getUTCMonth() + count, 1);
            m = date.getUTCMonth();
            date.setUTCDate(d);
            if (date.getUTCMonth() !== m) date.setUTCDate(0);
        }
        return date;

    },
    
    function dateAddMonths(date, count) {
        if (date && count) {
            var m, d = (date = new Date(+date)).getDate();

            date.setMonth(date.getMonth() + count, 1);
            m = date.getMonth();
            date.setDate(d);
            if (date.getMonth() !== m) date.setDate(0);
        }
        return date;
    }, 

    function getDayName (d){
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return days[d.getDay()]; 
    }, 
    
    function getDayCardinal(day) {
        var d = day.getDate();
      if(d>3 && d<21) return 'th'; 
      switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }, 

    function getMonthName(d){
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return months[d.getMonth()]; 
    }, 
    
    function getShortMonthName(d){
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[d.getMonth()]; 
    }, 
    

    function toEndOfDay(d){
        if (!d || !(d instanceof Date)) {
            d = new Date(d);
        }
        //d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
        d.setHours(23,59,59,999);
        return d;
    }, 

    function isValidDate(d) {
          if ( Object.prototype.toString.call(d) !== "[object Date]" )
            return false;
          return !isNaN(d.getTime());
    }, 
        
    function getWeekDateArray(d, startOfWeek){
        var days = [];
        var day = this.toLastDayOfWeek(new Date(d), startOfWeek);
        day = this.toStartOfDay(day);
        for (var i=0; i<7; i++){
            var currDay = new Date(day);
            currDay.setDate(currDay.getDate() + i);
            days.push(currDay);
        }
        return days; 
    }, 
    

    //strictly witin.
    function inDateRange(d, dstart, dend){
        if (d>= dstart && d<= dend) {
            return true;
        }
        return false;
    }, 

    ],
    
});
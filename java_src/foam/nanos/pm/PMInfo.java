// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.nanos.pm;


public class PMInfo extends foam.core.AbstractFObject {
  static foam.core.PropertyInfo MINTIME = new foam.core.AbstractLongPropertyInfo() {
      public String getName() {
        return "mintime";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public long get_(Object o) {
        return ((PMInfo)o).getMintime();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setMintime(cast(value));
      }
      public long cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).longValue() :(long)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.LongParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  static foam.core.PropertyInfo NUMOCCURRENCES = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "numoccurrences";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((PMInfo)o).getNumoccurrences();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setNumoccurrences(cast(value));
      }
      public int cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).intValue() :(int)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.IntParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private boolean clsnameIsSet_ =     false;
;
  static foam.core.PropertyInfo CLSNAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "clsname";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((PMInfo)o).getClsname();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setClsname(cast(value));
      }
      public String cast(Object o) {
        return (String)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.StringParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
      public int getWidth() {
        return 30;
      }
    };
  private String pmname_;
  private boolean pmnameIsSet_ =     false;
;
  static foam.core.PropertyInfo PMNAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "pmname";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((PMInfo)o).getPmname();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setPmname(cast(value));
      }
      public String cast(Object o) {
        return (String)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.StringParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
      public int getWidth() {
        return 30;
      }
    };
  private long mintime_;
  private boolean mintimeIsSet_ =     false;
;
  private String clsname_;
  private long maxtime_;
  private boolean maxtimeIsSet_ =     false;
;
  static foam.core.PropertyInfo MAXTIME = new foam.core.AbstractLongPropertyInfo() {
      public String getName() {
        return "maxtime";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public long get_(Object o) {
        return ((PMInfo)o).getMaxtime();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setMaxtime(cast(value));
      }
      public long cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).longValue() :(long)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.LongParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private long totaltime_;
  private boolean totaltimeIsSet_ =     false;
;
  static foam.core.PropertyInfo TOTALTIME = new foam.core.AbstractLongPropertyInfo() {
      public String getName() {
        return "totaltime";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public long get_(Object o) {
        return ((PMInfo)o).getTotaltime();
      }
      public void set(Object o, Object value) {
        ((PMInfo)o).setTotaltime(cast(value));
      }
      public long cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).longValue() :(long)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.LongParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private int numoccurrences_;
  private boolean numoccurrencesIsSet_ =     false;
;
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.nanos.pm.PMInfo")
    .addProperty(PMInfo.CLSNAME)
    .addProperty(PMInfo.PMNAME)
    .addProperty(PMInfo.MINTIME)
    .addProperty(PMInfo.MAXTIME)
    .addProperty(PMInfo.TOTALTIME)
    .addProperty(PMInfo.NUMOCCURRENCES);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public String getClsname() {
    if ( ! clsnameIsSet_ ) {
     return "";
    }
    return clsname_;
  }
  public PMInfo setClsname(String val) {
    clsname_ = val;
    clsnameIsSet_ = true;
    return this;
  }
  public String getPmname() {
    if ( ! pmnameIsSet_ ) {
     return "";
    }
    return pmname_;
  }
  public PMInfo setPmname(String val) {
    pmname_ = val;
    pmnameIsSet_ = true;
    return this;
  }
  public long getMintime() {
    if ( ! mintimeIsSet_ ) {
     return 0;
    }
    return mintime_;
  }
  public PMInfo setMintime(long val) {
    mintime_ = val;
    mintimeIsSet_ = true;
    return this;
  }
  public long getMaxtime() {
    if ( ! maxtimeIsSet_ ) {
     return 0;
    }
    return maxtime_;
  }
  public PMInfo setMaxtime(long val) {
    maxtime_ = val;
    maxtimeIsSet_ = true;
    return this;
  }
  public long getTotaltime() {
    if ( ! totaltimeIsSet_ ) {
     return 0;
    }
    return totaltime_;
  }
  public PMInfo setTotaltime(long val) {
    totaltime_ = val;
    totaltimeIsSet_ = true;
    return this;
  }
  public int getNumoccurrences() {
    if ( ! numoccurrencesIsSet_ ) {
     return 0;
    }
    return numoccurrences_;
  }
  public PMInfo setNumoccurrences(int val) {
    numoccurrences_ = val;
    numoccurrencesIsSet_ = true;
    return this;
  }
}
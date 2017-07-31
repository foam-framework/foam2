/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import java.util.List;
import java.util.Arrays;
import java.util.Iterator;

import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

// FObject JSON Parsing
import foam.core.EmptyX;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;

// MongoDB Driver Dependencies
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.ServerAddress;
import com.mongodb.MongoCredential;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;

import org.bson.Document;
import org.bson.json.JsonWriterSettings;
import org.bson.json.JsonMode;


public class MongoDAO
        extends AbstractDAO
{
  MongoDatabase database;

  private static final int MONGO_OBJECT_PREFIX_LENGTH = 49;

  public MongoDAO(String host, int port, String dbName, String username, String password) {
    if ( dbName == null || dbName.isEmpty() ) {
      throw new IllegalArgumentException("Illegal arguments");
    }

    host = ( host != null ) ? host : "localhost";

    MongoClient mongoClient;

    if ( isUserPassProvided(username, password) ) {
      MongoCredential credential = MongoCredential.createCredential(username, dbName, password.toCharArray());
      mongoClient = new MongoClient(new ServerAddress(host, port), Arrays.asList(credential));
    } else {
      mongoClient = new MongoClient(host, port);
    }

    this.database = mongoClient.getDatabase(dbName);
  }

  public MongoDAO(String dbName, String username, String password) {
    this("localhost", 27017, dbName, username, password);
  }

  public MongoDAO(String dbName) {
    this(dbName, null, null);
  }

  private boolean isUserPassProvided(String username, String password) {
    return ( ( username != null ) && ( ! username.isEmpty() ) ) &&
            ( ( password != null ) && ( ! password.isEmpty() ) );
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();

    String collectionName = (String) x.get("collectionName");
    String collectionClass = (String) x.get("collectionClass");
    List props = getFObjectProperties(collectionClass, x);

    if ( collectionName == null || collectionName.isEmpty() ) {
      throw new IllegalArgumentException("Invalid collection name in context. Please provide a string name.");
    } else if ( collectionClass == null || collectionClass.isEmpty() ) {
      throw new IllegalArgumentException("Invalid collection class name in context. Please provide a string class name.");
    }

    MongoCollection<Document> collection = database.getCollection(collectionName);
    MongoCursor<Document> cursor = collection.find().iterator();

    try {
      while ( cursor.hasNext() ) {
        if ( sub.getDetached() ) break;

        FObject obj = createFObject(collectionClass, props, cursor.next());

        if ( ( predicate == null ) || predicate.f(obj) ) {
          decorated.put(obj, sub);
        }
      }
    } finally {
      cursor.close();
    }

    decorated.eof();

    return sink;
  }

  private List getFObjectProperties(String clsName, X x) {    
    try {
      Class cls = Class.forName(clsName);
      FObject clsInstance = (FObject) x.create(cls);
      List props = clsInstance.getClassInfo().getAxiomsByClass(foam.core.AbstractFObjectPropertyInfo.class);
      
      // Recursively handle nested FObjectProperties
      for ( int i = 0 ; i < props.size() ; i++ ) {
        props.addAll(getFObjectProperties(((PropertyInfo) props.get(i)).getPropertyType(), x));
      }

      return props;
    } catch (Exception ex) {
      throw new RuntimeException(clsName + " was not found.");
    }
  }

  private FObject createFObject(String clsName, List props, Document d) {
    JsonWriterSettings writerSettings = new JsonWriterSettings(JsonMode.SHELL, true);
    String jsonStr = d.toJson(writerSettings);

    // Trims initial `"_id" : ObjectId("[24 HEX Chars]"),`
    jsonStr = "{ class: \"" + clsName + "\", " + 
                 jsonStr.substring(MONGO_OBJECT_PREFIX_LENGTH, jsonStr.length() - 1) + 
              " }";

    Iterator i = props.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      jsonStr = jsonStr.replace("\"" + prop.getName() + "\" : {", "\"" + prop.getName() + "\" : { class: \"" + prop.getPropertyType() + "\",");
    }

    JSONParser parser = new JSONParser();
    parser.setX(EmptyX.instance());
    return parser.parseString(jsonStr);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("put_ is not yet supported for MongoDAO");
  }

  @Override
  public FObject find_(X x, Object id) {
    throw new UnsupportedOperationException("find_ is not yet supported for MongoDAO");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("remove_ is not yet supported for MongoDAO");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("removeAll_ is not yet supported for MongoDAO");
  }
}

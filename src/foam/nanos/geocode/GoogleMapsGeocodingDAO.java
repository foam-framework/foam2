/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.geocode;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.JSONParser;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class GoogleMapsGeocodingDAO
    extends ProxyDAO
{
  public static String API_HOST = "https://maps.googleapis.com/maps/api/geocode/json?address=";

  protected String apiKey_;
  protected JSONParser parser_;
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public GoogleMapsGeocodingDAO(X x, String apiKey, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    this.apiKey_ = apiKey;
    this.parser_ = getX().create(JSONParser.class);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // don't geocode if not instance of user
    if ( !(obj instanceof User) ) {
      return super.put_(x, obj);
    }

    // don't geocode if no address property
    Address address = ((User) obj).getAddress();
    if ( address == null ) {
      return super.put_(x, obj);
    }

    // check if address updated
    if ( address.getLatitude() != 0 && address.getLongitude() != 0 ) {
      User stored = (User) getDelegate().find(((User) obj).getId());
      if (stored != null && stored.getAddress() != null) {
        Address storedAddress = stored.getAddress();
        // compare fields that are used to populate Google maps query
        if ( SafetyUtil.compare(address.getAddress(), storedAddress.getAddress()) == 0 &&
            SafetyUtil.compare(address.getCity(), storedAddress.getCity()) == 0 &&
            SafetyUtil.compare(address.getRegionId(), storedAddress.getRegionId()) == 0 &&
            SafetyUtil.compare(address.getPostalCode(), storedAddress.getPostalCode()) == 0 &&
            SafetyUtil.compare(address.getCountryId(), storedAddress.getCountryId()) == 0 ) {
          return super.put_(x, obj);
        }
      }
    }

    StringBuilder builder = sb.get().append(API_HOST);
    // append address
    if ( ! SafetyUtil.isEmpty(address.getAddress()) ) {
      builder.append(address.getAddress()).append(",");
    }

    // append city
    if ( ! SafetyUtil.isEmpty(address.getCity()) ) {
      builder.append(address.getCity()).append(",");
    }

    // append province
    if ( ! SafetyUtil.isEmpty((String) address.getRegionId()) ) {
      builder.append((String) address.getRegionId()).append(",");
    }

    // append postal code
    if ( ! SafetyUtil.isEmpty(address.getPostalCode()) ) {
      builder.append(address.getPostalCode()).append(",");
    }

    // append country id
    if ( ! SafetyUtil.isEmpty((String) address.getCountryId()) ) {
      builder.append((String) address.getCountryId());
    }

    // append api key
    builder.append("&key=").append(apiKey_);

    String line = null;
    HttpURLConnection conn = null;
    BufferedReader reader = null;

    try {
      URL url = new URL(builder.toString().replace(" ", "+"));
      conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("GET");
      conn.connect();

      builder.setLength(0);
      reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
      while ( (line = reader.readLine()) != null ) {
        builder.append(line);
      }

      GoogleMapsGeocodeResponse response =
          (GoogleMapsGeocodeResponse) parser_.parseString(builder.toString(), GoogleMapsGeocodeResponse.class);
      if ( response == null ) {
        throw new Exception("Invalid response");
      }

      if ( ! "OK".equals(response.getStatus()) ) {
        throw new Exception(! SafetyUtil.isEmpty(response.getError_message()) ? response.getError_message() : "Invalid response");
      }

      GoogleMapsGeocodeResult[] results = response.getResults();
      if ( results == null || results.length == 0 ) {
        throw new Exception("Results not found");
      }

      GoogleMapsGeometry geometry = results[0].getGeometry();
      if ( geometry == null ) {
        throw new Exception("Unable to determine latitude and longitude");
      }

      GoogleMapsCoordinates coords = geometry.getLocation();
      if ( coords == null ) {
        throw new Exception("Unable to determine latitude and longitude");
      }

      // set latitude and longitude
      address.setLatitude(coords.getLat());
      address.setLongitude(coords.getLng());
      ((User) obj).setAddress(address);
    } catch (Throwable t) {
      t.printStackTrace();
    } finally {
      if ( reader != null ) {
        try { reader.close(); } catch (Throwable t) {}
      }

      if ( conn != null ) {
        conn.disconnect();
      }
    }

    return super.put_(x, obj);
  }
}
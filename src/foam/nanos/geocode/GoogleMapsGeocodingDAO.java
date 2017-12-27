/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.geocode;

import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.JSONParser;
import foam.nanos.auth.Address;
import foam.nanos.pool.FixedThreadPool;
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
  protected PropertyInfo prop_;
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

  public GoogleMapsGeocodingDAO(X x, String apiKey, PropertyInfo prop, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    this.apiKey_ = apiKey;
    this.prop_ = prop;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    final FObject result = super.put_(x, obj);

    ((FixedThreadPool) x.get("threadPool")).submit(x, new ContextAgent() {
      @Override
      public void execute(X x) {
        // don't geocode if no address property
        Address address = (Address) prop_.get(result);
        if ( address == null ) {
          return;
        }

        // check if address updated
        if ( address.getLatitude() != 0 && address.getLongitude() != 0 ) {
          FObject stored = getDelegate().find(result.getProperty("id"));
          if (stored != null && prop_.get(result) != null ) {
            Address storedAddress = (Address) prop_.get(result);
            // compare fields that are used to populate Google maps query
            if ( SafetyUtil.compare(address.getAddress(), storedAddress.getAddress()) == 0 &&
                SafetyUtil.compare(address.getCity(), storedAddress.getCity()) == 0 &&
                SafetyUtil.compare(address.getRegionId(), storedAddress.getRegionId()) == 0 &&
                SafetyUtil.compare(address.getPostalCode(), storedAddress.getPostalCode()) == 0 &&
                SafetyUtil.compare(address.getCountryId(), storedAddress.getCountryId()) == 0 ) {
              return;
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
          conn.setConnectTimeout(5 * 1000);
          conn.setRequestMethod("GET");
          conn.connect();

          builder.setLength(0);
          reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
          while ( (line = reader.readLine()) != null ) {
            builder.append(line);
          }

          GoogleMapsGeocodeResponse response = (GoogleMapsGeocodeResponse) getX().create(JSONParser.class)
              .parseString(builder.toString(), GoogleMapsGeocodeResponse.class);
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
          prop_.set(result, address);
          GoogleMapsGeocodingDAO.super.put_(x, result);
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
      }
    });

    return result;
  }
}

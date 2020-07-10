/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsGeocodingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.nanos.auth.Address',
    'foam.util.SafetyUtil',
    'org.apache.commons.io.IOUtils',

    'java.io.BufferedReader',
    'java.io.InputStreamReader',
    'java.net.HttpURLConnection',
    'java.net.URL'
  ],

  messages: [
    { name: 'INVALID_RESPONSE_ERROR_MSG', message: 'Invalid response' },
    { name: 'NOT_FOUND_ERROR_MSG', message: 'Results not found' },
    { name: 'GEOMETRY_ERROR_MSG', message: 'Unable to determine latitude and longitude' }
  ],

  constants: [
    {
      name: 'API_HOST',
      type: 'String',
      value: 'https://maps.googleapis.com/maps/api/geocode/json?address='
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'Object',
      name: 'prop',
      javaType: 'PropertyInfo'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
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
              setApiKey(apiKey);
              setProp(prop);
            }
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        final FObject result = super.put_(x, obj);

        ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( result == null ) {
              return;
            }
    
            // don't geocode if no address property
            FObject cloned = result.fclone();
            Address address = (Address) getProp().get(cloned);
            if ( address == null ) {
              return;
            }
    
            // check if address updated
            if ( address.getLatitude() != 0 && address.getLongitude() != 0 ) {
              FObject stored = getDelegate().find(cloned.getProperty("id"));
              if (stored != null && getProp().get(cloned) != null ) {
                Address storedAddress = (Address) getProp().get(cloned);
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
            builder.append("&key=").append(getApiKey());
    
            String line = null;
            HttpURLConnection conn = null;
    
            try {
              URL url = new URL(builder.toString().replace(" ", "+"));
              conn = (HttpURLConnection) url.openConnection();
              conn.setConnectTimeout(5 * 1000);
              conn.setRequestMethod("GET");
              conn.connect();
    
              builder.setLength(0);
              try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                while ( (line = reader.readLine()) != null ) {
                  builder.append(line);
                } 
              }
    
              GoogleMapsGeocodeResponse response = (GoogleMapsGeocodeResponse) getX().create(JSONParser.class)
                  .parseString(builder.toString(), GoogleMapsGeocodeResponse.class);
              if ( response == null ) {
                throw new java.lang.Exception(INVALID_RESPONSE_ERROR_MSG);
              }
    
              if ( ! "OK".equals(response.getStatus()) ) {
                throw new java.lang.Exception(! SafetyUtil.isEmpty(response.getError_message()) ? response.getError_message() : INVALID_RESPONSE_ERROR_MSG);
              }
    
              GoogleMapsGeocodeResult[] results = response.getResults();
              if ( results == null || results.length == 0 ) {
                throw new java.lang.Exception(NOT_FOUND_ERROR_MSG);
              }
    
              GoogleMapsGeometry geometry = results[0].getGeometry();
              if ( geometry == null ) {
                throw new java.lang.Exception(GEOMETRY_ERROR_MSG);
              }
    
              GoogleMapsCoordinates coords = geometry.getLocation();
              if ( coords == null ) {
                throw new java.lang.Exception(GEOMETRY_ERROR_MSG);
              }
    
              // set latitude and longitude
              address.setLatitude(coords.getLat());
              address.setLongitude(coords.getLng());
              getProp().set(cloned, address);
              GoogleMapsGeocodingDAO.super.put_(x, cloned);
            } catch (Throwable ignored) {
            } finally {
              IOUtils.close(conn);
            }
          }
        }, "GoogleMaps Geocoding DAO");
    
        return result;
      `
    }
  ]
});

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.geocode',
  name: 'GoogleMapsAddressParser',

  documentation: `
    Responsible for converting an address string to the FOAM address data structure.
    Returns a FOAM address taken from google maps best matching result.

    Providing a FOAM address will attempt to further populate the address object.

    Google maps autocomplete api has a hard time finding secondary units (Suite, Apt, Flr etc..).
    Some addresses return a response or a list of predictions but it's a rare occurance.
    We're handling this situation by parsing the address string to remove secondary units and their value,
    making the call then appending the secondary unit under the suite property of a FOAM address object.
  `,

  javaImports: [
    'foam.lib.json.JSONParser',
    'foam.nanos.auth.Address',
    'foam.nanos.geocode.GoogleMapsAddressComponent',
    'foam.nanos.geocode.GoogleMapsCredentials',
    'foam.nanos.geocode.GoogleMapsGeocodeResponse',
    'foam.nanos.geocode.GoogleMapsGeocodeResult',
    'foam.nanos.geocode.GoogleMapsPlacesPredictions',
    'foam.nanos.geocode.GoogleMapsPlacesResponse',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.io.InputStreamReader',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.Arrays',
    'java.util.LinkedList',
    'java.util.List',
    'org.apache.commons.io.IOUtils'
  ],

  constants: {
    API_HOST_AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=',
    API_HOST_PLACES: 'https://maps.googleapis.com/maps/api/geocode/json?place_id=',
  },

  methods: [
    {
      name: 'buildHttpRequest',
      args: [
        {
          name: 'builder',
          type: 'java.lang.StringBuilder'
        }
      ],
      type: 'java.lang.StringBuilder',
      javaCode: `
      String line = null;
      HttpURLConnection httpConnection = null;
      BufferedReader reader = null;

      try {
        URL url = new URL(builder.toString().replace(" ", "+"));
        httpConnection = (HttpURLConnection) url.openConnection();
        httpConnection.setConnectTimeout(5 * 1000);
        httpConnection.setRequestMethod("GET");
        httpConnection.connect();

        builder.setLength(0);
        reader = new BufferedReader(new InputStreamReader(httpConnection.getInputStream()));
        while ( (line = reader.readLine()) != null ) {
          builder.append(line);
        }

        return builder;
      } catch (Exception e) {
        throw new RuntimeException(e);
      } finally {
        IOUtils.closeQuietly(reader);
        IOUtils.close(httpConnection);
      }
      `
    },
    {
      name: 'buildURLString',
      args: [
        {
          class: 'String',
          name: 'paramValue'
        },
        {
          class: 'String',
          name: 'mapsUri'
        }
      ],
      type: 'java.lang.StringBuilder',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        StringBuilder builder = sb.append(mapsUri);
        builder.append(paramValue).append("&key=").append(getApiKey());
        
        return builder;
      `
    },
    {
      name: 'parseAddress',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'address',
          type: 'String'
        },
        {
          name: 'foamAddress',
          type: 'foam.nanos.auth.Address'
        }
      ],
      type: 'foam.nanos.auth.Address',
      javaCode: `
        if ( foamAddress != null ) {
          address = String.format( "%s %s %s %s %s %s",
              foamAddress.getSuite(),
              foamAddress.getAddress(),
              foamAddress.getCity(),
              foamAddress.getRegionId(),
              foamAddress.getCountryId(),
              foamAddress.getPostalCode()
          );
        }

        String[] affix = { "apt", "unit", "suite", "bsmt", "floor", "fl", "frnt", "key", "lowr", "dept", "lbby", "rm", "room", "ste", "dept", "space", "spc", "lot" };

        if ( SafetyUtil.isEmpty(address) ) {
          throw new RuntimeException("No address provided.");
        }

        if ( SafetyUtil.isEmpty(getApiKey()) ) {
          throw new RuntimeException("No API Key was provided.");
        }

        // Remove the suite affix from address to find location using maps api.
        String suite = null;
        List<String> addressList = null;
        String addressRequest = "";

        // FIX ME: This string parser can probably be improved to include use cases where suite value has characters included.
        for ( String separator : affix ) {
          String[] splitAddress = ((String) address).replace("#", "").toLowerCase().split("(?<=" + separator + "[ ]{0,9}+[0-9]{0,9}+)|(?=" + separator + "[0-9]{0,9}+)");
          if ( splitAddress.length > 1 ) {
            int suiteIndex = splitAddress[0].length() <= splitAddress[1].length() ? 0 : 1;
            suite = splitAddress[suiteIndex];
            addressList = new LinkedList<>(Arrays.asList(splitAddress));
            addressList.remove(addressList.get(suiteIndex));
            break;
          }
        }

        if ( addressList == null ) { addressRequest = address; }
        else {
          for ( String s : addressList ) {
            addressRequest += s;
          }
        }

        StringBuilder sb = buildURLString(addressRequest, (String) API_HOST_AUTOCOMPLETE);
        StringBuilder builder = buildHttpRequest(sb);

        GoogleMapsPlacesResponse response = (GoogleMapsPlacesResponse) getX().create(JSONParser.class)
            .parseString(builder.toString(), GoogleMapsPlacesResponse.class);

        if ( response == null ) {
          throw new RuntimeException("Invalid response");
        }
        
        if ( ! "OK".equals(response.getStatus()) ) {
          throw new RuntimeException(! SafetyUtil.isEmpty(response.getError_message()) ? response.getError_message() : "Invalid response");
        }

        // Grab detailed information on predicted address using place_id.
        GoogleMapsPlacesPredictions[] predictions = response.getPredictions();
        String placeId = predictions[0].getPlace_id();

        StringBuilder s = buildURLString(placeId, (String) API_HOST_PLACES);
        StringBuilder placesBuilder = buildHttpRequest(s);

        GoogleMapsGeocodeResponse result = (GoogleMapsGeocodeResponse) getX().create(JSONParser.class)
        .parseString(placesBuilder.toString(), GoogleMapsGeocodeResponse.class);

        if ( result == null ) {
          throw new RuntimeException("Invalid response");
        }
        
        if ( ! "OK".equals(result.getStatus()) ) {
          throw new RuntimeException(! SafetyUtil.isEmpty(result.getError_message()) ? result.getError_message() : "Invalid response");
        }

        GoogleMapsGeocodeResult[] mapResults = result.getResults();
        GoogleMapsAddressComponent[] addressComponents = mapResults[0].getAddress_components();
        Address completeAddress = constructAddress(addressComponents, suite, foamAddress);

        return completeAddress;
      `
    },
    {
      name: 'constructAddress',
      args: [
        {
          name: 'addressComponents',
          type: 'foam.nanos.geocode.GoogleMapsAddressComponent[]'
        },
        {
          class: 'String',
          name: 'suite'
        },
        {
          name: 'initialAddress',
          type: 'foam.nanos.auth.Address'
        }
      ],
      type: 'foam.nanos.auth.Address',
      javaCode: `
        Address newAddress = new Address();
        newAddress.setStreetNumber(getAddressComponent("street_number", addressComponents, false));
        newAddress.setStreetName((String) getAddressComponent("route", addressComponents, false));
        newAddress.setCity((String) getAddressComponent("locality", addressComponents, false));
        newAddress.setRegionId((String) getAddressComponent("administrative_area_level_1", addressComponents, true));
        newAddress.setCountryId((String) getAddressComponent("country", addressComponents, true));
        newAddress.setPostalCode((String) getAddressComponent("postal_code", addressComponents, false));
        String formattedSuite = ! SafetyUtil.isEmpty(suite) ? suite.substring(0, 1).toUpperCase() + suite.substring(1)
            .replaceAll("([^\\\\d-]?)(-?[\\\\d\\\\.]+)([^\\\\d]?)", "$1 $2 $3").replaceAll(" +", " ").trim() : null;
        newAddress.setSuite(formattedSuite);

        if ( initialAddress != null ) {
          newAddress.setAddress1(initialAddress.getAddress1());
          newAddress.setAddress2(initialAddress.getAddress2());
        }

        return newAddress;
      `
    },
    {
      name: 'getAddressComponent',
      args: [
        {

          class: 'String',
          name: 'type'
        },
        {
          name: 'addressComponents',
          type: 'foam.nanos.geocode.GoogleMapsAddressComponent[]'
        },
        {
          class: 'Boolean',
          name: 'shortName'
        }
      ],
      type: 'String',
      javaCode: `
        for ( GoogleMapsAddressComponent addressComponent : addressComponents ) {
          String[] addressType = addressComponent.getTypes();
          if ( Arrays.asList(addressType).contains(type)) {
            return shortName ? addressComponent.getShort_name() : addressComponent.getLong_name();
          }
        }
        return null;
      `
    },
    {
      name: 'getApiKey',
      type: 'String',
      javaCode: `
        GoogleMapsCredentials credentials = (GoogleMapsCredentials) getX().get("googleMapsCredentials");
        if ( credentials == null || SafetyUtil.isEmpty(credentials.getApiKey()) ) {
          Logger logger = (Logger) getX().get("logger");
          logger.error(this.getClass().getSimpleName(), "invalid credentials");
          throw new RuntimeException("Google maps invalid credentials");
        }
        return credentials.getApiKey();
      `
    }
  ]
});

key 5e8712586106b035a1b77be6315c7af2c9ced860     Find Bus Open Data
Home
Guide me
person-icon My account 
BETAThis is a new service – your feedback will help us to improve it.

Bus Open Data ServiceFind Bus Open DataGuide MeDeveloper documentation
Developer documentation
 Overview
 Quick start
 Data catalogue
 Data by operator or location
 Browse for specific data
 Downloading data
 Using the APIs
 API reference
 Data formats
 Maintaining quality data
 Case studies
 How to get help
API reference
The API reference contains details of API calls, query parameters and error codes. You can try out API calls in an interactive sandbox, Access interactive API.

All data API reference
You can use the call all data APIs in your code. This will provide all data currently available.

DataCall all data APIs
Timetableshttps://data.bus-data.dft.gov.uk/api/v1/dataset/?api_key=[API_KEY]
Bus locationhttps://data.bus-data.dft.gov.uk/api/v1/datafeed/?api_key=[API_KEY]
Fareshttps://data.bus-data.dft.gov.uk/api/v1/fares/dataset/?api_key=[API_KEY]
Timetables data API parameters
Data sets provided may contain multiple TransXChange files. Therefore, query parameters will return any data sets which contains at least one TransXChange file that satisfies your query parameters.

NameDescription
adminAreaadminArea is a field within the data, and therefore if any of the TransXChange files within a specific data set has the specified adminArea the whole data set will be returned. A list of adminAreas can be found on the NPTG website: https://data.gov.uk/dataset/3b1766bf-04a3-44f5-bea9-5c74cf002e1d/national-public-transport-gazetteer-nptg
endDateStartLimit results to data sets with services with end dates after this date. String formatted as YYYY-MM-DDTHH:MM:SS.
endDateEndLimit results to data sets with services with end dates before this date. String formatted as YYYY-MM-DDTHH:MM:SS.
limitThe maximum number of records to return.
modifiedDateLimit results to data sets that have been created/updated since the specified date. String formatted as YYYY-MM-DDTHH:MM:SS.
nocInput a comma separated list of National Operator Codes to limit results to data sets of the publishers associated to the specified National Operator Code. A publisher may have multiple National Operator Codes associated with it. Your response will include data for all National Operator Codes associated with that publisher. Not just those included in the query parameter. National Operator codes can be found on the Traveline website, https://www.travelinedata.org.uk/traveline-open-data/transport-operations/about-2/
offsetReturn results that match the query starting from the specified offset. e.g. &offset=10&limit=25 returns results from 11 to 35. The default is set to 0.
searchReturn data sets where the data set name, data set description, organisation name, or admin area name contain the specified value.
statusLimit results to data sets with the specified status String, accepted values are published, inactive.
startDateStartLimit results to data sets with services with start dates after this date. String formatted as YYYY-MM-DDTHH:MM:SS.
startDateEndLimit results to data sets with services with start dates before this date. String formatted as YYYY-MM-DDTHH:MM:SS.
datasetIDLimit results to a specific data set of a publisher using the data set ID.
dqRagLimit results to data sets with the specified String value, accepted values are red, amber, green.
bodsComplianceLimit results to data sets with the specified boolean value.
Fares data API parameters
Data sets provided may contain multiple NeTEx files. Therefore, query parameters will return all data sets which contain at least one NeTEx file that satisfied your query parameters.

NameDescription
nocInput a comma separated list of National Operator Codes to limit results to data sets of the publishers associated to the specified National Operator Code. A publisher may have multiple National Operator Codes associated with it. Your response will include data for all National Operator Codes associated with that publisher. Not just those included in the query parameter. National Operator codes can be found on the Traveline website, https://www.travelinedata.org.uk/traveline-open-data/transport-operations/about-2/ .
statusLimit results to data sets with the specified status. Accepted values are: published and inactive.
boundingBoxLimit results to fares data sets that contain information for the area within the rectangular boundingBox you set using co-ordinates: minLongitude, minLatitude, maxLongitude, maxLatitude.
limitThe maximum number of records to return.
offsetReturn results that match the query starting from the specified offset. e.g. &offset=10&limit=25 returns results from 11 to 35. The default is set to 0.
Bus location data API parameters
Bus location data is provided within feeds. The metadata query parameters here will only return the bus location data that satisfies your chosen parameters.

NameDescription
boundingBoxLimit results to bus location data with vehicle position within the rectangular bounding box you set using co-ordinates: minLongitude, minLatitude, maxLongitude, maxLatitude.
operatorRefLimit results to data feeds with the operatorRef. The National Operator Code is often used by publishers as the input for operatorRef, which can be found on the Traveline website, https://www.travelinedata.org.uk/traveline-open-data/transport-operations/about-2/
lineRefLimit results to bus location data with the specified Line Ref.
producerRefLimit results to bus location data with the specified Producer Ref.
originRefLimit results to bus location data with the specified Origin Ref. Inputs for Origin Ref are normally National Public Transport Access Nodes (NaPTAN), which can be found on the following website: https://data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/national-public-transport-access-nodes-naptan
destinationRefLimit results to bus location data with the specified Destination Ref. Inputs for Destination Ref are normally National Public Transport Access Nodes (NaPTAN), which can be found on the following website: https://data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/national-public-transport-access-nodes-naptan
vehicleRefLimit results to bus location data with the specified vehicleRef. The vehicleRef is a unique reference for the vehicle that is consistent and is generated by the vehicle equipment.
GTFS RT-specific API parameters:
NameDescription
routeIdLimit results to bus location data with the specific routeId.
startTimeAfterLimit results to bus location data with a start time after startTimeAfter.
startTimeBeforeLimit results to bus location data with a start time before startTimeBefore.
PreviousUsing the APIs
NextData formats
Other development resources
Github repo
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
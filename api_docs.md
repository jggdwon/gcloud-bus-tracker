Find Bus Open Data
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
Data formats
Timetables
Timetables data is available in the TransXChange format. This is an XML standard for exchanging bus schedules and related data. More information including schema guidance can be found on the TransXChange website https://www.gov.uk/government/collections/transxchange.

Where multiple TransXChange datasets exist for an operator, you can use the RevisionNumber to understand the sequence of datasets that have been supplied. This can be used alongside StartDate and EndDate values to allow you to identify which data is valid at any one time, and how datasets continue on from each other.

A processed output of the timetables data is also made available in GTFS format for those consumers who would find it useful. The General Transit Feed Specification (GTFS) is a data specification that allows public transit agencies to publish their transit data in a format that can be consumed by a wide variety of software applications. Today, the GTFS data format is used by thousands of public transport providers. More information on this can be found found here .

Fares data
Fares data is available in the NeTEx format. This is an XML standard developed during 2019 by industry standard leads to provide an interoperable format for the publication of fares data within the UK bus industry. NeTEx is a CEN standard that can be used to represent many aspects of a multi-modal transport network. The UK profile includes the elements related to fares for buses, for more information on the schema and profile use the following links:

http://netex.uk/farexchange/

http://www.transmodel-cen.eu/standards/netex/

Bus location data
Bus location data is available using the SIRI-VM profile shown in the table below. This is an XML standard for exchanging real time bus location information. More information including technical guidance on the SIRI-VM profile can be found on here.

SIRI-VM profileTypeMandatory in ProfileDescription
Produce refxsd: NMTOKEN refYesCodespace for dataset producer.
Vehicle RefStringYesReference to the Vehicle.
VehicleJourneyRefYesReference to the Vehicle journey.
Operator refxsd:NMTOKENYesReference to Operator in question (ID to the corresponding company in the timetable data).
Published line nameIntYesPublished line name for the line the vehicle is running on.
Line Refxsd:NMTOKENYesReference to the Line in question (ID to the corresponding object in the timetable data).
Direction RefStringYesDirection of the trip.
Origin refYesReference to the first stop on the vehicle’s trip.
Origin namexsd:stringYesReference to origin Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry).
Aimed departure timexsd:dateTimeYesThe schedule time of departure from the origin stop.
Destination refxsd:NMTOKENYesReference to destination Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry) NAPTAN stop.
Destination namexsd:stringYesName describing the destination of the departure.
Aimed arrival timexsd:dateTimeYesThe scheduled time of arrival at the destination stop.
Vehicle Location-Longitudexsd:decimalYesLongitude (-180 to 180).
Vehicle Location-Latitudexsd:decimalYesLatitude (-90 to 90).
Recorded at (/GPS timestamp)xsd:dateTimeYesTimestamp for when the dataset was created/published i.e. 2004-12-17T09:30:47-05:00.
SpeedYesSpeed of the vehicle in question.
Bearingxsd:floatCurrent compass bearing (direction of VehicleJourney).
Block refStringYesReference to the block of the vehicle running as defined by the running boards.
A processed output of bus location data is also made available in GTFS-RT format for those who wish to consume it. GTFS Realtime is a feed specification that allows public transportation agencies to provide realtime updates about their fleet to application developers. It is an extension to GTFS (General Transit Feed Specification), an open data format for public transportation schedules and associated geographic information. GTFS Realtime was designed around ease of implementation, good GTFS interoperability and a focus on passenger information. More information on this can be found here .

PreviousAPI reference
NextMaintaining quality data
Other development resources
Github repo
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
Find Bus Open Data
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
Data formats
Timetables
Timetables data is available in the TransXChange format. This is an XML standard for exchanging bus schedules and related data. More information including schema guidance can be found on the TransXChange website https://www.gov.uk/government/collections/transxchange.

Where multiple TransXChange datasets exist for an operator, you can use the RevisionNumber to understand the sequence of datasets that have been supplied. This can be used alongside StartDate and EndDate values to allow you to identify which data is valid at any one time, and how datasets continue on from each other.

A processed output of the timetables data is also made available in GTFS format for those consumers who would find it useful. The General Transit Feed Specification (GTFS) is a data specification that allows public transit agencies to publish their transit data in a format that can be consumed by a wide variety of software applications. Today, the GTFS data format is used by thousands of public transport providers. More information on this can be found found here .

Fares data
Fares data is available in the NeTEx format. This is an XML standard developed during 2019 by industry standard leads to provide an interoperable format for the publication of fares data within the UK bus industry. NeTEx is a CEN standard that can be used to represent many aspects of a multi-modal transport network. The UK profile includes the elements related to fares for buses, for more information on the schema and profile use the following links:

http://netex.uk/farexchange/

http://www.transmodel-cen.eu/standards/netex/

Bus location data
Bus location data is available using the SIRI-VM profile shown in the table below. This is an XML standard for exchanging real time bus location information. More information including technical guidance on the SIRI-VM profile can be found on here.

SIRI-VM profileTypeMandatory in ProfileDescription
Produce refxsd: NMTOKEN refYesCodespace for dataset producer.
Vehicle RefStringYesReference to the Vehicle.
VehicleJourneyRefYesReference to the Vehicle journey.
Operator refxsd:NMTOKENYesReference to Operator in question (ID to the corresponding company in the timetable data).
Published line nameIntYesPublished line name for the line the vehicle is running on.
Line Refxsd:NMTOKENYesReference to the Line in question (ID to the corresponding object in the timetable data).
Direction RefStringYesDirection of the trip.
Origin refYesReference to the first stop on the vehicle’s trip.
Origin namexsd:stringYesReference to origin Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry).
Aimed departure timexsd:dateTimeYesThe schedule time of departure from the origin stop.
Destination refxsd:NMTOKENYesReference to destination Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry) NAPTAN stop.
Destination namexsd:stringYesName describing the destination of the departure.
Aimed arrival timexsd:dateTimeYesThe scheduled time of arrival at the destination stop.
Vehicle Location-Longitudexsd:decimalYesLongitude (-180 to 180).
Vehicle Location-Latitudexsd:decimalYesLatitude (-90 to 90).
Recorded at (/GPS timestamp)xsd:dateTimeYesTimestamp for when the dataset was created/published i.e. 2004-12-17T09:30:47-05:00.
SpeedYesSpeed of the vehicle in question.
Bearingxsd:floatCurrent compass bearing (direction of VehicleJourney).
Block refStringYesReference to the block of the vehicle running as defined by the running boards.
A processed output of bus location data is also made available in GTFS-RT format for those who wish to consume it. GTFS Realtime is a feed specification that allows public transportation agencies to provide realtime updates about their fleet to application developers. It is an extension to GTFS (General Transit Feed Specification), an open data format for public transportation schedules and associated geographic information. GTFS Realtime was designed around ease of implementation, good GTFS interoperability and a focus on passenger information. More information on this can be found here .

PreviousAPI reference
NextMaintaining quality data
Other development resources
Github repo
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
Find Bus Open Data
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
Data Catalogue
The data catalogue zip contains a series of CSVs which gives a machine-readable overview of all the data that resides in BODS currently.

Note that the data catalogue only covers the data from primary data sources on BODS which is timetables data in TransXChange format, bus location data in SIRI-VM format and fares data in NeTEx format. Other non-primary data on BODS (e.g GTFS converted forms) are not represented on the data catalogue.

The data catalogue zip contains 7 distinct CSVs:


Overall data catalogue: this contains a high-level overview of all the static data on BODS: timetables and fares data.
Timetables data catalogue: this contains a detailed granular view of the timetables data within BODS. It also contains a detailed mapping of the BODS timetables data with the data from the Office of the Traffic Commissioner (OTC).
Fares data catalogue: this contains a detailed granular view of the fares data within BODS.
Disruptions data catalogue: this contains a detailed view of all of the disruptions active and pending within BODS.
Organisations data catalogue: this contains helpful counts of data at an organisation level.
Location data catalogue: this contains an overview of the location data within BODS.
Operator NOC data catalogue: this describes all organisations on BODS and the National Operator Codes (NOCs) that are associated with them.
Field definitions:
The data catalogue contains certain fields the definitions and explanations of which can be found below.

Overall data catalogue:
Field nameDefinition
OperatorThe name of the operator/publisher providing data on BODS.
Operator IDThe internal BODS generated ID of the operator/publisher providing data on BODS.
Profile NOCsThe National Operator Codes for the particular publisher as extracted from their BODS profile.
Data TypeThe type of data being published.
StatusThe publication status of the data set/feed.
Last UpdatedThe date that the data set/feed was last updated on BODS.
File NameThe exact name of the file provided to BODS. This is usually generated by the publisher or their supplier
XML File NameThe value of the FileName attribute in the TransXChange or NeTEx file.
Data IDThe internal BODS generated ID of the data set / feed provided to BODS.
ModeThe mode of transport as extracted from the TransXChange file they provided.
National Operator CodeThe National Operator Code(s) for the particular publisher as extracted from the TransXChange or NeTEx file they provided.
Service CodeThe ServiceCode for the particular publisher as extracted from the TransXChange file they provided.
Line NameThe line name(s) for the particular publisher as extracted from the TransXChange or NeTEx file they provided.
Licence NumberThe License number(s) as extracted from the files provided by the operator/publisher to BODS.
Public Use FlagThe Public Use Flag element as extracted from the files provided by the operator/publisher to BODS.
Revision NumberThe service revision number date as extracted from the files provided by the operator/publisher to BODS.
Operating Period Start DateThe operating period start date as extracted from the files provided by the operator/publisher to BODS.
Operating Period End DateThe operating period end date as extracted from the files provided by the operator/publisher to BODS.
% AVL to Timetables feed matching scoreThe latest score for the active AVL feed this row belongs to (Data ID).
Latest matching report URLThis will be the same report url as the AVL data feed page report url from the dataset review page.
Timetables data catalogue:
Field nameDefinition
XML:Service CodeThe ServiceCode(s) as extracted from the files provided by the operator/publisher to BODS.
XML:Line NameThe line name(s) as extracted from the files provided by the operator/publisher to BODS.
Requires AttentionNo:
Default state for correctly published services, will be “No” unless any of the logic below is met.

Yes:
Yes If OTC status = Registered and Scope Status = In scope and Seasonal Status ≠ Out of season and Published Status = Unpublished.
Yes if OTC status = Registered and Scope Status = In scope and Seasonal Status ≠ Out of season and Published Status = Published and Timeliness Status ≠ Up to date.
Published StatusPublished: Published to BODS by an Operator/Agent.

Unpublished: Not published to BODS by an Operator/Agent.
OTC StatusRegistered: Registered and not cancelled within the OTC database.

Unregistered: Not Registered within the OTC.
Scope StatusIn scope: Default status for services registered with the OTC and other enhanced partnerships.

Out of Scope: Service code has been marked as exempt by the DVSA or the BODS team.
Seasonal StatusIn season: Service code has been marked as seasonal by the operator or their agent and todays date falls within the relevant date range for that service code.

Out of Season: Service code has been marked as seasonal by the operator or their agent and todays date falls outside the relevant date range for that service code.

Not Seasonal: Default status for published or unpublished servicesto BODS.
Assumed Not seasonal unless service code has been marked with a date range within the seasonal services flow.
Timeliness StatusUp to date: Default status for service codes published to BODS.

Timeliness checks are evaluated in this order:

1) OTC Variation not published:
If 'XML:Last modified date' is earlier than 'Date OTC variation needs to be published'
and
'Date OTC variation needs to be published'is earlier than today's date.
and
No associated data has been published.
NB there are two association methods:
Method 1:
Data for that service code has been updated within 70 days before the OTC variation effective date.
Method 2:
Data for that service code has been updated with a 'XML:Operating Period Start Date' which equals OTC variation effective date.

2) 42 day look ahead is incomplete:
If not out of date due to 'OTC variation not published'
and
'XML:Operating Period End Date' is earlier than 'Date for complete 42 day look ahead'.

3) Service hasn't been updated within a year:
If not out of date due to '42 day lookahead is incomplete' or 'OTC variation not published'
and
'Date at which data is 1 year old' is earlier than today's date.
Organisation NameThe name of the operator/publisher providing data on BODS.
Data set IDThe internal BODS generated ID of the dataset that contains the data for this row.
Date OTC variation needs to be publishedOTC:Effective date from timetable data catalogue minus 42 days.
Date for complete 42 day look aheadToday's date + 42 days.
Date when data is over 1 year old'XML:Last Modified date' from timetable data catalogue plus 12 months.
Date seasonal service should be publishedIf Seasonal Start Date is present, then Seasonal Start Date minus 42 days, else null.
Seasonal Start DateIf service has been assigned a date range from within the seasonal services flow, then take start date, else null.
Seasonal End DateIf service has been assigned a date range from within the seasonal services flow, then take end date, else null.
XML:FilenameThe exact name of the file provided to BODS. This is usually generated by the publisher or their supplier.
XML:Last Modified DateDate of last modified file within the service codes dataset.
XML:National Operator CodeThe National Operator Code(s) as extracted from the files provided by the operator/publisher to BODS.
XML:Licence NumberThe License number(s) as extracted from the files provided by the operator/publisher to BODS.
XML:Public Use FlagThe Public Use Flag element as extracted from the files provided by the operator/publisher to BODS.
XML:Revision NumberThe service revision number date as extracted from the files provided by the operator/publisher to BODS.
XML:Operating Period Start DateThe operating period start date as extracted from the files provided by the operator/publisher to BODS.
XML:Operating Period End DateThe operating period end date as extracted from the files provided by the operator/publisher to BODS.
OTC:OriginThe origin element as extracted from the files provided by the operator/publisher to BODS.
OTC:DestinationThe destination element as extracted from the files provided by the operator/publisher to BODS.
OTC:Operator IDThe operator ID element as extracted from the OTC database.
OTC:Operator NameThe operator name element as extracted from the OTC database.
OTC:AddressThe address as extracted from the OTC database.
OTC:Licence NumberThe licence number element as extracted from the OTC database.
OTC:Licence StatusThe licence status element as extracted from the OTC database.
OTC:Registration NumberThe registration number element as extracted from the OTC database.
OTC:Service Type DescriptionThe service type description element as extracted from the OTC database.
OTC:Variation NumberThe variation number element as extracted from the OTC database.
OTC:Service NumberThe service number element as extracted from the OTC database.
OTC:Start PointThe start point element as extracted from the OTC database.
OTC:Finish PointThe finish point element as extracted from the OTC database.
OTC:ViaThe via element as extracted from the OTC database.
OTC:Granted DateThe granted date element as extracted from the OTC database.
OTC:Expiry DateThe expiry date element as extracted from the OTC database.
OTC:Effective DateThe effective date element as extracted from the OTC database.
OTC:Received DateThe received date element as extracted from the OTC database.
OTC:Service Type Other DetailsThe service type other details element as extracted from the OTC database.
Traveline RegionThe Traveline Region details element as extracted from the OTC database.
Local Transport AuthorityThe Local Transport Authority element as extracted from the OTC database.
Fares data catalogue:
Field nameDefinition
Dataset IDThe internal BODS generated ID of the operator/publisher providing data on BODS.
XML file nameThe exact name of the file provided to BODS. This is usually generated by the publisher or their supplier.
Organisation NameThe name of the operator/publisher providing data on BODS.
National Operator CodeThe National Operator Code(s) for the particular publisher as extracted from the NeTEx file they provided.
Operator IDThe internal BODS generated ID of the operator/publisher providing data on BODS.
BODS CompliantThe validation status and format of the files provided by the operator/publisher to BODS.
Last updated dateThe date that the data set/feed was last updated on BODS.
Valid fromThe operating period start date as extracted from the files provided by the operator/publisher to BODS.
Valid toThe operating period end date as extracted from the files provided by the operator/publisher to BODS.
Line idsThe Line id(s) as extracted from the files provided by the operator/publisher to BODS.
Line NameThe line name(s) as extracted from the files provided by the operator/publisher to BODS.
ATCO AreaThe ATCO Area (s) extracted from the ScheduledStopPoints in the files provided by the operator/publisher to BODS.
TariffBasisThe TariffBasis element as extracted from the files provided by the operator/publisher to BODS.
ProductTypeThe ProductType element as extracted from the files provided by the operator/publisher to BODS.
ProductNameThe Name element within PreassignedFareProduct as extracted from the files provided by the operator/publisher to BODS.
UserTypeThe origin element as extracted from the files provided by the operator/publisher to BODS.
MultioperatorStatus derived from comparing the BODS organisation of publisher and the National Operator Codes extracted from the files provided by the operator/publisher to BODS.
Disruptions data catalogue:
Field nameDefinition
OrganisationThe name of the organisation publishing the disruptions data.
Situation NumberThe internal BODS generated ID of the disruption.
Validity Start DateThe start date of the disruption provided by the publisher to BODS.
Validity End DateThe end date of the disruption provided by the publisher to BODS.
Publication Start DateThe start date of the publication window for the disruption provided by the publisher to BODS.
Publication End DateThe end date of the publication window for the disruption provided by the publisher to BODS.
ReasonThe reason for the disruption provided by the publisher to BODS.
PlannedThe planned or unplanned nature of the disruption provided to the publisher to BODS.
Modes AffectedThe modes of public transport affected by the disruption.
Operators AffectedThe operators of services affected by the disruption.
Services AffectedThe total number of services affected by the disruption.
Stops AffectedThe total number of stops affected by the disruption.
Organisations data catalogue:
Field nameDefinition
NameThe name of the operator/publisher providing data on BODS
StatusThe registration status of the operator/publisher on BODS. 'Active' are signed up on BODS, 'Inactive' no longer have functioning accounts on BODS, 'Pending Invite' still haven't signed up and 'Not yet invited' have been added to BODS but not yet invited to complete the full sign up procedure
Date Invite AcceptedThe date at which the operator/publisher accepted their invite and signed up
Organisation creation dateThe date at which the Operator/publisher organisation are added to BODS which may or may not be the same date as the invited date.
Date InvitedThe date at which they were originally invited to sign up to BODS
Last Log-InThe last time there was activity for the operator/publisher on BODS.
Permit HolderThe permit status as declared by operator/publisher in the Organisation profile section on BODS (Permit holder is 'Yes' if the user clicks the tickbox of 'I don't have a PSV license number')
National Operator CodesThe National Operator Codes of the operator/ publisher as declared by them in the Organisation Profile section on BODS.
Licence NumbersThe Licence number(s) of the operator/publisher as declared by them in the Organisation Profile section on BODS.
Number of LicencesThe total count of services of the operator/publisher as declared by them in the Organisation Profile section on BODS. This informs us to understand the total number of licence numbers the organisation is representing.
Unregistered ServicesThe total number of unregistered services (UZ declared in ServiceCode field) are published in total by the operator/publisher to BODS.
OTC Registered ServicesThe total count of services of the operator/publisher as extracted from the database of the Office of the Traffic Commissioner (OTC). This informs us to understand the total number of services expected to be published from the licences associated in the organisational profile.
Out of scope services(exempted)The total number of registered services that have been marked as exempt from publishing to BODS by the DVSA/DfT admin user.
Registered Services in scope(for BODS)The total number of in scope, registered services for the organisation that require data in BODS
Registered Services PublishedThe total number of registered services that an organisation has published.
Compliant Registered Services PublishedThe total number of compliant, in scope, registered services are published in total by the operator/publisher to BODS.
% Compliant Registered Services PublishedThe percentage of an organisation's in scope, registered services that are PTI compliant.
Number of School or Works ServicesThe total count of school or works services of the operator/publisher as extracted from the database of the Office of the Traffic Commissioner (OTC). This informs us to understand the total number of services expected to be published from the licences associated in the organisational profile that are 'School or Works'.
School or Works Services SubsidisedThe total count of school or works services that are subsidised for the operator/publisher as extracted from the database of the Office of the Traffic Commissioner (OTC). This informs us to understand the total number of services expected to be published from the licences associated in the organisational profile that are 'School or Works' and are fully subsidised (Yes).
School or Works Services Subsidised In PartThe total count of school or works services that are subsidised in part for the operator/publisher as extracted from the database of the Office of the Traffic Commissioner (OTC). This informs us to understand the total number of services expected to be published from the licences associated in the organisational profile that are 'School or Works' and are in part subsidised (In Part).
Flexible RegistrationThe total count of flexible services for the operator/publisher as extracted from the database of the Office of the Traffic Commissioner (OTC). This informs us to understand the total number of services expected to be published from the licences associated in the organisational profile that are 'Flexible' services, so we can prepare organisations for this technical implementation.
Number of Published Services with Valid Operating DatesThe total number of services published on BODS that have a valid operating period today.
Additional Published Services with Future Start DateThe total number of additional published services that have future start dates on BODS. This informs us to understand the additional number of new services codes that will become valid in the future, which is just a difference to the total already provided, to give an indicator to services that are published but not valid now.
Number of Published Timetable DatasetsThe total number of published timetables datasets provided by the operator/publisher to BODS.
Number of Published AVL DatafeedsThe total number of published location data feeds provided by the operator/publisher to BODS.
Number of Published Fare DatasetsThe total number of published fares datasets provided by the operator/publisher to BODS.
% Compliant Published Fare DatasetsThe percentage of an organisation's published fare datasets that are BODS compliant.
Number of Pass ProductsThe total number of pass products as extracted from the files provided by the operator/publisher to BODS.
Number of Trip ProductsThe total number of trip limited products as extracted from the files provided by the operator/publisher to BODS.
% Operator overall AVL to Timetables matching scoreThe overall score for an operator as per ‘Review my location data’ blue dashboard for an operator.
Archived matching reports URLThe same archived reports url as the ‘Review my location data’ blue dashboard for an operator in Download all archived matching reports.
Location data catalogue:
Field nameDefinition
Organisation NameThe name of the operator/publisher providing data on BODS.
Datafeed IDThe internal BODS generated ID of the operator/publisher providing data on BODS.
% AVL to Timetables feed matching scoreThis will be the latest score for the AVL feed this row belongs to (Data ID).
Latest matching report URLThis will be the same report url as the AVL data feed page report url from the dataset review page.
Operator NOC data catalogue:
Field nameDefinition
OperatorThe name of the operator on BODS.
NOCThe National Operator Code (NOC) that is associated with that operator on BODS.
PreviousQuick start
NextData by operator or location
Other development resources
Github repo
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
Find Bus Open Data
Home
Guide me
person-icon My account 
BETAThis is a new service – your feedback will help us to improve it.

Bus Open Data ServiceFind Bus Open DataAPI servicesTimetables data API
Timetables data API
You can use the interactive documentation to customise your API response using the available query parameters. If you are registered and logged in, you will be given a full response. Otherwise you will be given an example response.

You can also download the timetables OpenAPI specification.

Ready to use the API?
View developer documentation

First time API user?
Guide me

Timetables data API
 1.0.0 
OAS 3.0
timetables
Interact with timetable datasets



GET
/api/v1/dataset
Find timetables


GET
/api/v1/dataset/{datasetID}
Find dataset by ID


Schemas
TimetableResponse{
count[...]
next[...]
previous[...]
results[...]
}
Timetable{
id[...]
created[...]
modified[...]
operatorName[...]
noc[...]
name[...]
description[...]
comment[...]
status[...]
url[...]
extension[...]
lines[...]
firstStartDate[...]
firstEndDate[...]
lastEndDate[...]
adminAreas[...]
localities[...]
dqScore[...]
dqRag[...]
bodsCompliance[...]
}
AdminArea
Locality{
gazetter_id[...]
name[...]
}
ErrorResponse{
detail[...]
}
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
Find Bus Open Data
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
Data formats
Timetables
Timetables data is available in the TransXChange format. This is an XML standard for exchanging bus schedules and related data. More information including schema guidance can be found on the TransXChange website https://www.gov.uk/government/collections/transxchange.

Where multiple TransXChange datasets exist for an operator, you can use the RevisionNumber to understand the sequence of datasets that have been supplied. This can be used alongside StartDate and EndDate values to allow you to identify which data is valid at any one time, and how datasets continue on from each other.

A processed output of the timetables data is also made available in GTFS format for those consumers who would find it useful. The General Transit Feed Specification (GTFS) is a data specification that allows public transit agencies to publish their transit data in a format that can be consumed by a wide variety of software applications. Today, the GTFS data format is used by thousands of public transport providers. More information on this can be found found here .

Fares data
Fares data is available in the NeTEx format. This is an XML standard developed during 2019 by industry standard leads to provide an interoperable format for the publication of fares data within the UK bus industry. NeTEx is a CEN standard that can be used to represent many aspects of a multi-modal transport network. The UK profile includes the elements related to fares for buses, for more information on the schema and profile use the following links:

http://netex.uk/farexchange/

http://www.transmodel-cen.eu/standards/netex/

Bus location data
Bus location data is available using the SIRI-VM profile shown in the table below. This is an XML standard for exchanging real time bus location information. More information including technical guidance on the SIRI-VM profile can be found on here.

SIRI-VM profileTypeMandatory in ProfileDescription
Produce refxsd: NMTOKEN refYesCodespace for dataset producer.
Vehicle RefStringYesReference to the Vehicle.
VehicleJourneyRefYesReference to the Vehicle journey.
Operator refxsd:NMTOKENYesReference to Operator in question (ID to the corresponding company in the timetable data).
Published line nameIntYesPublished line name for the line the vehicle is running on.
Line Refxsd:NMTOKENYesReference to the Line in question (ID to the corresponding object in the timetable data).
Direction RefStringYesDirection of the trip.
Origin refYesReference to the first stop on the vehicle’s trip.
Origin namexsd:stringYesReference to origin Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry).
Aimed departure timexsd:dateTimeYesThe schedule time of departure from the origin stop.
Destination refxsd:NMTOKENYesReference to destination Quay in question (ID to the corresponding Quay in the timetable data and national stop place registry) NAPTAN stop.
Destination namexsd:stringYesName describing the destination of the departure.
Aimed arrival timexsd:dateTimeYesThe scheduled time of arrival at the destination stop.
Vehicle Location-Longitudexsd:decimalYesLongitude (-180 to 180).
Vehicle Location-Latitudexsd:decimalYesLatitude (-90 to 90).
Recorded at (/GPS timestamp)xsd:dateTimeYesTimestamp for when the dataset was created/published i.e. 2004-12-17T09:30:47-05:00.
SpeedYesSpeed of the vehicle in question.
Bearingxsd:floatCurrent compass bearing (direction of VehicleJourney).
Block refStringYesReference to the block of the vehicle running as defined by the running boards.
A processed output of bus location data is also made available in GTFS-RT format for those who wish to consume it. GTFS Realtime is a feed specification that allows public transportation agencies to provide realtime updates about their fleet to application developers. It is an extension to GTFS (General Transit Feed Specification), an open data format for public transportation schedules and associated geographic information. GTFS Realtime was designed around ease of implementation, good GTFS interoperability and a focus on passenger information. More information on this can be found here .

PreviousAPI reference
NextMaintaining quality data
Other development resources
Github repo
Cookies Contact Accessibility Privacy
Built by the Department for Transport

 All content is available under the Open Government Licence v3.0, except where otherwise stated
© Crown copyright
Timetables data API
 1.0.0 
OAS 3.0
timetables
Interact with timetable datasets



GET
/api/v1/dataset
Find timetables

Returns all timetables

Parameters
Try it out
NameDescription
adminArea
array<string>
(query)
Limit results to datasets with services that stop within the specified area(s). The adminAreas entered will be inserted into a comma delimited query in the API.

060
205
noc
array<string>
(query)
Limit results to data sets published by an operator identified by the specified National Operator Code (NOC). The NOCs entered will be inserted into a comma delimited query in the API.

SCGH
SCLI
limit
integer($int64)
(query)
The maximum number of records to return. The default value shown is 25.

25
offset
integer($int64)
(query)
Return results that match the query starting from the specified offset e.g. If the offset=10 and limit=25, then results from 11 to 35 will be returned. The default value shown is 0.

0
search
string
(query)
Return data sets where the data set name, data set description, organisation name, or admin area name contain the specified value.

Stagecoach
status
string
(query)
Limit results to data sets with the specified status.

Available values : published, inactive


published
endDateStart
string($date-time)
(query)
Limit results to data sets with services with end dates after this date.

2021-01-01T12:45:00
endDateEnd
string($date-time)
(query)
Limit results to data sets with services with end dates before this date.

2021-01-01T12:45:00
modifiedDate
string($date-time)
(query)
Limit results to data sets that have been created/updated since the specified date.

2021-01-01T12:45:00
startDateStart
string($date-time)
(query)
Limit results to data sets with services with start dates after this date.

2021-01-01T12:45:00
startDateEnd
string($date-time)
(query)
Limit results to data sets with services with start dates before this date.

2021-01-01T12:45:00
dqRag
string
(query)
Limit results to data sets with the specified String.

Available values : red, amber, green


green
bodsCompliance
boolean
(query)
Limit results to data sets with the specified boolean value.


true
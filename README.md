# Location Based Quiz - Setup and Server
The  aim of this project is to create a location based quiz mobile app, in which the users location is a key component to answer the questions. 
Bitvise is used as a FTP, repositories have been created for both
 quiz: QuizApp link: https://github.com/EGwebbing/Quiz
 Questions WebApp link: https://github.com/EGwebbing/Questions 
 
### Implementation details

The mobile app is built using Adobe PhoneGap, an open-source distribution of Cordova. 
Available for download at:
http://docs.phonegap.com/getting-started/1-install-phonegap/desktop/

The app uses the Leaflet API, an open-source Javascript library, available at:
https://leafletjs.com/download.html

The app design uses the Google Material Design Lite template, available at:
https://getmdl.io


## Deploy
Phonegap V.7.1.1 as a deployment of the client side applications

## Hardware
Server
- a database server and a webserver are needed.

Client
- a mobile device

Client
- Since the apps are deployed using phonegap, the applications are designed to be platform independent; however they have only been tested Android v.7 and v.8

## Certificate
HTTP certificate used 
Since this system is served via https protocol, a SSL certificate is needed. However the code could be adapted to serve via http protocol.

# To further develop the application
## Languages used
Server
- JavaScript (NodeJS)
- SQL Query

Client
- HTML (for the structure)
- CSS (for styling)
- JavaScript (for actions)


## Installation guide
### Server
First,  clone the follwing github repository using the following command in bash.
```
git clone https://github.com/EGwebbing/Server
```
Move into the server respository.
```
cd Server
```
And finally start running the server.
```
node httpServer.js &
```

### Question Application
Now clone this repository, follow (https://github.com/EGwebbing/Questions .
```
git clone https://github.com/EGwebbing/Questions
```
Next, ensure your httpServer.js is running, as per previous instructions.
```
Intialise phonegap from the 'ucesegr' folder within the questions repository.
```
cd ..
cd Questions
cd ucesegr
phonegap serve
```
View the web application here: https://build.phonegap.com/apps/3163860/share

### Quiz Application
Access this mobile application via **[this](https://build.phonegap.com/apps/3154790/share  link 
You must have developer settings turned on, see https://developer.android.com/studio/debug/dev-option guide.

![alt text](https://github.com/RJHCarto/Server/blob/master/AppQR.png)

Next, ensure your httpServer.js is running, as per previous instructions.
```
cd Server
node httpServer.js 
```
You will now be able to open the application in Android. 
Access the user guide in app to find out how it works.

## Repositories of interest
Links to the following tools used for this application:
- **[Node.js](https://github.com/nodejs)**
- **[PhoneGap](https://github.com/phonegap)**
- **[Material Design Lite](https://github.com/google/material-design-lite)**
- **[Leaflet](https://github.com/Leaflet/Leaflet)**

TrovaTreno
==========

A simple __FirefoxOS__ app that helps you to find the information you need about __Italian trains__.

![Imgur](http://i.imgur.com/6AVEbT0.png)


"API" for devs
--------------

This app expose a WebActivity to let other apps display informations about trains timetable.

```js
var activity = new MozActivity({
    name: "view",
    data: {
    	type: "show_train_info", // the type of activity we implemented
    	train_number: 9466  // place the train number here
    }
});
```

this will open an overlay displaying the train information (from station, to station, last seen at, is it running late), the user can close the overlay when done and your app will be right there where the user left it.

"API" docs
----------

The `train_number` argument will be validate and then passed to the app to show, make sure it is 4 numbers long otherwise the activity won't even start.

Link to Marketplace
-------------------
[https://marketplace.firefox.com/app/trovatreno](https://marketplace.firefox.com/app/trovatreno)

Link to APK version
-------------------
[http://bit.ly/1nd38Cg](http://bit.ly/1nd38Cg)

Note that you have to install Firefox on your Android in order to use this application.
This is because it works on Firefox framework.
Please use the [stable version](http://bit.ly/1qeu1uG) of Firefox, not the Beta one.

To-Do
----
- Multilanguage
- Notifications
- [DONE!] catch if the app is running on Android or in Firefox OS

Known bugs
----------
- scrolling bug in Firefox for Android version (due to a Building Blocks issue)
- due to an Italo website issue the app can only shows Italo trains are actually travelling
- [CORRECTED!] delegating to email and browser apps in Firefox for Android version

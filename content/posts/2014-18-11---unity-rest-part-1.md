---
title: Unity REST - Part One
date: "2014-11-18T22:40:32.169Z"
template: "post"
draft: false
slug: "/unity-rest-part-one/"
category: "Unity"
description: "While developing a game, there a number of reasons why you would want to connect to a server. Downloading new assets, such as models, or collecting data from an external source. Downloading bundle assets can be done through your own server, which allows your game to connect to a server and download the most recent versions of bundle assets."
---

As seen on Packt Publishing.](https://www.packtpub.com/books/content/using-rest-api-unity-part-1-what-rest-and-basic-queries)

## What is REST and Basic Queries?

## Introduction
While developing a game, there a number of reasons why you would want to connect to a server. Downloading new assets, such as models, or collecting data from an external source. Downloading bundle assets can be done through your own server, which allows your game to connect to a server and download the most recent versions of bundle assets.

Suppose your game also allowed users to see if that item was available at amazon, and for what price? If we had the sku number available, we could connect to Amazon's api, and check the price and availability of that item. The most common way to connect to external API's these days, is through a RESTful API.

## What is a REST API
A [RESTful api](http://en.wikipedia.org/wiki/Representational_state_transfer) is a common approach to creating scalable web services. It provides users with endpoints to collect and create data using the same HTTP calls to collect web pages (GET, POST, PUT, DELETE). For example, a url like www.fake.com/users could return a JSON of User data. Of course, there is often more security involved with these calls, but this is a good starting point.

Once you begin understanding REST api's, it becomes very second nature to query them. Before doing anything in code, you can try a query! Go to the browser and go to the url: http://jsonplaceholder.typicode.com/posts. You should be returned a JSON of some post data. You can see REST endpoints in action already. Your browser posted a GET request to the /posts endpoint, which returns all the posts. What if we want just a specific post? The standard way to do this is to add the id of the post next. Like this: http://jsonplaceholder.typicode.com/posts/1. You should get just a single post this time. Great!

Often when I'm building my unity scripts to connect to a REST endpoint, I'll frequently use this site to test on, before I move to the actual REST endpoints I want!

## Setting up your own server
Setting up our own server is a bit out of the scope of this article. In previous projects, I've used a framework like [Sails JS](http://sailsjs.org/#!/) to create a Node Server, with REST endpoints

## Parsing JSON in Unity

### Basic REST
One of the worst parts of query REST data is the parsing in Unity. Compared to parsing JSON on the web, Unity's parsing can feel tricky. The primary tool I use to make life a little easier is called SimpleJSON. It allows us to create JSON objects in C#, which we can use to build or read JSON data, and then manipulate them to our need. I won't be going into detail on how to use SimpleJSON, as much as just using the data retrieved from it. For further reading, I recommend looking at their [documentation](http://wiki.unity3d.com/index.php/SimpleJSON).

For example, let's assume I wanted to upload a list of products to a server from my unity project, without the game running (in editor). Assuming we collected the data from our game and its currently residing in a json file, lets see the code on how we can upload this data to the server from unity.

```csharp
string productlist = File.ReadAllText(Application.dataPath + "/Resources/AssetBundles/" + "AssetBundleInfo.json");
UploadProductListJSON(productList);

static void UploadProductListJSON(string data) {
Debug.Log (data);
WWWForm form = new WWWForm();

form.AddField("productlist", data);
WWW www = new WWW("localhost:1337/product/addList", form);
}
```

So we pass the collected data to a function that will create a new form, add the data to that form and then use the WWW variable to upload our form to the server. This will use the POST request
to add new data. Now I should not, we normally don't want to create a different end point to add data, such as /addList. I could have added my data one at a time, and used the standard REST end point (/product). This would likely be the cleaner solution, but for the sake of simplicity, I've added an endpoint that accepts a list of data.

### Bulding REST Factories for In Game REST Calls

Rather then having random scripts containing API calls, I recommend following the standard web procedure and building REST factories. Scripts with the sole purpose of querying rest endpoints. When contacting a server from in game, the standard approach is to use a coroutine, as to not lock your game on the thread. Let's take a look at the standard DB factory I use.

```csharp
private string results;

public String Results {
get {
return results;
}
}

public WWW GET(string url, System.Action onComplete ) {

WWW www = new WWW (url);
StartCoroutine (WaitForRequest (www, onComplete));
return www;
}

public WWW POST(string url, Dictionary<string,string> post, System.Action onComplete) {
WWWForm form = new WWWForm();

foreach(KeyValuePair<string,string> post_arg in post) {
form.AddField(post_arg.Key, post_arg.Value);
}

WWW www = new WWW(url, form);

StartCoroutine(WaitForRequest(www, onComplete));
return www;
}

private IEnumerator WaitForRequest(WWW www, System.Action onComplete) {
yield return www;
// check for errors
if (www.error == null) {
results = www.text;
onComplete();
} else {
Debug.Log (www.error);
}
}
```

*The url data here would be something like our example above: http://jsonplaceholder.typicode.com/posts. The System.Action OnComplete is a callback to be called once the action is complete.*

This will normally be some method that requires the downloaded data. In both our GET and POST methods, we will connect to a passed url, and then pass our www objects to a coroutine. This will allow our game to continue while the queries are being resolved in the WaitForRequest method. This method will either collect the result, and call any callbacks, or it will log the error for us.

## Conclusion
This just touches the basics of building a game that allows connecting and usage of REST endpoints. In a later editions, we can talk about building a thorough, modular system to connect to REST endpoints, extracting meaningful data from your queries using simpleJSON, user authentication, and how to build a manager system to handle multiple REST calls.

[Click here to read part 2](https://gitsinbits.wordpress.com/2016/05/15/rest-api-with-unity-part-2-2015/)
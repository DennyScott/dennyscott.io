---
title: "Unity REST - Part Two"
date: "2014-11-28T22:40:32.169Z"
template: "post"
draft: false
slug: "/unity-rest-part-two/"
category: "Unity"
tags:
  - "Unity"
  - "Games"
  - "REST"
description: "One of the main challenges we encountered when first trying to use JSON with C#, it wasn't the simple world of Javascript we had grown accustomed to."
---

As seen on PacktPub](https://www.packtpub.com/books/content/using-rest-api-unity-part-2-extracting-meaningful-json-api)

[To see Part 1, click here](dennyscott.io/unity-rest-part-one)

## Extracting Meaningful JSON from API

## Introduction
One of the main challenges we encountered when first trying to use JSON with C#, it wasn't the simple world of Javascript we had grown accustomed to. For anyone that is unsure of what JSON is, it is [Javascript Object Notation](http://json.org/) a lightweight data-interchange format. It is easy for humans to read and write. It is easy for machines to parse and generate.

For anyone not familiar with JSON, hopefully you have some background in XML. It's for a similar purpose, but JSON uses Javascript Notation, rather then a Markup Language as XML does. This article is not a point of discussion for each of these data types, instead, we will be focusing primarily with JSON, as that is the general standard for REST API's.

## Extracting JSON
As I mentioned in Part One, the main tool we use to extract JSON is a library for C# called [SimpleJSON](http://wiki.unity3d.com/index.php/SimpleJSON). Before we can start extracting data, lets create a fake JSON object, returned from a REST endpoint.

``` js
{
    employees: [
        {
            name: "Jim"
            age: "41",
            salary: "60000"
        },

        {
            name: "Sally"
            age: "33",
            salary: "60000"
        }
    ]
}
```

Perfect. This data is just some arbitrary data for our examples.

Assuming we queried and collected this data into a "result" variable, lets parse this data with simpleJSON. I think the best course of action is to show the code as a whole, and then discuss what is going on in each step.

Some of this code could be trimmed a bit shorter, but I'm going to write it out longer form to help demonstrate what is going on. It's not long code anyway.

```csharp
import SimpleJSON

...

private string result;
private List employees;

...

var jsonData = JSON.parse(result);

foreach(JSONClass employee in jsonData["employees"].AsArray) {
    string name = employee.AsObject["name"].Value;
    string age = employee.AsObject["age"].Value;
    string salary = employee.AsObject["salary"].Value;
    employees.Add(new Employee(name, age, salary));
}
```

Now let's step through what we've done here to demonstrate what each piece of code is doing. First, we must import the SimpleJSON library. To get this package, [see this link to download](http://wiki.unity3d.com/index.php/SimpleJSON). You can import the package to Unity using the file menu, Assets > Import Package > Custom Package.

Once you have imported this package, we need to include

```csharp
import SimpleJSON;
```
at the stop of our script. Assuming we have completed the GET request earlier, and now have the data in a variable called result, we can move to the next step.

```csharp
var jsonData = JSON.parse(result);
```

As we talked about earlier, JSON is an object made up of Javascript Object Notation. If you come from a background in javascript, these sort of object are just part of your daily norm. However, object like these don't exist in C#. (They of course do, but are not written like this, and appear more abstract).

So we know these sort of objects are not native to C#, or most languages for that matter, so how do we import the data. Fear not, as JSON's are imported from REST endpoints as strings. This allows each system to import it as they like, and come up with their own solutions to read these files. In our case, SimpleJSON will take the imported string, and make a JSONClass object out of the string. That is what resides in ```jsonData```.

### Navigating a JSON with Simple JSON
Now that we have the JSON parsed, our next step was moving one step inside the returned json, and extracting all the employees. The "employees" value is an array of employees. Knowing that this data is an array, we can use this in a foreach loop, extracting each employee as we pass by using a cast. Lets look at the loop first.

```csharp
foreach(JSONClass employee in jsonData["employees"].AsArray) {
...
}
```

So we extract each employee from the employees array. Now, the employee is a JSONClass, but we have not told the system it's an object, so we need to do so when we start digging deeper in the json, like so.
```csharp
string name = employee.AsObject["name"].Value;
string age = employee.AsObject["age"].Value;
string salary = employee.AsObject["salary"].Value;
```

Once we are inside the foreach loop, we will take the JSONClass employee, cast it correctly to an object, and take the string we need in it. The trick is, SimpleJSON still doesn't know what type of object is on the other end, so we need to tell it that we want the value from this return.

Since we know the structure of the JSON we can construct our code to handle the JSON.

Frequently you will find yourself iterating through a list of data, creating objects out of that piece of data. To handle that, I recommend you create an object and add it to a list. It's a simple way to store the data.

```csharp
employees.Add(new Employee(name, age, salary));
```

## Conclusion
I hope this walkthrough of Simple JSON gave you an idea on how to use this library. It's a very simple tool to use. The only frustrating part is working with the AsObject and AsArray methods, as you can sometimes easily mistake which instance you need at a certain time.

This walkthrough was a bit light in terms of challenging technical needs, but this knowledge is super important, and we will be building on it when we compete our "Using a REST API with Unity" with Part 3, and creating a modular system to handle WWW loads within our game.
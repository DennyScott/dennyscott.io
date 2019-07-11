---
title: "Quick Glance - Optional Chaining"
date: "2019-07-01T22:40:32.169Z"
template: "post"
draft: false
slug: "/qg-optional-chaining/"
category: "Javascript"
tags:
  - "Javascript"
  - "ECMAScript"
  - "Babel"
description: "Using the stage 2 proposal today!"
---
## A wild proposal appears

Let's examine one of the [TC39 proposals](https://github.com/tc39/proposals) that I'm most excited about. Optional chaining isn't the most flashy new proposal, but rather just a significant quality of life improvement for Javascript developers. How many times have you had to search the tree-like structure of an object passed in, and check if any of the intermediate nodes exist? For example

```javascript
const personOne = {
  firstName: "Denny",
  lastName: "Scott",
  contact: {
    phoneNumber: 555-555-5555,
    twitter: "@gitinbit"
  }
}

function getUserForPhoneDirectory(person) {
  if(person && person.firstName && person.lastName && person.contact && person.contact.phoneNumber) {
    return `${person.firstName} ${person.lastName} - ${person.contact.phoneNumber}`
  }
}

getUserForPhoneDirectory(personOne);  //expected: Denny Scott - 555-555-5555
```

Now, this is obviously a somewhat convoluted example, there's no reason not to make these separate inputs, but it's pretty common to get a set of values, and frequently test to see if those each chained property exists before performing an action on them. This happens a lot in selectors and reducers if you're not careful. And if you don't do this checking, and the passed variable is undefined, we get the all to classic error.

![error](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/content/posts/2019-07-01--qg-optional-chaining/error.png)

Within the Javascript community, the most standard solution has been to use a util library, like Ramda's [path](https://ramdajs.com/docs/#path) or  Lodash's [get](https://lodash.com/docs/4.17.11#get). These work great, and for some deep nesting, I'd argue they are still likely to get used. But, I've always wished to have a native way of handling optional chaining since my coworker demonstrated it for me in Ruby. (👋 to anyone that saw me mention Ruby and bail). [Here's a quick rundown if you're interested](https://christiantietze.de/posts/2015/11/ruby-safe-navigation/).

Well, [optional chaining](https://github.com/tc39/proposal-optional-chaining) has made it to Stage 2 of the TC39 proposals. If you're not interested in reading on the proposals, stage 2 indicates that the TC39 committee expects the feature to be developed and eventually included in the language standard. So what will that look like? Let's use our example.

```javascript
function getUserForPhoneDirectory(person) {
  const firstName = person?.firstName;
  const lastName = person?.lastName;
  const phoneNumber = person?.contact?.phoneNumber;

  if(firstName && lastName && phoneNumber) {
    return `${firstName} ${lastName} - ${phoneNumber}`
  }
}
```

Of course, from there, these have to be adopted by each browser, who need to fulfill the spec, and then we still have to take care of legacy browsers, etc. But, [Babel](https://babeljs.io/docs/en/) to the rescue! I'll be writing more about Babel in the future, but we can use it to add future language features in now so developers can use it and have babel compile it out to legacy compliant code at runtime. 

## How do I use it today?

Let's quickly set up a small project demo to try this out on. First, we'll create a directory to work in and create a package file. 

```bash
mkdir optional-chaining-demo
cd optional-chaining-demo
npm init
```

Fill out the details after initializing the package just using the defaults. Now, let's install babel, and it's CLI, as well as the new babel plugin we need to compile optional chaining. [You can read more details about that here](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining).

```bash
npm install --save-dev @babel/core @babel/cli @babel/plugin-proposal-optional-chaining
```

Great, now let's place the following code example into a new file called index.js, in our project directory.

**index.js**
```javascript
  const personOne = {
  firstName: "Denny",
  lastName: "Scott",
  contact: {
    phoneNumber: 555-555-5555,
    twitter: "@gitinbit"
  }
}

function getUserForPhoneDirectory(person) {
  const firstName = person?.firstName;
  const lastName = person?.lastName;
  const phoneNumber = person?.contact?.phoneNumber;

  if(firstName && lastName && phoneNumber) {
    return `${firstName} ${lastName} - ${phoneNumber}`
  }
}

getUserForPhoneDirectory(personOne);  //expected: Denny Scott - 555-555-5555
```

The project's all set up now, we can try running babel, along with the plugin, on our code.

```bash
npx babel --plugins @babel/plugin-proposal-optional-chaining index.js
```

You're going to see the code compiled. 

```javascript
function getUserForPhoneDirectory(person) {
  var _person$contact;

  const firstName = person === null || person === void 0 ? void 0 : person.firstName;
  const lastName = person === null || person === void 0 ? void 0 : person.lastName;
  const phoneNumber = person === null || person === void 0 ? void 0 : (_person$contact = person.contact) === null || _person$contact === void 0 ? void 0 : _person$contact.phoneNumber;

  if (firstName && lastName && phoneNumber) {
    return `${firstName} ${lastName} - ${phoneNumber}`;
  }
}
```

So babel has taken our code and transpiled it into similar conditional checks that we had previously. As you can see, the new optional chaining is simply a syntactic sugar on top of this style 🍭. 

To add it to a Webpack project, we can add the babel plugin as we did above, and in our `.babelrc,` we add

**.babelrc**
```json
{
  "plugins": [  
    "@babel/plugin-proposal-optional-chaining"
  ]
}
```

## Closing thoughts

And that's it! The syntax works very similar to the CoffeeScript [existential operator](https://coffeescript.org/#existential-operator) (and goodbye to the last people that made it this far 👋). I never used CoffeeScript, but this was a feature missing in Javascript that I know a lot of people were interested in. Note that it doesn't include optional property assignments.

All of the code used here today [is available on Github](https://github.com/DennyScott/optional-chaining-example). If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me [@gitinbit](https://twitter.com/gitinbit). Cheers!

## References and further reading

https://github.com/tc39/proposals

https://github.com/tc39/proposal-optional-chaining

https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining

https://coffeescript.org/#existential-operator

https://ramdajs.com/docs/#path

https://lodash.com/docs/4.17.11#get

https://babeljs.io/docs/en/
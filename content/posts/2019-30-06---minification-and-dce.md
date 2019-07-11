---
title: "Reducing JS Bundle Part Two: Minification and dead code elimination"
date: "2019-06-30T22:40:32.169Z"
template: "post"
draft: false
slug: "/reduce-js-bundle-part-two/"
category: "Javascript"
tags:
  - "Javascript"
  - "Performance"
  - "Webpack"
description: "The first strategy we tackle in our series. The goal of minification and dead code elimination is to set up an automated way to remove unnecessary whitespace, shrink variables and function to take up the least bytes, and ultimatly delete unused code."
---
- A history of minification and DCE
- What is Minification
- What is Dead code elimination
- How can we use a tool to run these processes on our code?
- Make it automated!

## Minification, a History

 First, let us look a bit back in history.

![aol](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/content/posts/2019-06-30--minification-and-dce/aol.png)

Website sizes and request load times have been a concern for many years now, just the culprits of slow load times have shifted. Static sites would often be more concerned with the amount of HTML and, most importantly, the size of images than they would about their ability to shrink bundles, as Javascript usage at the time was much more supplemental if used at all!

As Javascript usage increased, with tools like [Moo-Tools](https://mootools.net/) and [JQuery](https://jquery.com/), minification tools were developed to reduce CSS and Javascript footprints, and therefore reduce the initial request load time. Furthermore, we would shift large, commonly used Javascript tools like JQuery to CDN's for [faster content delivery](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/). Production sites would point to minified versions of these libraries.

Before we take a step further, what is code minification? We mentioned it in [part 1](https://dennyscott.io/reduce-js-bundle-part-one), but when we minify and uglify our code, we are removing all unneeded data we can, such as creating a smaller function and variable names, removing newlines, comments, delimiters, and whitespace between characters, combining files, and possibly optimizing calls. In our first example below, we will be using minification before any dead code elimination, so you'll be able to see for yourself!

With the emergence of frameworks like [AngularJS](https://en.wikipedia.org/wiki/AngularJS) around 2011, and the popularization of [Single Page Apps](https://en.wikipedia.org/wiki/Single-page_application),  usage of Javascript has exploded on the front end. The average web app is [over 3 times larger than in 2010 alone](https://www.keycdn.com/support/the-growth-of-web-page-size). With the wide array of Javascript libraries and frameworks commonly used to develop these web apps, the ability to shrink the size of Javascript bundles has never been more important.

## Using Terser

Since Javascript is a dynamic scripting language, it can lack many of the tools commonly found in static programming languages. One of these tools is the use of static analysis for [dead code elimination](https://en.wikipedia.org/wiki/Dead_code_elimination). Dead code elimination usually refers to the removal of code that is unused in our codebase. To get a better understanding of it, let's take a look at an example, and pass it through attempted to eliminate the dead code.

> Note: All code examples used today can be found on [Github](https://github.com/DennyScott/minification-dce-blog)

```javascript
function selectClothes(type) {
    if(type === 'shirt') {
        return {
            type: 'shirt',
            amount: '$10',
        }
    }
    else {
        return {
            type: 'pants',
            amount: '$12'
        }
    }

    return {
        type: 'hat',
        amount: '$5'
    }
}

selectClothes('shirt');
```

Let's assume that `selectClothes` executes from a different module in our application. In our example, it's impossible ever to get the `Hat` object as our return value. Perhaps it was included at one point, maybe this was a refactor that left this code in accidentally, or someone decided that users aren't able to buy hats. What is left is referred to as "dead code." Even though this code is minimal, these bits and pieces can certainly add up, and they are increasing the size of our bundle. Increased bundle sizes, as we know, create longer load times, and require more data over the network.

Many minifications tools, like [Terser](https://github.com/terser-js/terser), already include dead code elimination. It will find that any code that is never executed and remove it from the codebase automatically.  Let's try passing our code example through Terser to get a better understanding of the library itself. 

> Terser describes itself as a "JavaScript parser and mangler/compressor toolkit for ES6+".

First, create a folder for this project. 

```bash
mkdir dce-example
cd dce-example
```

Add the `selectClothes` code above into a `dce-example/index.js.` 

Finally, let's create an npm package.

```bash
npm init
```

Once that's initialized we can add Terser.

```bash
npm i terser --save-dev
```

Now, let's take a first pass with Terser. Run

```bash
npx terser index.js
```

The output should look something like this:

```javascript
function selectClothes(type){if(type==="shirt"){return{type:"shirt",amount:"$10"}}else{return{type:"pants",amount:"$12"}}return{type:"hat",amount:"$5"}}selectClothes("shirt");
```

Our code is minified, but the dead code wasn't removed from the bundle. What's the deal? We'll get to that in a moment, but let's examine the minified code first. Notice that all white space has been removed? Removing that space lowers the size of the file. But what about the variable/function names, they're still regular names, didn't we say that they should be shrunk to the smallest possible size? 

The Terser-CLI knows that we are likely using this and viewing it in our terminal. When variables and functions are "mangled," it's very tough to read and understand our code, so the default is to leave it off. Most web applications use an actual module bundle system to do this automatically, so they never have to read this mangled code. For the sake of learning, though, we should get a glimpse of what it looks like, so let's throw a couple more commands in Terser this time. 

```
npx terser --toplevel --mangle --mangle-props -- index.js
```

This will give us our mangled code.

```javascript
function t(t){if(t==="shirt"){return{type:"shirt",t:"$10"}}else{return{type:"pants",t:"$12"}}return{type:"hat",t:"$5"}}t("shirt");
```

## Dead Code Elimination

Alright, let's jump back into the question we had. Why wasn't our dead code eliminated? Well, the default option of Terser doesn't include compression, which is where dead-code elimination happens. So let's add it by giving it the `-c` command.

```
npx terser index.js -c
```

And our result should look something like this:

```javascript
function selectClothes(type){return"shirt"===type?{type:"shirt",amount:"$10"}:{type:"pants",amount:"$12"}}selectClothes("shirt");
```

Look how much smaller it is! Not only did it remove the dead code (notice `hat` is completely gone), but it also optimized our module by changing our `if` flow into a ternary!

## Automating with Webpack!

Now, at one point, we did have to pass our code through tools like ternary before releasing our app to the web. But since then, bundling tools like [Rollup](https://github.com/rollup/rollup) and [Webpack](https://webpack.js.org/) have taken over the front end community. These bundling tools are usually straightforward to extend with plugins like Terser. In our example, we are going to be using Webpack and adding the Terser plugin.

> There are other web application bundlers, so don't this is an exhausted list. These are just the main ones used today. [Parcel](https://parceljs.org/) is newer, but very exciting!

So let's add Webpack and the Webpack CLI to our project:

```
npm i webpack webpack-cli --save-dev
```

We'll be adding and moving a couple files here. First, we are going to add a folder called `dist` and `src.` 

```bash
mkdir dist
mkdir src
```

Inside of dist, we will add the index.html file:

```html
  <!doctype html>
  <html>
   <head>
     <title>Getting Started</title>
   </head>
   <body>
     <script src="main.js"></script>
   </body>
  </html>
```

Then we are going to navigate to our `/src` folder at the root of our project, and move `index.js` into it. 

```bash
mv index.js src/
```

Lastly, we need to go into our package.json, and remove the `main` property, and instead add `private: true`.

```json
{
    "name": "webpack-terser-example",
    "version": "1.0.0",
    "description": "",
    "private": true,
    "scripts": {},
    "author": "",
    "license": "ISC",
    "devDependencies": {
        "webpack": "^4.27.1",
        "webpack-cli": "^3.1.2"
    }
}
```

Our project is set up, so we'll return to the root of the project, and run the webpack CLI tool. 

```bash
npx webpack
```

After that, we can open up `/dist/main.js` to see our new bundled javascript file. Now, remember, this is adding a bundling system to our app, so there's going to be quite a bit of boilerplate attached to the file. This is a significant amount of overkill for only having a single Javascript file. But as our web app gets more abundant, this boilerplate becomes an insignificant amount of code.

So let's look at that bundle!

```javascript
!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t){}]);

```

You may have a couple questions. First off, we had talked about adding the Terser plugin, but this is already minified and compressed. Well, that's because Webpack automatically adds the Terser plugin for minification. Also, you may have noticed a warning in your console when we ran Webpack. Since we are not specifying an environment, it assumed production. When the environment is set to production, it will perform the minifications and compression for us.

Maybe an even more critical question, where is the code we wrote? Well, the most recent version of Webpack wraps your file with [esmodules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/), so it can do a bit more static analysis on your module. It determined that the code we wrote had no effects on our code base. The function was never called externally (more on that in part 3) and never executed any non-pure paths. Therefore, the entire file was dead-code. And that's correct! We never used that code with the actual front-end. The easiest way for us to get around this is to add a console log. So let's do that in our index.js.

```javascript
function selectClothes(type) {
  if(type === 'shirt') {
      return {
          type: 'shirt',
          amount: '$10',
      }
}
  else {
      return {
          type: 'pants',
          amount: '$12'
      }
  }
  return {
      type: 'hat',
      amount: '$5'
  }
}


const clothes = selectClothes('shirt');
console.log(clothes);

```

Now when we run our webpack cli again:

```javascript
!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){const n="shirt"==="shirt"?{type:"shirt",amount:"$10"}:{type:"pants",amount:"$12"};console.log(n)}]);
```

Our code now exists in the main bundle. Also note, just like before, our desired dead code was eliminated! Let's try abstracting this a bit more. In our index.js, let's update our code to:

```javascript
const buyShirt = () => ({
    type: 'shirt',
    amount: '$10',
})

const buyPants = () => ({
    type: 'pants',
    amount: '$12'
});

const buyHat = () => ({
    type: 'hat',
    amount: '$5'
})

function selectClothes(type) {
  if(type === 'shirt') return buyShirt();
  else return buyPants();
  buyHat();
}

// selectClothes('shirt');
const clothes = selectClothes('shirt');
console.log(clothes);
```

And now the result

```javascript
!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){const n=()=>({type:"pants",amount:"$12"});const r="shirt"==="shirt"?(()=>({type:"shirt",amount:"$10"}))():n();console.log(r)}]);
```

Notice that not only is the call to `buyHat` removed, but the actual function has been removed as well. Webpack noticed that the request was not used anywhere and removed the unreachable code. If you were to run the same module through only Terser, and not using Webpack, you would get the following output. 

```javascript
const buyShirt=()=>({type:"shirt",amount:"$10"}),buyPants=()=>({type:"pants",amount:"$12"}),buyHat=()=>({type:"hat",amount:"$5"});function selectClothes(type){return"shirt"===type?buyShirt():buyPants()}const clothes=selectClothes("shirt");console.log(clothes);
```

So Webpack has removed the unused function, while Terser is unable to do this, why is that? 

This is because Webpack can assume we are using the `esmodule` system. As of Webpack 4, this is the default module system used. Since the `buyHat` function is not `exported` (more on this later), Webpack knows the only place this is used in the code is in our `selectClothes` function. Once Terser removes the dead code from there, Webpack knows it's no longer used anywhere in the codebase, and can safely be removed. This is an early demo of [Treeshaking](https://webpack.js.org/guides/tree-shaking/).

## Closing Thoughts

Great job! We walked through the first steps of dead code elimination. If this was your first time coming across something like dead code elimination, and you had a bit of trouble understanding it, I'll have some links for you below. Don't worry that it can be a bit tricky your first time, learning about how Javascript code itself is both analyzed and compiled can be daunting. It's a bit more meta that we usually think about our system.

On the other hand, once you get a feel for it, it's actually a pretty simple process! And a critical process at that. We are going to be stepping into Tree shaking in our next part, which relies heavily on this process as a building block, so I encourage you to experiment a bit with Terser and check out the further reading for more details. So join us next time to learn about modern Javascript Tree shaking!

If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me @gitinbit. All code here is [available on Github](https://github.com/DennyScott/minification-dce-blog). Cheers!

## References and Further Reading

https://dennyscott.io/reduce-js-bundle-part-one

https://mootools.net/

https://en.wikipedia.org/wiki/AngularJS

https://jquery.com/

https://www.cloudflare.com/learning/cdn/what-is-a-cdn/

https://en.wikipedia.org/wiki/Single-page_application

https://www.keycdn.com/support/the-growth-of-web-page-size

https://en.wikipedia.org/wiki/Dead_code_elimination

https://github.com/terser-js/terser

https://github.com/rollup/rollup

https://webpack.js.org/

https://webpack.js.org/guides/tree-shaking/

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking/
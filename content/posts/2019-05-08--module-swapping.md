---
title: "Module Swapping for better Development and Testing"
date: "2019-08-05T22:40:32.169Z"
template: "post"
draft: false
slug: "/module-swapping/"
category: "Javascript"
tags:
  - "Javascript"
  - "Performance"
  - "Webpack"
description: "Module swapping gives us the ability to recognize and swap modules at build time. These are often handy to change the module loaded for a specific environment."
---
## Some Dynamic Magic

Let's walk through a scenario I came across when working with a markdown parser not long ago. This markdown parser allowed code syntax highlighting, and it was important that it matched (or even exceded) the number of available languages on Github. When looking at the options, we had available to us; we decided to use [Lowlight](https://github.com/wooorm/lowlight). 

With Lowlight, we can import any language syntax we like, and it had roughly 150 - 200 available for us to use. Even better, we could assume that the user was going to place the language in the header of the code format.

Beautiful, so all we have to do is pull that language, and read it from one of our 150 - 200 available programming languages. But how big is each of those files? Well, it turns out, each isn't massive, but all together, it was unnecessarily beefy. So we figured, well, if we know what language they're using, why don't we lazy load it. Each language will split into a seperate bundle, and we can pull them in as we need them. The odds were pretty low of needing more than one at a time so we thought we'd give it a shot.

## Environmental Issues

Fast forward to wrapping up the feature. We're pretty happy with how it's working, and our index bundle has barely increased in size since the languages are chunked. Great, all's well that ends well. But then other team members attempted to use our new package, and they began complaining about the length it took for the development environment to rebuild after a change. As a note, HMR is a bit tricky right now, with several bugs or plugins needing updated. Because of this, we weren't able to split our HMR to take multiple steps, which means that each time someone makes a change, all 150 - 200 bundles need to get recompiled before updating the browser with the change.

![lazy](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/lazy.jpg)

These massive load times won't do, as they effectively doubled the time for recompiles. We decide on one of two options, to either limit the number of languages down to 10 or attempt to bundle fewer languages for development. And that's when we came across [`NormalModuleReplacementPlugin.`](https://webpack.js.org/plugins/normal-module-replacement-plugin/) Sounds pretty dull, maybe even a little too on the nose, but module replacement it a pretty handy trick, especially when it comes to different environments.

## Normal Module Replacement

`NormalModuleReplacementPlugin` does precisely what its name describes, and will make even more sense with the code below. Regardless, let's glance at its online description. 

>The NormalModuleReplacementPlugin allows you to replace resources that match resourceRegExp with newResource. If newResource is relative, it is resolved relative to the previous resource. If newResource is a function, it is expected to overwrite the request attribute of the supplied resource.

ELI5, we tell it a module to keep an eye for, say `Child.js,` and if it notices something using it, a module it should swap it for, say `Toddler.js.` 

Let's walk through the problem a little closer and talk about our eventual goal. First, the code looked something like this:

**loadLangauge.js**
```javascript
async function loadLanguageFile(lowlight, language) {
  return import(`highlight.js/lib/languages/${language}`)
	.then(({ default: definition }) => {
	  lowlight.registerLanguage(language, definition);
	  return language;
	})
	.catch(() => undefined);
}
	 
export default loadLanguageFile;
```
As you can see above, any `language` could be passed in. So when we statically analyze this code laster with webpack, any of the 200 languages could be imported. Webpack will automatically go to that folder and collect all files that have the potential to be imported,  and the system will automatically chunk every file it finds.

So our goal is to limit the number of languages that the dynamic import could load while we are in development mode; that way, [Webpack](https://webpack.js.org/) will know it can only load a limited number of files. 

Simple, that brings us back to our module replacement plugin. The plugin allows us to select a module (like the one above), and tell Webpack to load a different module in its place. Let's create a module that only loads javascript.

**loadLanguage.dev.js**
```javascript
import javascrpt from "highlight.js/lib/languages/javascript";
	
async function loadLanguageFile(lowlight, language) {
  if (language === "javascript") {
    lowlight.registerLanguage("javascript", javascrpt);
	return language;
  }
	 
  return undefined;
}
	 
export default loadLanguageFile;
```

Now in our `webpack.config.js,` we can add the `NormalModuleReplacementPlugin` to the plugins section. I've added an `isDev` variable to indicate that this plugin should only execute in dev mode. Note that this will need to be handled accordingly in your codebase (perhaps using the `NODE_ENV`).

**webpack.config.js**
```javascript
isDev ? new webpack.NormalModuleReplacementPlugin(
  /loadLanguage\.js$/,
  './loadLanguage.dev.js'
) : [],
```

Note that we don't have to target where the file exists, just some regex if the filename appears. The second call is the replacement module. Now when we build our development environment, only the Javascript is part of our build!

## Jest Module Swapping

Another excellent use case of module replacement is [Jest](https://jestjs.io/). Jest still has several issues with [ESM](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/), and therefore often needs to fallback to [CJS](https://en.wikipedia.org/wiki/CommonJS) still. It's usually recommended you use the ESM files in your development/production builds, and then module swap to CJS during your tests.

One library that uses this swap for testing, at the time of this writing, is [React-dnd](https://github.com/react-dnd/react-dnd). They are also a great example because they need to swap any or all of the modules you could use by them. We're going to do all of them, but it might not be necessary for your case. To swap files in your jest testing environment, open up your `jest.config.js.` Within  your `module.exports` you can add:

**jest.config.js**
```javascript
moduleNameMapper: {
  '^dnd-core$': 'dnd-core/dist/cjs',
  '^react-dnd$': 'react-dnd/dist/cjs',
  '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
  '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
  '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
  '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs'
},	
```

The above code works very similarly to the `NormalModuleReplacementPlugin` above. Whenever it notices the module name on the left, it will replace it with the module on the right. 

## Closing Thoughts

The examples above were just a couple of examples of module swapping. Not something you'll need every day, but a handy "get out of jail"  card in your back pocket. Also, I hope it gives you a bit more context into how webpack works, and how you can ultimately control your build environment. 

In my time with module swapping, the most I've seen it used are problems based around environments. Please note though; you should still be very cautious when using this as a fix for an environmental issue. Any time you make the behavior of an environment different from production, it means you will have less confidence in your production build. It means there could be unforeseen differences when things go live since you aren't working with the same system. So always ask if there's a  different way that would give more confidence to your team first!

If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me [@gitinbit](https://twitter.com/gitinbit). Cheers!

## References and Further Reading

https://github.com/wooorm/lowlight

https://webpack.js.org/plugins/normal-module-replacement-plugin/

https://webpack.js.org/

https://jestjs.io/

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

https://en.wikipedia.org/wiki/CommonJS

https://github.com/react-dnd/react-dnd


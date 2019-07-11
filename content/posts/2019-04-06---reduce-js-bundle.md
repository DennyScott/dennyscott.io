---
title: "Reducing JS Bundle Part One: Measurement and high level"
date: "2019-06-04T22:40:32.169Z"
template: "post"
draft: false
slug: "/reduce-js-bundle-part-one/"
category: "Javascript"
tags:
  - "Javascript"
  - "Performance"
  - "Webpack"
description: "Let's first talk about Javascript bundles. Bundles are usually referring to Javascript and CSS bundles sent from the server to the user's browser. When we discuss it in passing, the primary focus is typically the size of the initial Javascript bundle sent to to the client to initialize the web app, and how that bundle affects the amount of time before a user can use the app."
---
- What is a Javascript Bundle?
- How do we measure the effect of our bundle on our users?
- What is TTI?
- How do we break up our Bundle?

## Javascript Bundles

Let's first talk about Javascript bundles. "Bundles" are usually referring to Javascript and CSS bundles sent from the server to the user's browser. When we discuss it in passing, the primary focus is typically the size of the initial Javascript bundle sent to to the client to initialize the web app, and how that bundle affects the amount of time before a user can use the app. However, what is the main bundle?

There was a time when we would send a couple of Javascript files to help make our webpage more interactive. More times than not, you would have a CDN link to JQuery, maybe some plugins, and then a `main.js` where you did most of your custom coding. Of course, this wasn't a hard-fast rule, but in this scenario, you only had a single file, with relatively little javascript. This Javascript would be sent to the browser with the HTML and CSS when a user made a request to the server. The actual webpage and content were often entirely built on the server before being sent to the client. If the user wanted another page, they made a subsequent request to the server.

> That's not to say minification and size were not essential at the time!

The landscape is much different nowadays. Single Page Applications (SPA's) mean that a user will make a request to a server, and download the entire web app. From there, Javascript will take care of routes, interactions, network requests, and more. That means there's **a ton** more Javascript than ever before. Furthermore, our projects have gone from a couple of JS files to hundreds or thousands. If we were to request for all of these individually, it would take an eternity! 

Instead, we use tools like Webpack, Parcel, or Rollup to take our files and package them into bundles for distribution. Often, the default strategy of these bundling systems is to create a single bundle out of our js files, as that will take the least amount of time and requests to collect the data. Of course, these systems do more than that, but for our purpose, this created bundle is our **main bundle**. To see this in action, we can create a new create-react-app.

> We are using create-react-app as it's a pure boilerplate to visualize changes, without needing to step into the code!

```bash
npx create-react-app bundle-test
cd bundle-test
npm run build
```

![terminal](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/content/posts/2019-06-04--reduce-js-bundle-part-one/terminal.png)

We will get into what these other "chunks" are later in the series; we're just interested in the `main.#.chunk.js.` This chunk is the collection of all our components packaged into a single file by webpack. Any new code we write will be added to this chunk and downloaded as a single bundle.

However, why do we care about the size of the bundle?

## Measure First

Before we dive further into the technical side, let's examine why reducing our bundle size can be so important from a statistical perspective. Note though, the impact performance and load times have on our users can differ significantly. For example, the ability to load a page quickly for an e-commerce site will likely have a much different impact than to user using a photo-editing web app. Regardless, it's pretty safe to assume that the better the performance of the app, the higher the conversion with your customers.

Let's glance at some case studies to cement this assumption further. If you're not interested, and already sold on performance, you're welcome to jump ahead!

- A [study by akami found](https://www.getelastic.com/site-performance/) if a site took longer than 4 seconds to load, upwards of 25% of users would abandon the site.
- In 2010, Strangeloop Networks [found](https://blog.radware.com/applicationdelivery/applicationaccelerationoptimization/2013/03/free-report-ecommerce-page-speed-web-performance-spring-2013/) 

> “*a site that loads in 3 seconds can expect 22% fewer page views, a 50% higher bounce rate, and 22% fewer conversions than a site that loads in 1 second, while a site that loads in 5 seconds experiences 35% fewer page views, a 105% higher bounce rate, and 38% fewer conversions*.”

- [Pinterest increased search engine traffic and sign-ups by 15%](https://medium.com/@Pinterest_Engineering/driving-user-growth-with-performance-improvements-cfc50dafadd7) when they reduced perceived wait times by 40%.
- [The BBC found they lost an additional 10% of users](https://www.creativebloq.com/features/how-the-bbc-builds-websites-that-scale) for every extra second their site took to load.
- For Mobify, [every 100ms decrease in homepage load speed worked out to a **1.11% increase** in session-based conversion, yielding an average annual revenue increase of **nearly $380,000**](http://resources.mobify.com/2016-Q2-mobile-insights-benchmark-report.html). Additionally, a 100ms decrease in checkout page load speed amounted to a **1.55% increase** in session-based conversion, which in turn yielded an average annual revenue increase of **nearly $530,000**.

So *performance*, or more specifically in our case, *load time*, has a substantial impact on our customers. However, how do we determine what our load time is? We could make changes that we hear about online, and hope for the best, but there are many stories of people making cut-and-paste "optimized" changes, which caused performance degradation. Because a strategy works in one place, it doesn't mean it works in all cases. We need to make educated optimizations!

The best thing we can do at this step is to measure our application. The best part, these tools are built into Chrome now, and are crazy easy to use! The first step is to open our developer tools on any page, go to the audits tab, and run the audit. This audit runs [Lighthouse](https://developers.google.com/web/tools/lighthouse/), an open-source, automated tool for improving the quality of our web app. Without any configuration, it will run through our app and break down a ton of metrics for us. Even better, we can dig into these metrics and Lighthouse will give us some great tips on what we can improve, and how to do it.

![lighthouse](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/content/posts/2019-06-04--reduce-js-bundle-part-one/lighthouse.png)

Outside of Lighthouse, there are a ton of other tools we can use to try and measure our application. That's a bit out of the scope of this post, but we will play around a bit with the performance tab later in this series. The performance tab allows us to see a detailed flame chart, as well as other metrics, and analyze what is explicitly loading, calling, and compiling at a given time.

Now, Lighthouse gives us a ton of metrics, and they all give us great insights into possible bottlenecks and issues to the website. I recommend reading [Google's breakdown for the metrics](https://developers.google.com/web/fundamentals/performance/user-centric-performance-metrics) as to which each of them tells you, but for our case, lets narrow down this series to a single benchmark, TTI.

> Recommend looking into CI tools that fit into your flow to measure performance. Check out [SpeedCurve](https://speedcurve.com/) or [Treo](https://treo.sh/)

## TTI and the Why

[Time to interactive (TTI)](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive) is a good reflection of our bundle size because our bundle needs to be evaluated entirely before a user can adequately interact with our web app. Sites with a long TTI often leave users frustrated and annoyed, as pieces of the site have loaded, but they are not able to "do" anything yet. 

It's essential to understand the distinction between [First Contentful Paint (FCP)](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint) and TTI, as we could use FCP as a measure to our bundle size. FCP happens much earlier in the process, after our Javascript has been downloaded and evaluated, once the very first piece of content has rendered on the page. FCP is excellent for assessing the bundle size, and in fact, one of the main strategies to decrease the FCP time is to reduce bundle size. However, over time, TTI has become the more important metric to pay attention to, as there is a lot of user behavior correlated to the ability to interact with the page. 

Beyond that, some of the benefits we get from strategies outlined in this series, like Code Splitting, are not only great for reducing the bundle size, it also has a strong reflection on the render time of our app.  TTI is beneficial in this scenario, as render improvements are not addressed in the FCP metric. 

In general, FCP is still a super important measurement. In terms of user behavior, FCP relates to when the user knows **something is happening**, whereas TTI corresponds to when the user can **use** the application. TTI has a stronger relationship with user behavior. With that said, if you have a reason to use FCP more specifically, you are welcome to use that metric as a benchmark for your initial bundle load time. It will still give you a proper reference, and allow you to make educated optimizations.

> Note that TTI is dependent on the main thread usage. That means that even if the page is interactive if there is a long-running task taking up the main thread, the TTI benchmark will wait for the long-running job to be complete. Our strategies will help many of these, but for a detailed article on how to measure long running tasks, check out [this post](https://web.dev/long-tasks-devtools/).

## Breaking up the Bundle

When it comes to decreasing our TTI, there are plenty of strategies. Many of these strategies are not handled in this series! We are going to be diving into reducing our bundle size, but other approaches will be covered in future posts include:

- **Monitor our network requests**. These happen between our FCP and TTI, as the initial request for data often occurs when our components initially mount. As a simple tip, we should never attempt to make more than six requests, as this is the round trip limit of many browsers (namely Chrome). 

- **Reduce the total dom nodes needed to render on the page**. Lighthouse's audit will give us a break down on the number of dom nodes our page initially creates. No surprise here, the less the page needs to render, the less time it takes :man_shrugging:

- **Move work off the main thread**. An excellent example of this would be heavy computations. By moving this to a web worker, the computation will be run on a separate thread than our main thread, and not block the actual rendering of the page.

- **Caching**! Although not useful for users on their first-page landing, caching data, bundles, and assets can make subsequent visits lightning fast.

  > There's much more than that. A solid practice to start would be using the [PRPL](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) pattern! 

  With that out of the way, let's break down some strategies when it comes to reducing the size our Javascript bundle. We'll take a high-level view into the three strategies below, and discuss how these will affect our bundle size. The ensuing blog posts to this series will dive deep into how actually to perform these strategies on our codebase.

  > For the sake of simplicity, we will be using [EcmaScript Modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) syntax throughout this series. Using ESM will be more critical in the following steps.

## Strategy One: Minification and Dead Code Elimination

The first strategy we tackle in our series. The goal of minification and dead code elimination is to set up an automated way to 

- shrink code to take up the least amount of possible bytes
- remove any *dead code* not being called within a module

When we *shrink the code*, this includes removing all unneeded data we can, such as creating a smaller function and variable names, removing newlines, comments, delimiters and whitespace between characters, combining files, and possibly optimizing calls. These processes are often summed up as **minifying** or **uglifying**. 

Removing *dead code* allows us to "delete" any unused code within a given module. Although not removed from the source code, the built bundle will not contain the removed pieces.  Removing code means **less** code being transferred to and compiled on the client. The simplest way to imagine it, if there's a function in a module not being called within that module, delete that function from our built bundle.

Dead code elimination and minification have been used for some time in many languages, and are the first strategies we'll employ in our build process. Check it out in Part 2.

## Strategy Two: Tree shaking

Tree shaking builds on the bedrock that dead code elimination has set up for us. Tree shaking is dead code elimination but on a project or library level. To help paint this picture, recall the description of dead code elimination:

> Simplest way to imagine it, if there's a function in a module not being called within that module, delete that function.

What if that function uses the `export` syntax? By using the `export` keyword, our function can be imported and executed by another module. Until recently, we couldn't be sure if another module ran this function, and therefore, dead code elimination would skip processing this function. That's because there was no proper way to analyze our code base statically. However, if we could determine the usage of this function, and if it was executed elsewhere in our codebase, we could also delete that function. In lamens terms, that's what tree shaking does. 

Tree shaking, or just using modules we call, is useful both for our codebase, and for 3rd party libraries, particularly utility libraries. We will investigate this strategy more in Part 3.

## Strategy Three: Code Splitting and Lazy Loading

When we talk about code splitting, we usually are referring to code splitting and lazy loading together. It's generally assumed if you are code splitting, you are doing it with the sole intention of lazy loading those bundles. Lets split these processes for now to get a better understanding of each.

Code splitting is the ability to take a collection of modules, tied together in some pattern, and remove them from the main Javascript bundle. We then take these modules and create a new bundle with them. Removing these modules decreases the size of the main bundle. However, what happens to the functionality of these modules, and what is the pattern to bunch these?

Lazy loading is the solution. Lazy loading means we can load this newly created bundle later on, at a more appropriate time of our choice. With lazy loading, we still get the functionality of these modules, but we don't need to load these modules *when the app initializes*. Popular strategies include **splitting by route**, where the required modules are only requested when a user attempts to navigate to a given route. 

There are other strategies and pitfalls to avoid with this, so be sure to check it out in Part 4.

## Closing Thoughts

So that's it for Part 1 of the series. We have a solid background now in how to measure the changes we make to or bundles, why those metrics are essential for user behavior, and a high-level view of the strategies we'll employ to decrease our Javascript bundle size.

Part one of our series may have seemed underwhelming, as there are no differences yet to our code base, but don't worry about it! The most crucial step this early is to understand what we are changing, why we are changing it and seeing the effect of changing it. Without those, we won't even know if our changes have produced the outcome we desired. 

Of course, there are many more tools and tactics at our disposal outside of what we talked about here. I'm positive I'll be writing some posts where we take a much deeper dive into the performance metrics. I'd love to get around to writing about other performance tactics or learning about them myself. If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me [@gitinbit](https://twitter.com/gitinbit). Cheers!



#### References and Further Reading

https://addyosmani.com/blog/performance-budgets/

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

https://developers.google.com/web/fundamentals/performance/prpl-pattern/

https://developers.google.com/web/fundamentals/performance/user-centric-performance-metrics

https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive

https://developers.google.com/web/fundamentals/performance/why-performance-matters/

https://developers.google.com/web/fundamentals/performance/optimizing-javascript/code-splitting/

https://www.ezoic.com/time-to-interactive-website-revenue-performance/

https://www.getelastic.com/ttfb-and-tti-2-kpis-more-important-than-page-load-speed
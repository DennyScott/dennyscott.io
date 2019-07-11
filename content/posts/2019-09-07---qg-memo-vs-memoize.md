---
title: "Quick Glance - Memo vs Memoize"
date: "2019-07-09T22:40:32.169Z"
template: "post"
draft: false
slug: "/qg-memo-vs-memoize/"
category: "Javascript"
tags:
  - "Javascript"
  - "React"
description: "Whats the difference, and when to use them."
---
Time to take a quick dive into the differences between a memoization library, in our case [memoize-one](https://github.com/alexreardon/memoize-one), and the [`memo`](https://reactjs.org/docs/react-api.html#reactmemo) function supplied by [React](https://reactjs.org/). 

## Memoization (not memorization)

First, memoize-one is an arbitrary library in this example. We could have picked any memoization library, such as [reselect](https://github.com/reduxjs/reselect), [lodash](https://lodash.com/docs/4.17.11#memoize), or [ramda](https://ramdajs.com/docs/#memoizeWith). Memoize-one is a tiny library that only memoizes the latest arguments and results. To understand that, let's jump into what memoizing means.

> In [computing](https://en.wikipedia.org/wiki/Computing), **memoization** or **memoisation** is an [optimization](https://en.wikipedia.org/wiki/Optimization_(computer_science)) technique used primarily to speed up [computer programs](https://en.wikipedia.org/wiki/Computer_programs) by storing the results of expensive [function calls](https://en.wikipedia.org/wiki/Subroutine) and returning the cached result when the same inputs occur again.

Let's break this down into a code example,

```javascript
function add(a, b) {
  return a + b;
}

add(1, 2) //result is 3
add(1, 2) //we already know the result, return 3
```

This is a somewhat arbitrary example, as usual, since this calculation is incredibly cheap. But imagine if the execution was more intense, included cleaning data or mapping properties, this calculation could take some time. If our function is memoized, we can recognize that these arguments have been passed in before, and therefore return the result. 

Our current example reruns the function, let's try that with memoize-one.

```javascript
import memoize from 'memoize-one';

function add(a, b) {
  console.log('add');
  return a + b;
}

const memAdd = memoize(add);

console.log(memAdd(1, 2))
console.log(memAdd(1, 2))
```

If you were to run this code, it would print out something like this:

```javascript
add
3
3
```

This should be what's expected. The first time we call our add function, we've never run it before. So we traverse the function, as usual, we print out the string `add` followed up by printing the result. The second time though, we've already run the function, so we never actually enter the function, and never print out the `add` string again.

This points out a fundamental rule when using the memoization function. You should only ever use memoization with pure functions. For our purposes, there should be no side effects in our function. Given a set of arguments to a function, we should always expect the same result. Let's take an example where that isn't true

```javascript
let c = 1;

function sideEffectAdd(a, b) {
  console.log('seAdd')
  return a + b + c;
}

const memAdd = memoize(sideEffectAdd);

console.log(memAdd(1, 2))
console.log(memAdd(1, 2))
c++
console.log(memAdd(1, 2))
```

Our result looks like:

```javascript
seAdd
4
4
4
```

Notice that we are using a variable outside of our scoped function. That mean's this function is not pure. The final number should be 5, but since the input is the same, and the library assumes this function is pure, it never runs the internal code and returns the original, and incorrect, result to us.

> For a more in-depth description of pure functions, [check this out](https://www.freecodecamp.org/news/what-is-a-pure-function-in-javascript-acb887375dfe/)

## What about the memo?

What is reacts memo? We are specifically going to look into the `memo` function, intended to be wrapped around a functional component. Let's create a similar Add component as our previous function.

```javascript
import React, { memo } from "react";
import "./App.css";

const Add = memo(props => {
  const result = props.number * 2;
  console.log('component rendered')
  return <div>Component - {result}</div>;
});

function App() {
  return (
    <div className="App">
      <Add number={2} />
      <Add number={2} />
      <Add number={2} />
    </div>
  );
}

export default App;
```

Now, what do you expect to be printed in the console? We've supplied the same props, and do similar math as our memoize-one add function. Well, here's the result

```javascript
component rendered
component rendered
component rendered
```

> Note, your's might have a circled 3, instead of individual prints

Why did it run the component all three times, when the input was the same each time? Well, `memo` does attempt to do memoization, but not to the component generation, but rather to the instance of the component. That is to say, for a given component, if there is an attempt to render the same component, but the props have not changed, we will instead render the same result as last time. Let's look at an example

```javascript
import React, { memo, useState } from "react";
import "./App.css";

const Add = memo(props => {
  const result = props.number * 2;
  console.log('component rendered')
  return <div>Component - {result}</div>;
});

function App() {
  const [value, setValue] = useState(0);
  console.log('outter component rendered');
  return (
    <div className="App">
      <Add number={2} />
      <button onClick={() => setValue(value + 1)}>
        Click me
      </button>
    </div>
  );
}

export default App;

```

![memo](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/content/posts/2019-07-09--qg-memo-vs-memoize/memo.gif)

As you can see, despite the parent component being rerendered, the internal component never actually rerenders, as it has the same props, and therefore just returns the previous result. 

## Closing Thoughts

So, memoize-one (and most memoization libraries) remembers the result of a given function with a set of arguments, despite where the last execution occurs. React.memo, on the other hand, is for memoizing a single occurrence of a component when attempting to re-render, and will not work outside of its instance. 

Before we end off this quick glance, I want to point out that there is a new [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) hook, which works similarly to memoize-one, and is intended to memoize given functions in the context of a functional component. In fact, it can be used in conjunction with React.memo, to both memoize the component and any internal functions. We can take a deeper dive another day, but I hope that clears up a bit of confusion.

All of the code used here today [is available on Github](https://github.com/DennyScott/memo-vs-memoize).If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me [@gitinbit](https://twitter.com/gitinbit). Cheers!

## References and Further Reading

https://reactjs.org/docs/hooks-reference.html#usememo

https://github.com/DennyScott/memo-vs-memoize

https://www.freecodecamp.org/news/what-is-a-pure-function-in-javascript-acb887375dfe/

https://github.com/reduxjs/reselect

https://lodash.com/docs/4.17.11#memoize

https://ramdajs.com/docs/#memoizeWith

https://reactjs.org/docs/react-api.html#reactmemo

https://github.com/alexreardon/memoize-one
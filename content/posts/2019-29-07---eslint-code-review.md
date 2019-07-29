---
title: "Using ESLint to speed up code reviews"
date: "2019-07-29T22:40:32.169Z"
template: "post"
draft: false
slug: "/eslint-code-review/"
category: "Javascript"
tags:
  - "Javascript"
  - "React"
description: "If there is some sort of rule/coding standard in place on your project, that rule should be in ESLint. Living documentation is obviously preferable, and if we can put our practices both in clear code and in our editors while programmers are working, they are much more likely to follow the rule that is made."
---
## My standard code review scenarios

Wherever I have worked, one of the most time-consuming processes has been our code reviews. And this makes sense. Studies have shown time and time again that finding a bug early, and during the code review process is the cheapest path. For example, 

- it was found that [non-critical bugs are twice as expensive to fix after release](https://kev.inburke.com/docs/shull_defects.pdf)
- for critical bugs, the cost was much higher, possibly even [100 times more  expensive](https://kev.inburke.com/docs/shull_defects.pdf)

So we can determine from this that code reviews are critical. Besides saving the company direct money, they are a huge opportunity to share knowledge amongst teammates, improve the readability of the code, and question the general architecture and decisions made for a given feature.

So then, why has a lot of my history been filled with code reviews that looks something like

![fat-arrow](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/fat-arrow.png)
![alphabetical](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/alphabetical.png)
![instance-variables](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/instance-variables.png)
![library](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/library.png)
![line-break](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/line-break.png)
![require](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/require.png)

Yes, they are all me and clearly fake. I've come across all of these in real life (prolly even the last 6 months), but I didn't wanna shame anyone! The point is though, these are are either linting issues, or a code standard. That's not to say that keeping a particular style of linting or standard is wrong. I personally think that differences in style are often overblown, for example, I don't care what function style you use, but if your team has a coding standard, then it's best to follow it.

## Available Tools and Solutions

The only issue, if you have to comment on it in code reviews, it seems like something in your pre-commit process is off. Needing to fill reviews with this sort of information is a waste of time, both for the reviewer, and the reviewee. Tools have been developed within the community to automate as much of this process as possible. Two prevalent ones include

### Prettier

By this point, I think [prettier](https://github.com/prettier/prettier) has basically ruled the code formatting world, and there's just no reason not to use it. I'm pretty iffy on customizing it, as I kind of think that defeats a lot of the reasoning to it, but hey; sure, if it means you'll use it then great. 

### Eslint

For most things outside of prettiers code formatting, [eslint](http://eslint.org) is the king. These two work perfectly fine together but do need a touch of configuration. Eslint is also highly customizable and should cover most of your needs straight out of the box.

Now you say, "I already have these installed, and we still need to keep code standards in practice." My answer to this, you aren't entirely using eslint then. My feeling is, if there is some sort of rule/coding standard in place on your project, that rule should be in ESLint. Living documentation is obviously preferable, and if we can put our practices both in clear code and in our editors while programmers are working, they are much more likely to follow the rule that is made. Even better, a new developer doesn't need to shift to a new coding standard. If they want to read any specific ones, they are all avaiable, but for the most part they can continue as normal until they come into contact with an error.

## ESLint and AST's

Don't be worried about working with ESLint. Just like [Babel](https://babeljs.io/docs/en/), which works on a similar foundation, it is actually incredibly easy. Both of these projects work on [Abstract Syntax Trees (AST's)](https://en.wikipedia.org/wiki/Abstract_syntax_tree). These sound incredibly complex but are actually very, very simple. They are simply tree structures of your syntax. We'll dive more into AST's another time, but for a simple example, and a visual break down of the AST:

```
const something = 'hello';
```


![ast1](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/ast1.png)

I highly recommend tossing this example into [astexplorer.net](https://astexplorer.net). ASTExplorer is a visual AST explorer with a wide variety of parsers, where you can code and follow your progress through an explorable UI that makes ast work way less daunting. In this example, the entire line is a `VariableDeclaration.` `VariableDeclaration` is an object (a tree), that holds the values of that line. The kind is a `const,` but it also could have been a `let,` or `var.  Within our VariableDeclaration is an array of declarations, as there could be multiple assignments here.

In our case, we have a single `VariableDeclarator.` That VariableDeclarator represents the `something  = 'hello'`. Notice if you hover over it in astexplorer, your code will actually highlight. There's lots of information on  `declaration,` but the part we are interested in is `id` and `init.`

![ast2](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/ast2.png)

The `id` contains the `name` of our variable, and the `init` includes the `value` of it.

So pretty simple right. There's a lot of intricate pieces going on, but for most of our actual use of AST's, it's as simple as the walkthrough we just did. Why did we explore an AST when we're talking about speeding up code reviews? Because we need to use a light amount of AST's to build some of our own configurations to eslint. 

## Making our own rules

Let's take the example where `require` is no longer allowed in the codebase. There are two approaches to this, one is to build our own eslint plugin. This way is much more involved, but can be shared with the community as a whole. I highly recommend checking out other plugins to see if what you need is built already. Plugins are a great way to handle more complex pieces as well and provide possible auto-fixes to these problems

But this blog is going to use the more straightforward and simple approach, as I hope it encourages you, or other developers on your team, to quickly add the standards you've come up with. This style is using [eslints `no-restricted-syntax` approach](https://eslint.org/docs/rules/no-restricted-syntax). This means adding the selector for the specific syntax you're looking for, and giving a message to the user when it's found. This message can either be a warning or an error.

Just like we did earlier, we are going to first examine this ast in astexplorer. It will give us the structure of the ast, and lets us target the case we are looking for. Make sure when doing this section, you use the `espree` parser, as it's the one used by eslint. For the content, I used

```
const t = require('react');
```

and it gave me the following ast.

![ast3](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/ast3.png)

Looking through the AST, we know we need to target `CallExpressions` where they have a calle.name of `require`. Therefor, to restrict the use of cjs `require` syntax, we could add the following to our .eslintrc

```js
'no-restricted-syntax': [
  'error',
  {
    selector: "CallExpression[callee.name='require']",
    message: 'Require is no longer allowed, please use an import statement'
  }
]
```

Now when a developer attempts to use `require,` they'll be met with the following error.

![eslint](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/eslint-code-review/eslint.png)

## Closing Thoughts

By having these custom eslint rules in your codebase, and having things like autoformatted on saving, or pre-commit checks like lint-staged, we can ensure that the codebase follows the same coding standards, without flooding our code reviews with information that should be automated anyway. 

Beyond that, my final tip, if there is something you want to input that is linting focused or a highly opinionated choice, I would think about it for a moment. It actually could be great to bring up your style to the original developer, but I would also frame it with that context, that you understand its a personal choice. Too often, we can be quite ignorant that these choices are personal. Bringing it up as a discussion is great, but forcing someone to use a highly subjective approach shouldn't be the goal of your code review.

If there's something you're interested in to see on this blog, or you think I should check out, be sure to contact me @gitinbit. Cheers!

## References and Further Reading

https://kev.inburke.com/docs/shull_defects.pdf

https://github.com/prettier/prettier

http://eslint.org

https://babeljs.io/docs/en/

https://en.wikipedia.org/wiki/Abstract_syntax_tree

https://astexplorer.net

https://eslint.org/docs/rules/no-restricted-syntax
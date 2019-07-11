---
title: "Unity Testing: The limited approach available"
date: "2015-01-12T22:12:03.284Z"
template: "post"
draft: false
slug: "/unity-testing/"
category: "Unity"
tags:
  - "Testing"
  - "Unity"
  - "Games"
description: "Traditionally in Software Development, testing plays an integral role in both the maintainability and quality of the product. Of course, in game development, user acceptance testing is performed frequently. But lets take a look into automated tests!"
---

As seen on [on packt publishing.](https://www.packtpub.com/books/content/testing-unity)

# Testing with Unity

## What is Testing?
Traditionally in Software Development, testing plays an integral role in both the maintainability and quality of the product. Of course, in game development, user acceptance testing is performed frequently. Each time you play the game you check if your newly added creation works the way you intended, this is user acceptance testing. While this is great, frequently game development testing only centers on "user" centric testing principles. Two testing levels that are often left out are Unit and Integration Testing. We're going to focus on Unit testing, as that's frequently the first step of Automated testing.

Unit testing, for our purposes, is an automated test, which verifies the functionality of a specific section of code. There is some debate whether this should be a method, or whether the test should have an even smaller scope. I understand both arguments, and personally agree with the second, yet usually find myself resorting to the first. The reason for this is the nature of a unit test. Our goal is to give our test an input, and expect a certain output or result. The simplest way to give an input and get an output? Methods.

So up to this point, why have games not utilized testing as much as enterprise level software? Well, many large game companies have already taken this route, while small indie teams frequently don't have the budget, or the longevity to do it. But by testing from the start of your project, and using TDD (Test-Driven Development) processes, you'll find testing becomes a natural starting point for a new feature. So how do we do this?

## Unity Test Tools
Unity has released an official testing Library. For the sake of this demo, we'll be using the standard C# for development. The testing library can be found in the asset store, under Unity Testing Tools. Once you have added the package to your project, you can begin writing and running your tests.
## Example Test
To write the the test's were going to start with a basic script. Lets make a new script and call it Cat. The file will have the following code:

```csharp

public class Cat
{
    private int lives;
    public Cat()
    {
        this.lives = 9;
    }

    public void useLife()
    {
        lives > 0 ? lives-- : lives;
    }

    public int getLives()
    {
        return lives;
    }

    public bool IsAlive()
    {
        return lives > 0;
    }
}
```

Nice and simple. We can use one of the cat lives, get the current amount of lives, and check if our cat is alive. Now, in traditional TDD, we should have written the test first. Since I'm assuming as a reader you may never have seen testing, I prefer you understand what we're testing first. So our goal here is to make sure our logic is working as expected.

No matter how simple the logic may seem, we as programmers know that we still make many mistakes. Because we do make mistakes, writing the test before the logic can be a great benefit to us. That way, you won't let a small bug last in your code. The earlier we can catch a bug, the less of a problem it is. So lets take a look at a test object. To create a test, create an Editor folder in your assets. Inside the Editor folder create a C# file called CatTest.cs. Inside, we will write:

```csharp

using NUnit.Framework

[TestFixture]
[Category("Testing Cat")]
public class CatTest
{
    Cat cat;

    [SetUp]
    public void Init()
    {
        cat = new Cat();
    }

    [Test]
    public void DoesUsingLifeReduceTheCatsLivesByOne()
    {
        int currentLives = cat.getLives();
        Assert.AreEqual(currentLives - 1, cat.useLife());
    }

    [Test]
    public void ReducingACatsLivesBelowZeroHasNoImpact()
    {
        EmptyCatLives();
        cat.useLife();
        Assert.AreEqual(0, cat.getLives());
    }

    [Test]
    public void CatIsAliveWhileItHasLives()
    {
        Assert.IsTrue(cat.IsAlive);
    }

    [Test]
    public void ReducingCatsLivesToZeroWillMakeIsAliveFalse()
    {
        EmptyCatLives();
        Assert.IsFalse(cat.isAlive());
    }

    public void EmptyCatLives()
    {
        for(int i = 0; i < cat.getLives(); i++)
        {
            cat.useLife();
        }
    }
}
```
Finally to run our tests, there should be a Unit Test Tools dropdown in the navigation bar at the top of the unity pane. Select it, and choose Run Unit Tests. Once the small window opens click play.

An important piece of any projects testing is it's Methods names. These names are frequently used to describe the tests purpose. This is actually a great way to introduce a new team member to the project, as this can give new members a way to step-by-step walk through your code, understanding what the purpose of its functions are. In our test, Test Fixture and Category, for this purpose, define our scripts tests. The [Setup] will be run before each test. We use it to initialize our class cat. That way we know each test starts off with a clean instantiation of Cat.

The four methods with [Test] are our tests. They will determine that the code written in our script will return what we expect it to. For example, assume a new team member comes to our project and believes that a cat truly losses two lives at a time. Out of excitement, they change your code without even consulting you. Assuming they run the tests as expected, you or this new team member will then be notified that something isn't right. The numbers aren't lining up to what they should be. You've corrected this bug before it's even gotten dangerous.

In the enterprise world, its the norm for many team members to come and go on projects. Games are no exception, and by having safeguards like Unit and Integration testing, you'll be able to catch those small bugs before they get too far. I recommend a further reading on Unity Tests, and testing in general, as this just scratched the surface!
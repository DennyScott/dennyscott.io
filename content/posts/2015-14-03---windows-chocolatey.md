---
title: Setting up a clean install of windows with Chocolatey.
date: "2015-03-14T22:40:32.169Z"
template: "post"
draft: false
slug: "/windows-chocolatey/"
category: "Tools"
tags:
  - "Windows"
  - "Setup"
  - "Chocolatey"
description: "Chocolatey is a package manager, attempting to be in a similar vein as apt-get for Debian. Lets automate a fresh install of our programs"
---
I can't deny it, I format my computer **a lot**. I don't know why. It's not that I necessarily change computers (though this time I did get a new XPS 15), but usually formats are just my simple way to remove the clutter.

After each Windows install, I painstakingly try to remember all my programs. This time, I wanted to try and make doing a fresh install easier. For my mac, I usually can just use my usual [gist](https://gist.github.com/DennyScott/a0af75ed5674f92594c2) of usual installs. Granted I can automate those too, but at least its a quick copy paste.

I decided for this round I will use some sort of automation tool. I had read some details about chocolatey over on hacker news, so I'm going to give that a try. Plus, if they think it's cool, maybe they'll think I'm cool.  ¯\ _ (ツ)_/¯

### Installing Chocolatey
To install, I went over to their getting started guide, opened power shell as admin, and did a quick:

```
iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex
```

Chocolatey is a package manager, attempting to be in a similar vein as apt-get for Debian. After doing a little reading on their docs, you'r able to create a packages.config file to store a list of packages you would like to install. Since I want to use this as my *starting a new windows* config, this will work well for me. If you want to see my config, I tossed it up on my [gist](https://gist.github.com/DennyScott/d4205861f8c4cfd8e31453843d322749/edit).

### Installing my packages

I've thrown together a little packages.config for the different packages I'd like installed on my machines. Seems simple enough. If you're looking for the packages, their website has a nice way to [search for them](https://chocolatey.org/packages?q=spotify). Apparently there's also ways to add your own custom locations, but at this point, this is all I need. If you want to check out further docs, [take a look here!](http://chocolatey.github.io/usage.html).

![packages.config](/content/images/2016/07/packages.png)

Once I saved the packages.config file, I did a quick
```
cinst packages.config

```
and chocolatey got running. I gotta say, I thought there was going to be a lot more work needed, but it's off to the races.

![installing](/content/images/2016/07/running.png)

It took about 10 minutes to finish up the installs. For anyone curious, they all happen one at a time, so you can properly chain dependencies if needed. Also, I already had some of the packages installed (namely conemu), and when it came to an already installed package, it noticed it was there and skipped it. Nice little addition to the tool!

![complete](/content/images/2016/07/complete.png)

And that's it. Looks like my apps are up and running, and I barely put an ounce of effort it. Better then my garbage Gist, next time will be even easier. Hope you guys liked it as much as I did!

Cheers
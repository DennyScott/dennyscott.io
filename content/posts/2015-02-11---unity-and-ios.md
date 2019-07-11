---
title: "Unity and iOS: Whitelisting frameworks and bundle removal"
date: "2015-11-02T22:40:32.169Z"
template: "post"
draft: false
slug: "/unity-and-ios/"
category: "Unity"
tags:
  - "Unity"
  - "Games"
  - "iOS"
description: "What we are looking at today is iOS during our build pipeline. One thing you stumble by a lot is the tricky area of xcode builds. Creating an xcode project from Unity is a pretty trivial task. But, if you would like to run the xcode project archive/export process as part of this build automation pipeline, you may find yourself with missing frameworks, or issues with urlschemes, that fail your build."
---
What I'm going to talk about today isn't necessarily Unity specific. We use tools provided by unity, but there are similar tools available in many languages/libraries.

In my mind, one of the most important things you can do in any development shop is automate as many tasks as possible. I think with the recent rise of using "DevOps", build automation tools like Jenkins/Travis CI, or even Gulp/Webpack/Grunt for web, automation has been on the forefront of many peoples minds.

Now that's not to say build automation, tools like Jenkins, or the work performed by DevOps is new. "Make" has been a primary tool, particularly in the Unix world, for years. Heck, tools like Apples Automator/Apple script, or the simplicity of simply python scripting, has made it simple to whip up an automation script in a pinch.

Unity has followed suit as well. We're not going to build automation tools quite yet, I'll save that sort of thing for later, like using UTomate, and passing your builds through Jenkins, etc.  Although, it that is something you'd like to do, and you don't have strong experience in build automation, I highly recommend checking out Unity Cloud build servers. Great job automating builds for most major platforms, test automation, etc. There's a free level, but you have to keep your project under a given size.

## Running into iOS Issues
What we are looking at today is iOS during our build pipeline. One thing you stumble by a lot is the tricky area of xcode builds. Creating an xcode project from Unity is a pretty trivial task. But, if you would like to run the xcode project archive/export process as part of this build automation pipeline, you may find yourself with missing frameworks, or issues with urlschemes, that fail your build.

Not to fear! One of our designers ran into this problem not long ago, and I passed a simple script to ensure xcode has all the frameworks it required for a standard Unity build. Now, take note, that this may be fixed in an upcoming patch, but it's still great information to know. So lets paste in a simplified script, then take a walk through each part.

```csharp
#if UNITY_EDITOR_OSX
using UnityEngine;
using System.Collections;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.iOS.Xcode;
using System.IO;
using System.Net.Sockets;

///
/// Handle Post Build Processes needed for iOS. This includes white listing
/// CTR and adding needed frameworks to the xCode build.
///

public static class iOSBuild
{
[PostProcessBuild]
public static void Run(BuildTarget target, string pathToBuiltProject)
{
if (target != BuildTarget.iOS) return;

AddURLSchemeWhiteList (pathToBuiltProject);
AddFrameworks (pathToBuiltProject);
}
///
/// Add the needed iOS frameworks to the iOS Build.
///

///Path to built project. private static void AddFrameworks(string pathToBuiltProject)
{
//Collect the Project
string projPath = PBXProject.GetPBXProjectPath (pathToBuiltProject);
PBXProject project = new PBXProject ();
project.ReadFromFile(projPath);
string targetGuid = project.TargetGuidByName ("Unity-iPhone");

//Add frameworks
project.AddFrameworkToProject (targetGuid, "SystemConfiguration.framework", true);
project.AddFrameworkToProject (targetGuid, "Security.framework", true);

//Remove File From Build
project.RemoveFileFromBuild(targetGuid, "ovrplatform.bundle");
var file = project.FindFileGuidByProjectPath("Frameworks/Plugins/macosx/ovrplatform.bundle");
project.RemoveFile(file);
project.RemoveFrameworkFromProject(targetGuid, "ovrplatform.bundle");

File.WriteAllText (projPath, project.WriteToString ());
}

///
/// Adds the URL scheme white list.
///

///Path to built project. private static void AddURLSchemeWhiteList(string pathToBuiltProject)
{
//Get Plist
string plistPath = pathToBuiltProject + "/Info.plist";
PlistDocument plist = new PlistDocument ();
plist.ReadFromString (File.ReadAllText (plistPath));

//Get root
PlistElementDict rootDict = plist.root;

//Change Value
PlistElementArray array = rootDict.CreateArray("LSApplicationQueriesSchemes");
array.AddString ("someapp");

File.WriteAllText (plistPath, plist.WriteToString());
}
}
#endif
```
First off, we've wrapped this whole class, and forced it to only be usable on osx. It will error out on other operating systems, and you'll require the osx to build an iOS app, so its a simple solution.

Runner Method

```csharp
[PostProcessBuild]
public static void Run(BuildTarget target, string pathToBuiltProject)
{
if (target != BuildTarget.iOS) return;

AddURLSchemeWhiteList (pathToBuiltProject);
AddFrameworks (pathToBuiltProject);
}
```
Our runner method is pretty straight forward. You won't need to call this code anywhere in unity, as the PostProcessBuild attribute ensures that this method will be called after each build. The parameters are populated by unity. From here, we call the two area's we'll be focusing on, whitelists and frameworks.

##Whitelisting in iOS

```csharp
private static void AddURLSchemeWhiteList(string pathToBuiltProject)
{
//Get Plist
string plistPath = pathToBuiltProject + "/Info.plist";
PlistDocument plist = new PlistDocument ();
plist.ReadFromString (File.ReadAllText (plistPath));

//Get root
PlistElementDict rootDict = plist.root;

//Change Value
PlistElementArray array = rootDict.CreateArray("LSApplicationQueriesSchemes");
array.AddString ("someapp");

File.WriteAllText (plistPath, plist.WriteToString());
}
```

As of iOS 9, when using the canOpenUrl call in iOS, you're required to have the desired app in the whitelist of apps. Now of course, this means you'll likely be working closely to a native plugin, or like me, checking if I can open a local url scheme. None the less, I don't want to go super into detail, so I would recommend checking out this write up. The author does a much better job then I could ever do about the topic!

Anyway, if you find yourself in this position, whitelisting is pretty straight forward.  We open the info.plist, which is generated by the xcode build. Remember, this is post build, so the xcode project has already been built. Using the UnityEditor.ios.xcode library, we're able to construct a plist document. Finally, we create an array to hold any whitelisted names. In this case we only add one item to the array, "someapp",  but this can be multiple names.

##Adding Frameworks and Removing Files/Bundles

```csharp
///
/// Add the needed iOS frameworks to the iOS Build.
///

///Path to built project. private static void AddFrameworks(string pathToBuiltProject)
{
//Collect the Project
string projPath = PBXProject.GetPBXProjectPath (pathToBuiltProject);
PBXProject project = new PBXProject ();
project.ReadFromFile(projPath);
string targetGuid = project.TargetGuidByName ("Unity-iPhone");

//Add frameworks
project.AddFrameworkToProject (targetGuid, "SystemConfiguration.framework", true);
project.AddFrameworkToProject (targetGuid, "Security.framework", true);

//Remove File From Build
project.RemoveFileFromBuild(targetGuid, "ovrplatform.bundle");
var file = project.FindFileGuidByProjectPath("Frameworks/Plugins/macosx/ovrplatform.bundle");
project.RemoveFile(file);
project.RemoveFrameworkFromProject(targetGuid, "ovrplatform.bundle");

File.WriteAllText (projPath, project.WriteToString ());
}
```
Now, this problem happens with a bit more frequency. After some recent changes in Unity and iOS, there are some needed frameworks in xCode that are not automatically added. Both the SystemConfiguration and Security framework should be part of each project.

To do this, we simply need to AddFrameworkToProject like above. Now of course, there's cleaner, more robust ways to do this, but the base is there.

Furthermore, often time's I've stumbled into an area, especially with cross-platform libraries, that there are extra files added to my project that cause issues while building. One example was an app that targeted the Rift on Windows builds, but required Google VR on mobile builds. When I attempted to build iOS version, the ovrplatform from the rift was being passed into the build, and not provisioning correctly. A quick solution we used was to simply remove the bundle from the built xcode project.

So there you have it, some simple ways to control the iOS xcode project after the build. This is just the tip of the iceberg, and you have a lot of control through the unityEngine.ios.xcode library. If you have any questions, tips, stories you'd like to share, toss a comment below, or contact me at denny@gitsinbits.com.

Cheers!
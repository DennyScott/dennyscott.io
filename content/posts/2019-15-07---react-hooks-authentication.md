---
title: "Building Basic React Authentication: Using hooks and context with react router"
date: "2019-07-15T22:40:32.169Z"
template: "post"
draft: false
slug: "/react-hooks-authentication/"
category: "Javascript"
tags:
  - "Javascript"
  - "React"
description: "Simple way to create authentication using react-router and tokens"
---
I've been working on some contract work, and have the privilege of a "greenfield" when starting this app. I've chosen some of the usual suspects, [React](https://reactjs.org/) (with Hooks 😍 ), [Styled-Components](https://www.styled-components.com/), [React-Router](https://reacttraining.com/react-router/web/guides/quick-start), etc. But while developing it, I eventually came to a problem set I stumble on each time. I need some form of a basic authentication system.

To be honest, I don't really have a **standard** way to do authentication in React applications. Looking back through some of my previous work, it seems to be a pretty mixed-bag on how I handle tokens, components, and routing for authentication. So, I picked one of my favorite ways to manage authentication, refined it a bit, and am going to use this as a basis for a basic authentication system to react, using react-router.

Note, there's a number of pieces missing from this authentication before I used it, check out the closing notes for some ideas! But this should be a good first step to get going!

## Goals for this Authentication System

- **Private and public routes**: This application is going to have some basic "landing" pages, where any user can visit. Along with these pages, signing up, logging in should be declarative public routes. On the other hand, there will be many pages that require authentication to view.
- **Redirect to Login**: If the user does not have tokens, or the token refresh does not work, the user will automatically be redirected to the Login page if they attempt to see a private route.
- **Redirect to referer**: If a user wants to view a specific page, but does not have a valid token, they will be redirected to the login page. We want to make sure they are then sent to the page they originally wanted. The default will be the dashboard
- **Authentication Tokens**: We are going to be using tokens to read and write authentication with. These should be stored in local storage so the user can stay logged in if they recently left the site.
- **UI is intuitive and straightforward**: This really isn't going to be much of an "examination" on the UI aspect, but I do think it's essential for our Login and Sign up page to be simple, and follow the do's and don'ts outlined by Brad Frost [here](http://bradfrost.com/blog/post/dont-get-clever-with-login-forms/). 

We'll be trying to tackle these in order, to make sure we don't overload the process with too much code. It's better to refactor the code and understand the full process, rather than code from the start expecting all of these to work. We won't be using [Redux](https://redux.js.org/) here, and instead will just store the data we need in react context to keep it simple. Under the hood, Redux would do something similar, but the app isn't of the size that I need Redux at the moment. Let's dive in!

## Demo Project Initialization

We're going to set up some initial groundwork with our base project. This will obviously be in your own project, but let's pretend we are starting from scratch, just to make it easier to follow along. If you would like to see the [completed code on github](https://github.com/DennyScott/react-router-auth) if you want to follow along, we are setting up the base project with [Create React App](https://github.com/facebook/create-react-app), like so:

```bash
npx create-react-app react-router-auth
```

I'm not going to be setting up any *permanent* architecture in this project for my files. Everyone has a bit of their own style with folder/file architecture, and I'd like to keep this as agnostic as possible for people to follow along with. Or maybe I'm avoiding triggering people that don't use mine 

![pitchfork](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/pitchfork%20(1).jpg)

Our next step will be to install the packages we need. We'll be installing [React Router](https://reacttraining.com/react-router/web/guides/quick-start) and [Styled Components](https://www.styled-components.com/) and [axios](https://github.com/axios/axios). 

```bash
npm install --save styled-components react-router-dom axios
```

Great, now lets set up react-router. We'll be modifying our `App.js` component, to have some basic routes. For now, let's add a public `Home` page and a public `Admin` page. Don't worry, we'll be changing this to private soon.

Note that we'll be importing two files that aren't created yet, I just want us to see the router before getting into details on the pages we're making.

**src/App.js**

```jsx
import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Home from './pages/Home';
import Admin from './pages/Admin';

function App(props) {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home Page</Link>
          </li>
          <li>
            <Link to="/admin">Admin Page</Link>
          </li>
        </ul>
        <Route exact path="/" component={Home} />
        <Route path="/admin" component={Admin} />
      </div>
    </Router>
  );
}

export default App;
```

We'll also create those two components for the home page and the admin page now. Let's create a new folder in the `src` directory called `pages.` We're going to create two new pages in this directory. They'll be called unsurprisingly, `Home.js` and `Admin.js.` You won't need to import them though, because we already did above.

**src/pages/Home.js**

```jsx
import React from "react";

function Home(props) {
  return <div>Home Page</div>;
}

export default Home;

```

**src/pages/Admin.js**

```jsx
import React from "react";

function Admin(props) {
  return <div>Admin Page</div>;
}

export default Admin;

```

That should do for setting up the initial structure of the project. From here we can start adding the pieces of our authentication system. Be sure to give it a test run with `npm start.` You should be able to navigate between the pages, and only the Home Page or Admin Page should show.

## Wait, what did we do so far?

Before we move on, let's make sure we have a fundamental understanding of SPA's and react-router. If you've worked with routers and SPA's before, you're welcome to jump over this piece!

Create-React-App is a fantastic project which handles a lot of the heavy work for creating a new React application. Behind the scenes, there a lot of different pieces that need to be put together, particularly with module bundling. That topic is one for a different day, but for our sake, it allows us to just focus on the app itself, without having to worry about configuration. 

Now there several different ways we can present web pages to users. Traditionally, web pages were served to users from a web server. The user would go to a URL like `http://www.dennyssweetwebsite.com/hello,` the server hosting my web site would get the request, find out the page they were looking for (in this case, `hello`) and return the user `hello.html,` which was an HTML file residing on the server. 

As the web grew more complex, these calls would resolve to a server application, running on something like `PHP` which would generate the HTML page for the user and return that data. The critical piece to note here is that the URL specified by the user was directly related to a route on a web server. So generating and returning that content was an actual address to the web.

On the other hand, Create React App scaffolds a client-side [Single Page Application (or **SPA**)](https://en.wikipedia.org/wiki/Single-page_application). Single Page Applications are web apps that reside entirely on the user's browser. When a user makes a request for `www.dennyssweetwebsite.com` they are instead handed my entire application. From there, we don't actually even need URLs. What the user can view can directly be handled by the state, without ever changing the URL.

The trick is, browsers and users are still highly dependent on the URL. Browsers allow you to move back and forth in history, bookmark specific pages, etc. Users may bookmark particular pages and want to jump directly there. They even may memorize URL's. Also, in all fairness, URLs are an excellent way to separate our content, especially when it comes to things like route-based [lazy loading](https://reactjs.org/docs/code-splitting.html). For that matter, many Single page applications still use a routing system to split their content. All this does is read the given URL, and instead of passing that change to a server, it will instead display a component for a given URL. Rendering a component based on the route is precisely what we did in `App.js` above. Alright, the history lesson is over, lets jump into building some private routes.

## Private and Public Routes

The first thing we want to set up is a new route component we'll call `PrivateRoute.` This decorator will be used by any route that needs to be behind authentication. Simple enough, let's make a new file in the `src` directory called `PrivateRoute.js.` 

**src/PrivateRoute.js**

```jsx
import React from 'react';
import { Route } from 'react-router-dom';

function PrivateRoute({ component: Component, ...rest }) {
  
  return(
    <Route {...rest} render={(props) => (
      <Component {...props} />
    )}
    />
  );
}

export default PrivateRoute;
```

You'll notice here, we haven't added any authentication logic just yet. We are merely rendering the route that is passed in, just like a public route. We have changed the API slightly though. We are using the [Render Props](https://reactjs.org/docs/render-props.html) style for the route here instead. This will make more sense later when we add logic for authentication. For now, assume it does the same thing as using the `Component` props of the public routes.

Now if you look in that render props, its obvious we should have a bit of authentication inside of it. But we don't have any of that set up quite yet. We aren't using Redux, but we may want to have authentication data throughout our app. To avoid prop drilling, we are going to use the [Context API](https://reactjs.org/docs/context.html). We'll have another blog in the future on the extent of the Context API, but for now, let's assume data we place into it, can be removed anywhere in the react tree. Behind the scenes, this is what redux uses.

First things first, we are going to create a new context. I've created a folder called `context` in the src directory. Inside that, I'll create a new file called `auth.js.`

**src/context/auth.js**

```js
import { createContext, useContext } from 'react';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
```

Here we create our next context, as well as create a [hook](https://reactjs.org/docs/hooks-intro.html) for using this context called `useAuth.` We'll come back to this a little bit later. As of right now, no logic is done, it will pull whatever data it finds in the AuthContext. To use our new context, we will need to add a provider to react. We'll add this provider in the `App.js` file. While we're doing that, let's also change our Admin route to use the new `PrivateRoute` component.

**src/App.js**

```jsx
import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import PrivateRoute from './PrivateRoute';
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { AuthContext } from "./context/auth";

function App(props) {
  return (
    <AuthContext.Provider value={false}>
      <Router>
        <div>
          <ul>
            ...
          </ul>
          <Route exact path="/" component={Home} />
          <PrivateRoute path="/admin" component={Admin} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

```

## Redirect to Home

With our PrivateRoute technically made, the only real way to make it "work" is to have the user unable to access a page if they are not authenticated. So lets complete our second goal, and redirect them to the home page if they are not currently authenticated. We'll hook this up later to the login page.

Notice that we are passing the value `false` for the Provider. This means that our `useAuth` hook will always return false when checking the authentication; therefore, all private routes are inaccessible. Not ideal, but great for us to test with right now! To get this functionality working, we just need to add the `useAuth` hook to the `PrivateRoute` component.

**src/PrivateRoute.js**

```jsx
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./context/auth";

function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
}

export default PrivateRoute;

```

Here, we are using our hook and pulling whatever value is stored in our AuthContext. Later on, we will be using tokens to update this value. As of right now, it is set to false. That means `isAuthenticated` will always be false. So when we hit the logic in our Route render prop, it will always redirect us to the home page. Later this will be to the login page, but for now, if you test this out, you should be unable ever to reach the admin page. You will always be stuck on the home page. 

![privateRoute](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/privateRoute.gif)

To make sure this is working, trying changing the Provider value to `true` in `App.js.` You should now be free to go where ever you like. Let's change the context value back to `false` and keep going.

## Create Login and Signup Page

Let's create a login and a signup page. I'm going to try and make this  minimalist as possible, while still following some of Brad Frost's guidelines highlighted above. With that said, we're going to start off with a few components we'll be using in our pages. First, we are going to make two new folders in `src,` `components,` and `img.` 

Let's start with an `AuthForm` component. For the sake of simplicity, it's just going to have some styled-components, that we will be sharing between Login and Signup.

**src/components/AuthForm.js**

```css
import styled from 'styled-components';

const Card = styled.div`
  box-sizing: border-box;
  max-width: 410px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid #999;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const Button = styled.button`
  background: linear-gradient(to bottom, #6371c7, #5563c1);
  border-color: #3f4eae;
  border-radius: 3px;
  padding: 1rem;
  color: white;
  font-weight: 700;
  width: 100%;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const Logo = styled.img`
  width: 50%;
  margin-bottom: 1rem;
`;

const Error = styled.div`
  background-color: red;
`;

export { Form, Input, Button, Logo, Card, Erroer };
```

The components are pretty self-explanatory, and since our focus is primarily on the private routing logic, I'm not going to spend time describing this, but we'll be able to use the components, to build both our Login and Signup page. 

The only other piece we'll need to set up beforehand is a logo to use about the Signup and Login forms. I've just placed an arbitrary logo in `src/img/logo.jpg.` You'll see it used in our pages in a moment. 

Let's make the Login and Signup pages now.

**src/pages/Login.js**

```jsx
import React from "react";
import { Link } from 'react-router-dom';
import logoImg from "../img/logo.jpg";
import { Card, Logo, Form, Input, Button } from '../components/AuthForms';

function Login() {
  return (
    <Card>
      <Logo src={logoImg} />
      <Form>
        <Input type="email" placeholder="email" />
        <Input type="password" placeholder="password" />
        <Button>Sign In</Button>
      </Form>
      <Link to="/signup">Don't have an account?</Link>
    </Card>
  );
}

export default Login;

```

**src/pages/Signup.js**

```jsx
import React from "react";
import { Link } from 'react-router-dom';
import logoImg from "../img/logo.jpg";
import { Card, Logo, Form, Input, Button } from '../components/AuthForms';

function Signup() {
  return (
    <Card>
      <Logo src={logoImg} />
      <Form>
        <Input type="email" placeholder="email" />
        <Input type="password" placeholder="password" />
        <Input type="password" placeholder="password again" />
        <Button>Sign Up</Button>
      </Form>
      <Link to="/login">Already have an account?</Link>
    </Card>
  );
}

export default Signup;

```

Both of these are very similar right now but would have more specific logic in the future. We won't be diving further into signup, but it's there for you!

Next, we need to add these new routes. Since these are used by users to log in or create their account, they are public routes.

**src/App.js**

```jsx
import React from "react";
...
import Login from "./pages/Login";
import Signup from './pages/Signup';
...

function App(props) {
  return (
    <AuthContext.Provider value={false}>
      <Router>
        ...
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <PrivateRoute path="/admin" component={Admin} />
       ...

```

You should now be able to jump to the login and sign up pages by writing in the URL. We can add buttons later, but you should also be able to navigate back and forth between the two pages by hitting the link below the Sign in/ Sign up button.

![image-20190714202956466](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/arbitrary.png)

One last small addition, when the user attempts to go to Private Route, we want to redirect the user back to the login page. This just requires a minor update in the `redirect` of the `PrivateRoute` component.

**src/PrivateRoute.js**

```jsx
...
return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
...
```



## Token Authentication

We're going to add basic token authentication to our web app. We won't go deep into security, perhaps that can be covered in a different blog. For now, we are going to build a token system that calls a login endpoint with a username and password and stores those tokens in our state and local storage. Whenever we visit a private route page, we will check the state for tokens, if there is none, we review the local storage. If neither exists, we direct the user to the login page. You'll notice a lot of the pieces are already set up for this, we just need to plugin some logic.

The first step, let's update our `App.js` with some new state for our auth provider context. By using state with our context provider, we allow our context data to be dynamic, that is, they don't need to be set before runtime. They can change depending on the user's input. Let's see that in action.

**App.js**

```jsx
import React, { useState } from "react"
...
function App(props) {
  const [authTokens, setAuthTokens] = useState();
  
  const setTokens = (data) => {
    localStorage.setItem("tokens", JSON.stringify(data));
    setAuthTokens(data);
  }

  return (
    <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
     ...
    </AuthContext.Provider>
  );
}
...
```

Now any component using our AuthContext can both get tokens and set the tokens. Lets plugin this logic into our login page. While we're at it, we'll add state using the [useState hook](https://reactjs.org/docs/hooks-state.html) for our login form, and allow the user to click "Sign In" to trigger the login flow. Note, I've added an `Axios` call. You can read more about Axios on their [github](https://github.com/axios/axios). The URL we pass is obviously not a real URL and will require it points to somewhere that distributes a token.

**Login.js**

```jsx
import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from 'axios';
import logoImg from "../img/logo.jpg";
import { Card, Logo, Form, Input, Button, Error } from "../components/AuthForms";
import { useAuth } from "../context/auth";

function Login() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthTokens } = useAuth();

  function postLogin() {
    axios.post("https://www.somePlace.com/auth/login", {
      userName,
      password
    }).then(result => {
      if (result.status === 200) {
        setAuthTokens(result.data);
        setLoggedIn(true);
      } else {
        setIsError(true);
      }
    }).catch(e => {
      setIsError(true);
    });
  }

  if (isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Card>
      <Logo src={logoImg} />
      <Form>
        <Input
          type="username"
          value={userName}
          onChange={e => {
            setUserName(e.target.value);
          }}
          placeholder="email"
        />
        <Input
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
          placeholder="password"
        />
        <Button onClick={postLogin}>Sign In</Button>
      </Form>
      <Link to="/signup">Don't have an account?</Link>
        { isError &&<Error>The username or password provided were incorrect!</Error> }
    </Card>
  );
}

export default Login;

```

I'm not going to be diving into the signup flow, because it's almost identical to the login flow. A couple of differences, the requirement of the password field for a second time, perhaps some other personal info, and using the signup URL instead of login. 

Now, since we've moved this to a token flow, and changed the objects within our Auth Context on `App.js,` the `isAuthenticated` variable in `PrivateRoute.js` is actually pointing towards an object that looks like this:

```js
{
    authTokens: 'some token string',
    setAuthTokens: func
}
```

Even if no values are assigned, our `isAuthenticated` is going to be true, as the object always exists. For the sake of keeping this blog more straightforward, we're going to assume having `authTokens` means you are authenticated. Later on, when a call occurs where our auth tokens are indicated to be expired, we'll clear this token, as well as [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). This will also happen when a user logs out.

So let's update that now. First, we use the new `useAuth` hook to get our tokens from context. We'll check if the `authTokens` have been set, if they do render the component, if not we redirect them back to the login.

**PrivateRoute.js**

```jsx
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./context/auth";

function PrivateRoute({ component: Component, ...rest }) {
  const { authTokens } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        authTokens ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
}

export default PrivateRoute;
```

## Logging out and expired tokens

The last piece to our token authentication is handling expired tokens or removing the tokens in general when the user logs out. The first piece will be the logout flow, as it will be a bit simpler, and give us a strong base to work off of. 

When logging out, we can assume that all tokens, both in our state and in our local storage, need to be removed. Let's make a simple button for that in the admin page. FYI, it's going to be a massive button on that page.

**Admin.js**

```jsx
import React from "react";
import { Button } from "../components/AuthForms";
import { useAuth } from "../context/auth";

function Admin(props) {
  const { setAuthTokens } = useAuth();

  function logOut() {
    setAuthTokens();
  }

  return (
    <div>
      <div>Admin Page</div>
      <Button onClick={logOut}>Log out</Button>
    </div>
  );
}

export default Admin;
```

## Redirect To Referer after login if available

Let's think of the approach users take to reach our web app. Up to this point, we can assume a user has entered our home page and then decided "I'm going to log in," so they navigate to our `login` route, sign in, and are taken to the dashboard. 

My expected flow would be attempting to view a page that requires an auth token would redirect me to log in. Once I successfully login, I will be redirected back to the page I was initially trying to view. Right now, the user will be redirected to the home page. Let's add a referer value to the Login state.

**Login.js**

```jsx
...
function Login(props) {
 ...
  const referer = props.location.state.referer || '/';

  ...

  if (isLoggedIn) {
    return <Redirect to={referer} />;
  }
  ...
```

Now, when the user logs in, they will either be redirected to the referer, or to the home page. Let's add this new state pass in the redirect of our `PrivateRoute.js`

**PrivateRoute.js**

```jsx
...
function PrivateRoute({ component: Component, ...rest }) {
  ...

  return (
    ...
          <Redirect
            to={{ pathname: "/login", state: { referer: props.location } }}
          />
    ...
```

The user should now be redirected back to the page they were initially attempting to view.

## Closing Thoughts

That does it for a basic walkthrough. So we're ready for prod right? Well I wouldn't get too comfy, there's a lot more work to be done.

![abe](https://raw.githubusercontent.com/DennyScott/dennyscott.io/master/static/media/abe.gif)

Some other things that could be important are:

- a user object that has necessary user data
- checking the token on the initial app mount to determine if it's expired
- cascading permissions, where a manager "restriction" means, the manager and anything above (for example, an admin) have permissions to the page.
- Better [security](https://developer.mozilla.org/en-US/docs/Web/Security), [error logging](https://reactjs.org/docs/error-boundaries.html), loading, etc

Perhaps that's a blog for another day. Hopefully, this was helpful for everyone to get a basic start, it's a bit different than my usual performance related blogs, they're fun to do from time to time. 

As I said, this is a pretty basic introduction, but I've been finding myself using patterns like this more from time to time. As I get more into blogging, I plan to include more basic guide blogs or component design blogs like this. If you have any suggestions, shoot me a tweet at my link below.

As always, the code for this project can be found on my GitHub [here](https://github.com/DennyScott/react-router-auth).

## References and Further Reading

http://bradfrost.com/blog/post/dont-get-clever-with-login-forms/

https://reactjs.org/

https://www.styled-components.com

https://reacttraining.com/react-router/web/guides/quick-start

https://redux.js.org/

https://github.com/facebook/create-react-app

https://github.com/axios/axios

https://en.wikipedia.org/wiki/Single-page_application

https://reactjs.org/docs/code-splitting.html

https://reactjs.org/docs/context.html

https://reactjs.org/docs/hooks-intro.html

https://reactjs.org/docs/hooks-state.html

https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

https://developer.mozilla.org/en-US/docs/Web/Security

https://github.com/DennyScott/react-router-auth

https://jwt.io/

https://reactjs.org/docs/error-boundaries.html

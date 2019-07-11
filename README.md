Get going with `yarn install && yarn start`

# Barebones Authentication with AWS-Amplify

This is meant to demonstrate how to create an application AWS-Amplify with a focus on Authentication.

Some pages will require authentication, other will not require it. 

Please note that I will be assuming familiarity with react and react-router. I will be assuming that you may be fairly new to AWS and the Amplify library, so we will touch on those elements in more detail.

## Application and AWS Setup

1.  First, let's create an app. We'll be using create-react-app for this walkthrough. If you don't have it already you can install it by running `yarn global add create-react-app` in a terminal window. Once `create-react-app` is installed, run the following command to create a new application.

`create-react-app amplify-auth-examples`

`cd amplify-auth-examples`

2.  Next, we want to initialize our project using the `awsmobile` CLI. If you don't already have it, you can install by running `npm install -g awsmobile` in a terminal window.

Before we go forward, we need to setup a user to act as the admin for our project so the CLI can access the things it needs (e.g. permissions to provision AWS services for us on our behalf). Head over to [AWS IAM Management](https://console.aws.amazon.com/iam/home?region=us-east-1#/home) and login with your AWS credentials.

3.  Next, click on `Users` on the left-hand menu. Click the `Add User` button at the top. Enter a username, like `amplify-auth-examples-admin` and select the checkbox next to `Programmatic access` for the `Access Type`. Click `Next`.

4.  On the next screen, click the `Create group` button beneath the `Add user to group` heading. For the `group name`, enter `AuthAdministrator` or something similar and select the checkbox next to the `AdministratorAccess` item from the list. Click `Create group` at the bottom of the screen to confirm and close the dialog. Click the `Next:Review` button at the bottom.

5.  On the next screen, click the `Create user` button.

6.  You should see a success message at the top of the page confirming that our user was created successfully. At this point, you can download the CSV using the button provided, or copy the `Access key ID` and `Secret access key` elsewhere. We will need them in just a minute.

7.  Back in your terminal, run the following command in the terminal to initialize `awsmobile`:

`awsmobile init`

This will prompt you multiple times, and you can press enter to accept the defaults for each of the first four prompts. After these prompts, it will say `missing aws account settings`. It will ask if you want to configure aws account settings. Type `Y` to accept.

This is where the `Access key ID` and `Secret access key` come into play. Paste the `Access key ID` and `Secret access key` when it promps for it. (If you don't have them or you mess up, you can just press `Ctrl + C` (`Cmd` on OSX) to exit and try again.) Use the arrow keys to select `us-east-1` for the region and press enter. It will ask what name you would like to use for the project. Press enter to accept the default or choose your own. It will take a second to initialize your project and leave you back at the command-line.

8.  Next, we need to initailize `user-signin` to allow us to interact with AWS Cognito and provide authentication functionality for our users. Run the following commands in the terminal.

`awsmobile user-signin enable`

Press enter to accept the default.

`awsmobile push`

This command will sync your local configuration changes to your project in [Mobile Hub](https://console.aws.amazon.com/mobilehub/home?region=us-east-1#/).

Just to make sure everything is working, let's test the app by running `yarn start` at the command line. The application should start and you should see the default `create-react-app` splash page.

## Home Page & Header Links

Next, we need to install `react-router`, `react-router-dom`, and the `aws-amplify-react` library.

`yarn add react-router react-router-dom aws-amplify-react`

These get our libraries out of the way. We'll be focusing on `App.js` from now on. Open that file and delete everything inside the `div` tag with the `className` of `App`. In its place, just put an `<h1>` tag with the words `Home Page`. You can delete the `logo` import as well. Your `App.js` should look like this:

```javascript
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Amplify Routes Example</h1>
      </div>
    );
  }
}

export default App;
```

We're not going to worry about creating separate files. I'll leave that as an exercise for the reader. :P

Next, we'll add a simple routes structure to demonstrate having different pages. Since I'm assuming some familiarity with `react-router`, I'm not going to go as in depth on these. If you need a primer, you can check out [this article](https://medium.com/@mwarger/one-router-to-rule-them-all-c073f5d66361) or the [official docs](https://reacttraining.com/react-router/).

Add the `Link` and `Router` imports from `react-router-dom` to the imports section on the page.

`import { Link, BrowserRouter as Router } from 'react-router-dom';`

Beneath the imports, add the following functional component.

```javascript
const HeaderLinks = props => (
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/auth">Create Account/Login</Link>
    </li>
    <li>
      <Link to="/secret">Secret Page</Link>
    </li>
    <li>
      <Link to="/about">
        About Page (we don't care if you're logged in or not)
      </Link>
    </li>
  </ul>
);
```

Add the declaration for this component beneat the `h1` in our `App` declaration. We also need to add our `Router` component so `react-router` can compose the `Link` component properly.

```javascript
class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Amplify Routes Example</h1>

        <HeaderLinks />
      </div>
    );
  }
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
```

## Routes

Now let's add some router outlet to our application. This will be the place where our different route components get injected in the page when we click on our header links.

Create a `Routes` functional component with the following code. Place it right above the `App` declaration.

```javascript
class AuthComponent extends Component {
  render() {
    return <div>AuthComponent Section</div>;
  }
}

const Routes = () => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <Route exact path="/auth" render={AuthComponent} />
    <Route
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);
```

We will come back to the `AuthComponent` component in a bit to implement our authentication with `aws-amplify`.

Place the declaration for this beneath the `HeaderLinks` declaration in the `App`.

```javascript
class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Amplify Routes Example</h1>

        <HeaderLinks />
        <br />
        <Routes />
      </div>
    );
  }
}
```

If you run your app now, you should see that clicking on the links load the different pieces of content we have defined for each of our routes. However, we want the secret page to only be accessible to logged in users, and if someone tries to access it, they should be redirected to the `auth` page to login or create an account. Let's implement this functionality.

## Protected Routes

We're going to implement a `ProtectedRoute` component that prevents the user from accessing content unless they're logged in. This will follow the same structure as a `Route` from `react-router`; we will just be passing some additional information to it.

1.  Right above the `AuthComponent` component declaration, create a `ProtectedRoute` component with the same `Route` as our secret route.

```javascript
const ProtectedRoute = props => (
  <Route
    exact
    path="/secret"
    render={() => <div>Keep it secret! Keep it safe!</div>}
  />
);
```

2.  Because we will be using this in place of our `Route`, the elements that our specific to our component will be passed in. This means that we will replace them with the props of the component.

```javascript
const ProtectedRoute = props => (
  <Route exact={props.exact} path={props.path} render={props.render} />
);
```

3.  Replace the `Route` declaration for the secret page in our `Routes` list and you should see that everything is working the same way as before.

```javascript
const Routes = () => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <Route exact path="/auth" render={AuthComponent} />
    <ProtectedRoute
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);
```

4.  We have successfully replaced our `Route` with our `ProtectedRoute`! Now we can work to implement the logic to redirect if the user is not logged in. This will take one more change to our `App` component and the `Routes` component. Above the `render` method of the `App` component, declare the following state object so we can track whether the user is logged in.

```
state = {
  authState: {
    isLoggedIn: false
  }
};
```

5.  Let's pass this to our `Routes` component in our `App` as an `authState` prop.

```javascript
...
<div className="App">
  <h1>Amplify Routes Example</h1>

  <HeaderLinks />
  <br />
  <Routes authState={this.state.authState} />
</div>
...
```

6.  Next, update our `Routes` declaration to accept these new props and pass it down to our `ProtectedRoute`.

```javascript
const Routes = ({ authState }) => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <Route exact path="/auth" render={AuthComponent} />
    <ProtectedRoute
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
      props={authState}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);
```

7.  Now we need to implement our redirect. If the user is logged in, we want to render the component we passed in. If the user is not logged in, we want to redirect them to the auth page and store the redirect URL so we can let them to continue to the intended page after they have logged in.

Add the `Redirect` import to our `react-router-dom` import at the top of `App.js`.

`import { Link, BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';`

8.  Update the ProtectedRoute declaration to handle our new state that's passed in.

```javascript
const ProtectedRoute = props => (
  <Route
    exact={props.exact}
    path={props.path}
    render={rProps =>
      props.props.isLoggedIn ? (
        <props.render exact={props.exact} />
      ) : (
        <Redirect
          to={`/auth?redirect=${props.location.pathname}${
            props.location.search
          }`}
        />
      )
    }
  />
);
```

If you try your app now, you should see that clicking the Secret Page link should change the URL and content to render the `auth` route, while keeping the redirect set to the `secret` route. Change the `isLoggedIn` state to true to test what happens if the user `isLoggedIn`. This time, you should pass straight to the `secret` route without any redirect.

9.  Finally, we need to clean up from our component evolution. It works as is, but we can use destructuring to clarify our meaning and make it look prettier. Let's start by descturing out the props that we care about.

```javascript
const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  ...
```

Here, we have taken the `render` prop that contains our `div`, and rename it to `C`. This is the Component that we eventually want to render. We rename `props` to `childProps` because we're going to pass it to the child component that we will eventually render (in this case, `C`). Finally, we take all the other props and assign them to the `rest` variable using the spread operator.

The following snippet is the entire component. It uses the `C` declaration to create a component and spread the `rProps` from the `render` prop and the `childProps` from our parent component so that our final rendered component has everything that we passed down to begin with. The redirect is the same as before.

```javascript
const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={rProps =>
      childProps.isLoggedIn ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={`/auth?redirect=${rProps.location.pathname}${
            rProps.location.search
          }`}
        />
      )
    }
  />
);
```

This gives us a good foundation to implement our `AuthComponent` component using `aws-amplify`. Let's continue.

## Authentication

Let's change our focus to the AuthComponent component we stubbed our earlier. It should look like this.

```javascript
class AuthComponent extends Component {
  render() {
    return <div>Auth Section</div>;
  }
}
```

That's fairly simple. Let's add the basic `aws-amplify` `Authenticator` component. We have to add it to the imports at the top of the page.

`import { Authenticator } from 'aws-amplify-react';`

Replace our `Auth Section` text in the `AuthComponent` with the `Authenticator` declaration.

```javascript
class AuthComponent extends Component {
  render() {
    return (
      <div>
        <Authenticator />
      </div>
    );
  }
}
```

You should see the component on the page when you go to the auth route.

![Authenticator](./assets/authenticator-example.png 'Authenticator')

The nice part about Amplify is that this is all there is to it. We now have Authentication available to us in a simple way. However, we are diverging from the more common use case of wrapping our entire app with this component. This will enable us to have certain sections of the app where the user need not be logged in to interact with our application. We want to be able to communicate our authenticated state to the rest of the app. This is where the amplify library can also help us. It provides a hook for handling the change of state that occurs with this component. It's called `onStateChange`. Let's implement that now.

Inside your `AuthComponent` component declaration, create a method called `handleStateChange`. This is what will take in the state of the component and allow us to check against it. The code for this method is below.

```javascript
class AuthComponent extends Component {
  handleStateChange = state => {
    if (state === 'signedIn') {
      // handle state change
    }
  };
  render() {
    return (
      <div>
        <Authenticator />
      </div>
    );
  }
}
```

Update the `Authenticator` to use this method.

```javascript
class AuthComponent extends Component {
  handleStateChange = state => {
    if (state === 'signedIn') {
      // handle state change
    }
  };
  render() {
    return (
      <div>
        <Authenticator onStateChange={this.handleStateChange} />
      </div>
    );
  }
}
```

This should be all we need to enable the creation of a user. However, if you try, you will get an error that says `No userPool`. This is because we have not yet told the amplify library to use the configuration we setup earlier. Let's do that now.

Import the `Amplify` and `Auth` libraries from `aws-amplify`.

`import Amplify, { Auth } from 'aws-amplify';`

We need to also import the aws_exports configuration that was created for us when we ran `awsmobile init`.

`import aws_exports from './aws-exports';`

Now, we can use that configuration file to configure the `Amplify` library. Add the following line just below the imports at the top of `App.js`.

`Amplify.configure(aws_exports);`

With this out of the way, head over to the auth page and use the Authenticator to create a user. The default settings have multi-factor authentication (MFA) turned on, so you'll go through a couple text messages to sign up and login, and if successful, you should see a greeting like this.

![Hello amplify_user](./assets/hello_user.png 'Authenticator')

Success!

Let's add a console log statement to our `handleStateChange` function to see what this component is doing.

```javascript
...
handleStateChange = state => {
    console.log(state);
    if (state === 'signedIn') {
      // handle state change
    }
  };
```

Try logging in, and watch the console. You should see `confirmSignIn` and `signedIn` events that are passed to our `handleStateChange` function.

Now that we can get access to our state, let's implement the hook that allows us to tell the rest of the app when we are logged in.

Recall from earlier that we have our `isLoggedIn` state available at the application level. This is what we can pass to our components to let us know if the user is logged in. We need to be able to update this piece of state, so we need to pass a function to our `AuthComponent` to let us do this.

1.  In the App component, create a function called `handleUserSignIn`.

```javascript
handleUserSignIn = () => {
  this.setState({ authState: { isLoggedIn: true } });
};
```

2.  Replace the render method with the following snippet. This will collect our multiple props into a childProps object that we can pass into our routes.

```javascript
render() {
  const childProps = {
    isLoggedIn: this.state.authState.isLoggedIn,
    onUserSignIn: this.handleUserSignIn
  };

  return (
    <div className="App">
      <h1>Amplify Routes Example</h1>

      <HeaderLinks />
      <br />
      <Routes childProps={childProps} />
    </div>
  );
}
```

3.  Before we can pass our function to our auth route, we need to create a route that accepts props. This will be very similar to our authenticated route, but we won't care whether the user is logged in or not. Create a new functional component called `ProppedRoute` right beneat the `ProtectedRoute`.

```javascript
const ProppedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
);
```

4.  Update the `Routes` component to accept the new `childProps` prop and pass it to the auth route, which we have changed to be our new `ProppedRoute` component.

```javascript
const Routes = ({ childProps }) => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <ProppedRoute
      exact
      path="/auth"
      render={AuthComponent}
      props={childProps}
    />
    <ProtectedRoute
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
      props={childProps}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);
```

5.  Now that we have a function we can use to alert the app that we're signed in, let's wire it up. In the `AuthComponent`, replace the `//handle state change` comment with a call to the `onUserSignIn` function prop.

```javascript
handleStateChange = state => {
  console.log(state);
  if (state === 'signedIn') {
    this.props.onUserSignIn();
  }
};
```

6.  To check that it worked, add this snippet beneath the `HeaderLinks` component to let us know the status of the user. Sign out and refresh the app. Head to the auth page and sign in. You should see the text change from 'Not Logged In' to 'User is Logged In', confirming that our state update took place!

```javascript
<div>
  {this.state.authState.isLoggedIn ? 'User is Logged In' : 'Not Logged In'}
</div>
```

## That's it!

I hope this was a clear and concise introduction to using `aws-amplify` for authentication between different types of routes. If you noticed, there's actually very little hanging off `amplify` itself. The key is using the library to abstract out the tedious bits, and hang your application state off of it to utilize wherever you need it. This example should serve as a great baseline to expand upon when you need different elements of authentication state among different components and routes.

The code for this walkthrough in its entirety can be found [here](https://github.com/mwarger/amplify-auth-examples).

The text in markdown format is available [here](https://github.com/mwarger/amplify-auth-examples/blob/master/README.md)

I can be reached on Twitter [@mwarger](https://twitter.com/mwarger) - hit me up for any questions or if you see any problems with this example.

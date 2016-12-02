# Developer Dashboard for FaunaDB

This dashboard should eventually provide access to the entire Fauna API as accesible to cloud users and developers at on-premise sites, but at first it will be narrowly focussed on a few screens and use cases. It will have a companion UI that is accesible to our cloud ops team, and to on-premise customer ops teams. Both will be shipped as part of the Fauna JAR. The Dev dashboard is where you land when you first join cloud.

## To Run in Development

First get a Fauna secret that you want to use as your root. It's better if this
is an admin secret but we support any type of secret by using capability detection.

Clone this repo, install the dependencies, and launch the development server.

```sh
git clone https://github.com/faunadb/dashboard
cd console
npm install
npm start
```

Visit http://localhost:3000/ and your app will be available. Enter the Fauna key
secret and start browsing your data.

## Build for production

The console is packaged for bundling with the Fauna JAR using `npm run build`.

## Toolchain info

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Tooling guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

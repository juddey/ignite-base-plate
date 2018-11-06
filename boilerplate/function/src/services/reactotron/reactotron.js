import Reactotron from 'reactotron-react-native'

console.disableYellowBox = true

// in dev, we attach Reactotron, in prod we attach a interface-compatible mock.
if (__DEV__) {
  console.tron = Reactotron // attach reactotron to `console.tron`
}

// First, set some configuration settings on how to connect to the app
Reactotron.configure({
  name: 'Demo App',
  // host: '10.0.2.2',
  // port: 9090
})

// add every built-in react native feature.  you also have the ability to pass
// an object as a parameter to configure each individual react-native plugin
// if you'd like.
Reactotron.useReactNative({
  asyncStorage: { ignore: ['secret'] }
})

// if we're running in DEV mode, then let's connect!

if (__DEV__) {
  Reactotron.connect()
  Reactotron.clear()
}

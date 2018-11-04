# ignite-magic-plate

A minimalistic boilerplate setup for ignite.

### Install

```js
  ignite new <projectname> -b ignite-magic-plate 
```

### The Rest.

You'll be asked to choose: 
 - file structure (function* or feature)
 - linting (yes or no)
 - storybooks (yeah or nah)
 - internationalisation (yay or nay)

### What happens if I answer...
Yes to.... | You get this from the :robot:
------------ | -------------
Feature File Structure | The template will assume you are writing your app  feature-first. Your app will live in a `src` directory, with a structure similar to the [ignite bowser](https://github.com/infinitered/ignite-ir-boilerplate-bowser/#quick-start) boilerplate.
Linting | You'll get prettier and standard, linked through prettier-standard, set up to lint your app directories.
i18n | `react-native-i18n` will be installed, with your translation files living at `src/i18n`. It'll also be linked through `react-native-link`*.
Storybooks | A basic storybooks setup will be configured to run on port `7007`.

I'm not even asking whether we should install [reactotron](https://github.com/infinitered/reactotron). You need a debugger, and this is the best out there.

ProTip: Adding the `--max` flag will give you i18n, storybooks, linting and the feature file structure, without going through the options.

### Where to Now?
Now you've got the magic plate :fork_and_knife:, you can start adding! The following plugins are compatible with magic-plate:

* ignite-react-native-navigation - adds wix's react-native-navigation
* ignite-detox - E2E tests with the detox framework.
* ... more coming soon!

Enjoy!

#### Notes: 
* the function file structure is coming soon....
* inasmuch as `react-native link` is reliable.

#### FAQ: 

1. Why not typescript?

Soon, grasshopper.

#### License
MIT.
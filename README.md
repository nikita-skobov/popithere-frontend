# UPDATE 3/31/2019
The domain has been deleted. I don't receive enough traffic on the site to justify paying for the domain name. I will, however, keep the repository open.



# Pop It Here!

This is the code for the website popithere.com

I am releasing this publically for two reasons:

- For aspiring developers to see how I write my code, and potentially learn how bigger projects are maintained (Although I would not describe my code to be very good, I feel that it would still be of use to some people)
- For other developers who enjoy the site to be able to make their own additions to it
  - I tried to structure the website in a modular way such that other developers can create their own 'Games' and addons. Feel free to [join the Discord](https://discord.gg/WgppuWr) to discuss features you'd like to add, and I'd be happy to help you get started.

## Local Development:

```sh
git clone https://github.com/nikita-skobov/popithere-frontend.git
cd popithere-frontend/
cd frontend/
# NOTE: I am using eslint. If you do not want to use my eslint setup
# please remove the following from your package.json before installing:
#    "eslint": "^5.7.0",
#    "eslint-config-airbnb": "^17.1.0",
#    "eslint-plugin-import": "^2.14.0",
#    "eslint-plugin-jsx-a11y": "^6.1.2",
#    "eslint-plugin-react": "^7.11.1",
# And you can also remove the .eslintrc.js file
npm install
```

Afterwards, if you'd like to run a webpack dev server for continuous in-memory updates do:

```sh
npm run build:server
```

Then you can access the site on http://localhost:3000

Otherwise, if you want to make a single build, and output actual files to the dist/ directory do:

```sh
npm run build
```

### A Note on Local Development:

This site relies on a couple external resources like databases, object storage, a backend API, and socketio servers. If you look at the `frontend/src/customConfig.js` file you will see some URLs listed there. These URLs are only for testing the production, and staging environment integrations, and they will not work on local development. I have added a DEV_MODE flag inside the customConfig file, which when true prevents communication with these external resources. So for local development, you will not be able to load resources, upload data, or send messages to the socket servers. What you can do, however, is edit the PopItHere game files, change the component functionality, add your own games, etc.


## Dependencies:

- Production:
  - [React](https://github.com/facebook/react), ReactDOM for easy user interface building
  - [Reactstrap](https://github.com/reactstrap/reactstrap), [Bootstrap](https://www.npmjs.com/package/bootstrap) for nice-looking, pre-made components
  - [PIXI.js](https://github.com/pixijs/pixi.js/) for easy rendering bindings that will work for either WebGL or Canvas
  - [Socket.io-client](https://github.com/socketio/socket.io-client) for websocket communications
  - [rc-slider](https://www.npmjs.com/package/rc-slider) for a nice-looking, easy-to-use slider component
  - [@dicebear/avatars](https://avatars.dicebear.com/) for generating unique sprites as chat avatars.
  - [bad-words](https://www.npmjs.com/package/bad-words) for basic profanity filtering (and because I'm bad at regex)
  - A modified version of [libgif-js](https://github.com/buzzfeed/libgif-js)
    - I rewrote their gif parser to use only pure functions because their code had extreme memory leaks on FireFox, and Edge browsers. Also I found that there were many options that did nothing at all in the code...
- Development:
  - [Webpack](https://github.com/webpack/webpack) to bundle, minify, and load my code for easy deployments
  - [Webpack-dev-server](https://github.com/webpack/webpack-dev-server) for fast, easy live updates while developing
  - [babel](https://github.com/babel/babel) (and all of its necessary plugins/polyfills) for modern javascript transpilation
  - [prop-types](https://www.npmjs.com/package/prop-types) because eslint yells at me if I dont use prop-types
  - [eslint](https://www.npmjs.com/package/eslint) with [AirBnB style guide](https://www.npmjs.com/package/eslint-config-airbnb) to write nice-looking, modern code

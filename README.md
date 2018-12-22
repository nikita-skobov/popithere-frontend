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

## Dependencies:

- Development:
  - 
exports.firstTimeItems = {
  latest: [
    {
      src: '/images/tutorial_clips/v1/anim__1.gif',
      header: 'This is a quick tutorial on how to use the site. Press the arrow to continue, or click the X at the top if you already know how to use the site.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__1.gif',
      header: 'PopItHere is part game, part collaborative art piece. Users can choose an image or gif and pop it down anywhere on the canvas. Whenever you pop something down, it covers up whatever is underneath. Users see the images pop up in real time!',
    },
    {
      src: '/images/tutorial_clips/v1/anim__3.gif',
      header: 'To choose your image or gif (called a PopIt), click on the burger menu located near the chat bar, and select "Pop It!". Then click "Pre-Made", and then pick a PopIt that you like. If you hover over a PopIt, you will see the name of that PopIt. You can search for specific PopIts via this name.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__4.gif',
      header: 'Now you can click anywhere on the canvas to place down the PopIt. When you click on the canvas, all other users see it show up on their screen in real time.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__5.gif',
      header: 'You can also create your own PopIts by clicking the burger menu, then click "Pop It!", then click "Make your own!"',
    },
    {
      src: '/images/tutorial_clips/v1/anim__6.gif',
      header: 'From here you can create your PopIt. You can add images, gifs, and text. You can position them however you want. When you are ready to submit your PopIt, you can either click "Submit" to submit it right away, or you can click "Preview" to see what your PopIt will look like. Before choosing one of those options, you will be asked to pick a size for your PopIt. The default is 100, which covers up about 5% of the canvas.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__7.gif',
      header: 'After you submit your PopIt, you will be asked if you want to make more PopIts, or if you want to go back to the home page. Back at the home page, you can find your submitted PopIt by going to the PopIt menu, and clicking "My PopIts"',
    },
    {
      src: '/images/tutorial_clips/v1/anim__8.gif',
      header: 'There is also a chat. The avatars in the chat are generated uniquely for each user. If you come back to the site on the same device, you will have the same avatar. If you don\'t like what a user is saying, simply click on the avatar, and click "Mute User". You can also mute the whole chat by clicking the burger menu, and clicking "Mute Chat".',
    },
    {
      src: '/images/tutorial_clips/v1/anim__9.gif',
      header: 'This site has benefits for users who are supporters of my Patreon. If you become a patron, you can place PopIts, upload PopIts, and chat more frequently. There\'s even a feature that allows sending text-to-speech messages for premium patrons! If you would like to learn more about Patreon benefits, click the burger menu, and click "Benefits".',
    },
  ],
}

exports.assetList = [
  {
    name: 'P_rotate',
    url: '/images/temp/rotateBetter.png',
  },
  {
    name: '.placeholder.',
    url: '/images/temp/placeholder.png',
  },
]

exports.defaultButtons = [
  'about',
  'mutechat',
  'benefits',
  'options',
]

exports.benefitTiers = {
  notoken: {
    tts: 0,
    cht: 0,
    pit: 0,
    myo: 0,
    price: 'Free',
  },
  notier: {
    tts: 0,
    cht: 1,
    pit: 5,
    myo: 1,
    price: 'Free',
  },
  basic: {
    tts: 0,
    cht: 3,
    pit: 10,
    myo: 3,
    price: '$1',
  },
  premium: {
    tts: 1,
    cht: 5,
    pit: 20,
    myo: 15,
    price: '$5',
  },
}

exports.DEV_MODE = true

exports.placeholder = {
  name: '.placeholder.',
  url: '/images/temp/placeholder.png',
}

exports.soundClips = {}

exports.githubPage = 'https://github.com/nikita-skobov/popithere-frontend'
exports.discordPage = 'https://discordapp.com/invite/WgppuWr'
exports.websitePage = 'https://equllc.com'
exports.twitterPage = 'https://twitter.com/equLLC'

exports.patreonPage = 'https://www.patreon.com/equilateral'
exports.patreonClientId = 'i2bAT_IDUs86TadxLNJJ4FoTXfMsFCOOPtOyGW2IJEbBxAkb0ue2RCP-DMf0VJlN'

exports.keyDataEndpoint = 'https://api-staging.popithere.com/list/key'
exports.dataFetchBase = 'https://api-staging.popithere.com/'
exports.listDataEndpoint = 'https://api-staging.popithere.com/list/data'
exports.socketEndpoint = 'https://staging-sockets.popithere.com'
exports.loginEndpoint = 'https://api-staging.popithere.com/issue/login'
exports.urlEndpoint = 'https://api-staging.popithere.com/issue/url'
exports.patreonEndpoint = 'https://api-staging.popithere.com/issue/patreon'

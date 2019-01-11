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
      header: 'To choose your image or gif (called a PopIt), click on the burger menu located near the chat bar, and select "Pop It!"',
    },
    {
      src: '/images/tutorial_clips/v1/anim__4.gif',
      header: 'From here, you can either choose a Pre-Made PopIt, or you can create your own. Let\'s start by creating our own',
    },
    {
      src: '/images/tutorial_clips/v1/anim__5.gif',
      header: 'Here, we add a few images, and some text, and rotate/resize our items as needed. When ready, you can click "Submit" to immediately pick a size, and upload your PopIt, or click preview to see what your final PopIt will look like',
    },
    {
      src: '/images/tutorial_clips/v1/anim__6.gif',
      header: 'When picking a size, 100 is the maximum your PopIt is allowed to be. It will cover up about 5% of the canvas',
    },
    {
      src: '/images/tutorial_clips/v1/anim__7.gif',
      header: 'You can choose a size you want. For example, a size of 20 will cover up about 1% of the canvas',
    },
    {
      src: '/images/tutorial_clips/v1/anim__8.gif',
      header: 'If you don\'t like your PopIt, you can go back, and change it, and try to preview it again.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__9.gif',
      header: 'Now that we are ready, we can click Submit. New users are limited to submitting a custom PopIt once every 30 minutes. However, for the alpha version, I have increased this to 10 submissions every 30 minutes.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__10.gif',
      header: 'After you submit a PopIt, the server will tell you an estimate of your "data number". You can use this to search for your PopIt.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__11.gif',
      header: 'After we upload a PopIt, you can stay in the creation screen to make more PopIts, or you can go back to the home page.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__12.gif',
      header: 'Now, let\'s find our PopIt! Click the burger menu again, then "Pop It!" then "Pre-Made", then "Search", then type your data number, and click "Go"',
    },
    {
      src: '/images/tutorial_clips/v1/anim__13.gif',
      header: 'Most of the time we should see it right away. Sometimes it can take up to 5 minutes to upload. If it has been longer than 5 minutes, please file a bug report with your data number.',
    },
    {
      src: '/images/tutorial_clips/v1/anim__14.gif',
      header: 'Now that we have selected our PopIt, simply click anywhere on the canvas to Pop It!',
    },
    {
      src: '/images/tutorial_clips/v1/anim__15.gif',
      header: 'Last thing! There is a chat. The icons that appear are randomly generated based on your user ID. If you don\'t like having a chat, simply click the burger menu and click "Mute Chat"',
    },
  ],
}

exports.assetList = [
  {
    name: 'P_rotate',
    url: '/images/temp/rotateBetter.png',
  },
  {
    name: '8panels',
    url: '/images/temp/8panels.png',
  },
  {
    name: 'test2',
    url: '/images/temp/test1.png',
  },
  {
    name: 'test1',
    url: '/images/temp/hqdefault.jpg',
  },
  {
    name: '.placeholder.',
    url: '/images/temp/placeholder.png',
  },
]

exports.defaultButtons = [
  'options',
  'mutechat',
  'benefits',
]

exports.benefitTiers = {
  notoken: {
    cht: 0,
    pit: 0,
    myo: 0,
    price: 'Free',
  },
  notier: {
    cht: 10,
    pit: 10,
    myo: 10,
    price: 'Free',
  },
  basic: {
    cht: 12,
    pit: 52,
    myo: 12,
    price: '$1 a month',
  },
  premium: {
    cht: 23,
    pit: 103,
    myo: 23,
    price: '$5 a month',
  },
}

exports.DEV_MODE = false

exports.placeholder = {
  name: '.placeholder.',
  url: '/images/temp/placeholder.png',
}

exports.patreonPage = 'https://www.patreon.com/equilateral'
exports.patreonClientId = 'i2bAT_IDUs86TadxLNJJ4FoTXfMsFCOOPtOyGW2IJEbBxAkb0ue2RCP-DMf0VJlN'

exports.keyDataEndpoint = 'https://api-staging.popithere.com/list/key'
exports.dataFetchBase = 'https://api-staging.popithere.com/'
exports.listDataEndpoint = 'https://api-staging.popithere.com/list/data'
exports.socketEndpoint = 'https://staging-sockets.popithere.com'
exports.loginEndpoint = 'https://l48yc0l7sc.execute-api.us-east-1.amazonaws.com/staging/issue/login'
exports.urlEndpoint = 'https://l48yc0l7sc.execute-api.us-east-1.amazonaws.com/staging/issue/url'
exports.patreonEndpoint = 'https://l48yc0l7sc.execute-api.us-east-1.amazonaws.com/staging/issue/patreon'

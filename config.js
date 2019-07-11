'use strict';

module.exports = {
  url: 'https://lumen.netlify.com',
  pathPrefix: '/',
  title: 'Blog by John Doe',
  subtitle: 'Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu.',
  copyright: '© All rights reserved.',
  disqusShortname: '',
  postsPerPage: 4,
  googleAnalyticsId: 'UA-73379983-2',
  menu: [
    {
      label: 'Articles',
      path: '/'
    },
    {
      label: 'About',
      path: '/pages/about'
    },
    {
      label: 'Portfolio',
      path: '/pages/portfolio'
    }
  ],
  author: {
    name: 'Denny Scott',
    photo: '/photo.jpg',
    bio: 'JS Dev. Love hacking around with React, build tools, and UI, occasionally write about it.',
    contacts: {
      twitter: '@gitinbit',
      github: 'DennyScott',
    }
  }
};

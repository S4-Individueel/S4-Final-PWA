/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  dynamicStartUrl: true, // this is same as default value
})

module.exports = withPWA()
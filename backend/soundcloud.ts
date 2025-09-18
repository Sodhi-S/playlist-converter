require('dotenv').config();

export const soundcloudConfig = {
  clientId: process.env.SOUNDCLOUD_CLIENT_ID,
  clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
  redirectUri: process.env.SOUNDCLOUD_REDIRECT_URI,
};

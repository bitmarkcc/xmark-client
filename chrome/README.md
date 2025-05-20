# xmark-client
Browser extension (Chrome/Chromium) for marking your X posts on the Bitmark blockchain

The extension captures mouse click events (post or repost) to send requests to the server (xmark.cc) for marking the latest post. Once a click is made, it waits 10 seconds (for X to update it's database) to send the request. The only data sent in the request is the publicly available user id of the logged in user. User must be logged in to x.com and the posts/reposts must be made from x.com.

You can view a log of the requests sent and responses received by opening the console for the extension's service worker. Simple go to chrome://extensions. Enable developer mode. Under 'Xmark' it should say 'Inspect views service worker'. Click on the 'service worker' link. The console will display short messages/data for each post/repost.

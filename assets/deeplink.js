/*
 * Shared logic for building and decoding app-opening Amazon links.
 * Used by both the generator (index.html) and the redirect page (go/index.html).
 */
(function (global) {
  'use strict';

  // Only Amazon storefronts are allowed as destinations, so this site can't be
  // abused as an open redirect to arbitrary websites.
  var AMAZON_HOST = /^(www\.|smile\.)?amazon\.(com|ca|com\.mx|com\.br|co\.uk|de|fr|it|es|nl|se|pl|com\.be|com\.tr|ae|sa|eg|in|co\.jp|sg|com\.au)$/i;

  var ANDROID_PACKAGE = 'com.amazon.mShop.android.shopping';
  var IOS_SCHEME = 'com.amazon.mobile.shopping.web';

  // Returns a normalized https URL object, or throws with a readable message.
  function parseAmazonUrl(input) {
    var raw = String(input || '').trim();
    if (!raw) throw new Error('Paste an Amazon link first.');
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

    var url;
    try {
      url = new URL(raw);
    } catch (e) {
      throw new Error("That doesn't look like a valid link.");
    }
    if (/^(amzn\.to|a\.co)$/i.test(url.hostname)) {
      throw new Error('Short links like amzn.to can’t be deep linked. Use the full amazon.com link (your Amazon Attribution link).');
    }
    if (!AMAZON_HOST.test(url.hostname)) {
      throw new Error('Only amazon.com (and other Amazon storefront) links are supported.');
    }
    url.protocol = 'https:';
    url.hash = '';
    return url;
  }

  // Links Amazon Attribution can count carry a maas= parameter.
  function hasAttribution(url) {
    return url.searchParams.has('maas');
  }

  function webUrl(url) {
    return url.toString();
  }

  // iOS: Amazon app custom scheme. Inside Facebook/Instagram this triggers the
  // system "Open in Amazon?" prompt, which can't be skipped.
  function iosAppUrl(url) {
    return IOS_SCHEME + '://' + url.host + url.pathname + url.search;
  }

  // Android: intent link naming the Amazon app, with the web link as fallback
  // if the app isn't installed.
  function androidIntentUrl(url) {
    return 'intent://' + url.host + url.pathname + url.search +
      '#Intent;scheme=https;package=' + ANDROID_PACKAGE +
      ';S.browser_fallback_url=' + encodeURIComponent(webUrl(url)) + ';end';
  }

  // base64url so the Amazon link (with its own ?&= characters) survives as a
  // single query value, even after Meta appends &fbclid=...
  function encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decode(token) {
    var b64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function detectPlatform(ua) {
    ua = ua || navigator.userAgent || '';
    // iPadOS reports itself as a Mac; touch support gives it away.
    var isIPadOS = /Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  }

  global.AmazonLink = {
    parseAmazonUrl: parseAmazonUrl,
    hasAttribution: hasAttribution,
    webUrl: webUrl,
    iosAppUrl: iosAppUrl,
    androidIntentUrl: androidIntentUrl,
    encode: encode,
    decode: decode,
    detectPlatform: detectPlatform
  };
})(window);

let getting1 = null;
let getting2 = null;
let getting3 = null;
let getting4 = null;
let cookie1val = null;
let cookie2val = null;
let cookie3val = null;
let cookie4val = null
let tabid = null
let apicalls = {}

function onGot(item) {
    for (var k in item) {
	var itemk = item[k];
	if (k.includes("markpostattempt")) {
	    var attempttime = parseInt(k.substring(16));
	    var attemptdate = new Date(attempttime);
	    console.log("mark-post-attempt ("+attemptdate.toISOString()+"): xuid="+itemk["xuid"]+" count="+itemk["count"]+" cursor="+itemk["cursor"]);
	}
	else if (k.includes("markpostresult")) {
	    var resulttime = parseInt(k.substring(15));
	    var resultdate = new Date(resulttime);
	    console.log("mark-post-result ("+resultdate.toISOString()+"): xmkhash="+itemk["xmkhash"]+" postid="+itemk["postid"]);
	}
    }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function setItem() {
  //console.log("OK setItem");
}

function setCookie1(cookie) {
    if (cookie) {
	cookie1val = cookie.value;
    }
    getting2.then(setCookie2);
}

function setCookie2(cookie) {
    if (cookie) {
	cookie2val = cookie.value;
    }
    getting3.then(setCookie3);
}

function setCookie3(cookie) {
    if (cookie) {
	cookie3val = cookie.value;
    }
    getting4.then(setCookie4);
}

function setCookie4(cookie) {
    if (cookie) {
	cookie4val = cookie.value;
    }
    chrome.tabs.sendMessage(tabid, {action: "sendcookies", kdt: cookie1val, twid: cookie2val, ct0: cookie3val, auth_token: cookie4val});
}

function getCookies(tab) {
    const tabUrl = tab.url;
    tabid = tab.id;
    getting1 = chrome.cookies.get({
	url: tabUrl,
	name: "kdt",
    });
    getting2 = chrome.cookies.get({
	url: tabUrl,
	name: "twid",
    });
    getting3 = chrome.cookies.get({
	url: tabUrl,
	name: "ct0",
    });
    getting4 = chrome.cookies.get({
	url: tabUrl,
	name: "auth_token",
    });
    getting1.then(setCookie1);
    //console.log("local storage data:")
    let gettingItem = chrome.storage.local.get();
    gettingItem.then(onGot, onError);
}

/*let getActive = browser.tabs.query({
  active: true,
  currentWindow: true,
  });*/

async function markPost (xuid,count,cursor) {
    var curTime = Date.now();
    var attemptObj = {};
    attemptObj["markpostattempt_"+curTime] = {"xuid": xuid, "count": count, "cursor": cursor};
    chrome.storage.local.set(attemptObj).then(setItem, onError);
    const fetchResponse = await fetch("https://xmark.cc/cgi-bin/act?a=markpost&xuid="+encodeURIComponent(xuid)+"&count="+encodeURIComponent(count)+"&cursor="+encodeURIComponent(cursor));
    const responseText = await fetchResponse.text();
    console.log("server responded with "+responseText);
    const response = JSON.parse(responseText);
    var posts = response["posts"];
    for (let p = 0; p<posts.length; p++) {
	var xmkhash = posts[p]["hash"];
	var postid = posts[p]["postid"];
	var munixtime = Date.now();
	var resultObject = {}
	resultObject["markpostresult_"+munixtime] = {"xmkhash": xmkhash, "postid": postid};
	chrome.storage.local.set(resultObject).then(setItem, onError);
    }
}

chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
  if(message.from && message.from === "content"){
    switch(message.action){
    case "getcookies":
	getCookies(sender.tab);
        break;
    case "markpost":
	var xuid = message.xuid;
	var curTime = Date.now();
	if (xuid in apicalls) {
	    if (curTime-apicalls[xuid]["time"]<5000) { // wait 5 seconds before processing another
		//console.log("too fast");
		break;
	    }
	}
	apicalls[xuid] = {"time":curTime}
	markPost(xuid,message.count,message.cursor);
	break;
    }
  }
});

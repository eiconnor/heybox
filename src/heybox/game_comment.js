const { OK_STATE } = require("./constants");
const { tools } = require("../core");

const PATH_BBS_POST = "/bbs/app/api/link/post";
const PATH_BBS_DELETE = "/bbs/app/link/delete";
const PATH_GAME_COMMENTS = "/bbs/app/link/game/comments";

const GAME_COMMENTS_QUERY_BASE = Object.freeze({
  api_version: "4",
  offset: "0",
  limit: "30",
});

const DEFAULT_REVIEW_CONTENT = "好玩推荐游戏体验非常好";

function isOkPayload(payload) {
  return tools.toText(payload?.status) === OK_STATE;
}

async function fetchGameTopicId(appClient, appId) {
  try {
    const resp = await appClient.getJson(PATH_GAME_COMMENTS, {
      ...GAME_COMMENTS_QUERY_BASE,
      appid: String(appId),
    });
    if (!isOkPayload(resp)) return null;
    const links = resp?.result?.links;
    if (!Array.isArray(links) || !links.length) return null;
    const topics = links[0]?.topics;
    if (!Array.isArray(topics) || !topics.length) return null;
    return topics[0]?.topic_id ? String(topics[0].topic_id) : null;
  } catch {
    return null;
  }
}

async function postGameReview(webClient, appId, topicId, score, content) {
  const text = JSON.stringify([{ checked: false, text: content, type: "text" }]);

  const postData = {
    link_tag: "3",
    appid: String(appId),
    score: String(score),
    topic_ids: topicId,
    text: text,
    title: content,
    desc: content,
    draft: "0",
  };

  return webClient.postJson(PATH_BBS_POST, { body: postData });
}

async function deletePost(appClient, linkId) {
  return appClient.postJson(PATH_BBS_DELETE, {}, { link_id: String(linkId) });
}

module.exports = {
  PATH_BBS_POST,
  PATH_BBS_DELETE,
  PATH_GAME_COMMENTS,
  GAME_COMMENTS_QUERY_BASE,
  DEFAULT_REVIEW_CONTENT,
  fetchGameTopicId,
  postGameReview,
  deletePost,
};

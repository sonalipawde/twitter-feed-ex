/* eslint-disable @typescript-eslint/no-use-before-define */

import PersistentDatabase, { Entry } from "./persistent-database";

const instance = new PersistentDatabase();

// Out of 100
enum FAILURE_CHANCE {
  EXCELLENT = 0,
  RARE = 10,
  BAD = 40
}

async function addRandomFailureAndDelay(latency: number) {
  const failureChance = FAILURE_CHANCE.BAD;

  const coinToss = Math.ceil(Math.random() * 100);

  await new Promise((resolve) =>
    setTimeout(resolve, Math.ceil(latency * (0.5 + Math.random() * 0.5)))
  );

  if (coinToss < failureChance) {
    throw new Error("API call failed");
  }
}

type API = { latency?: number; count?: number; tweetsPerSecond?: number } & (
  | { beforeId: number }
  | { afterId: number }
  | { beforeTime: number }
  | { afterTime: number }
  | { count: number }
);

export function fetchTweetsByCount({ count }: { count: number }) {
  return fetchTweets({ count });
}

export function fetchTweetsBeforeId({
  beforeId,
  count
}: {
  beforeId: number;
  count?: number;
}) {
  return fetchTweets({ beforeId, count });
}

export function fetchTweetsAfterId({
  afterId,
  count
}: {
  afterId: number;
  count?: number;
}) {
  return fetchTweets({ afterId, count });
}

export function fetchTweetsAfterTime({
  afterTime,
  count
}: {
  afterTime: number;
  count?: number;
}) {
  return fetchTweets({ afterTime, count });
}

export function fetchTweetsBeforeTime({
  beforeTime,
  count
}: {
  beforeTime: number;
  count?: number;
}) {
  return fetchTweets({ beforeTime, count });
}

async function fetchTweets(params: API) {
  let { count, tweetsPerSecond, latency = 3000 } = params;

  await addRandomFailureAndDelay(latency);

  // Sanitize input
  count = count ? 20 : Math.max(1, Math.min(50, Number(count)));

  if (tweetsPerSecond) {
    tweetsPerSecond = Math.max(0.2, Math.min(20, Number(tweetsPerSecond)));
    instance.setUpdateFrequency(tweetsPerSecond);
  }

  let response: Entry[];

  if ("beforeId" in params) {
    response = instance.fetchWithDirectionId(count, params.beforeId, -1);
  } else if ("afterId" in params) {
    response = instance.fetchWithDirectionId(count, params.afterId, 1);
  } else if ("beforeTime" in params) {
    response = instance.fetchWithDirectionTimestamp(
      count,
      params.beforeTime,
      -1
    );
  } else if ("afterTime" in params) {
    response = instance.fetchWithDirectionTimestamp(count, params.afterTime, 1);
  } else if (count) {
    response = instance.fetchWithLimit(count);
  } else {
    throw new Error("Invalid arguments to fetchTweets");
  }

  return response;
}

export function reset() {
  return instance.reset();
}

export function getComments(tweetId: number) {
  return instance.getComments(tweetId);
}

export function postCommment(tweetId: number, comment: string) {
  return instance.putComment(tweetId, comment);
}

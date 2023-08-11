/**
 * Hello candidate, this is the index file which lands to the solution of your problem.
 * As you can see a rudimentry code has been implemented to load the feeds.
 * You have several API options available at your disposal to achieve your task.
 * They are documented below.
 */
import {
  fetchTweetsByCount,
  fetchTweetsBeforeId,
  fetchTweetsAfterId,
  fetchTweetsAfterTime,
  fetchTweetsBeforeTime
} from "./api";
import "./styles.css";

const app = document.getElementById("app")!;

(async () => {
  try {
    // This returns the lastest 10 tweets
    await fetchTweetsByCount({ count: 10 });

    // Returns tweets posted before a given tweet ID
    await fetchTweetsBeforeId({ beforeId: 1, count: 10 });

    // Returns tweets posted after a given tweet ID
    await fetchTweetsAfterId({ afterId: 1, count: 10 });

    // Returns tweets posted before a given UNIX timestamp
    await fetchTweetsBeforeTime({ beforeTime: 1, count: 10 });

    // Returns tweets posted after a given UNIX timestamp
    await fetchTweetsAfterTime({ afterTime: 1, count: 10 });
  } catch (err) {
    console.log(err);
  }
})();

(async () => {
  try {
    const tweets = await fetchTweetsByCount({ count: 10 });

    let html = "";

    tweets.forEach((tweet) => {
      html += `
          <div class="tweet">
            
            <img src="${tweet.image}" width="50px" />
            <div class="tweet-text">${tweet.text}</div>
          </div>
        `;
    });

    app.innerHTML = html;
  } catch (err) {
    app.innerHTML = `
        <div class="tweet">
          <h3>${err.message}</h3>
        </div>`;
  }
})();

/* eslint-disable @typescript-eslint/no-use-before-define */

import sentences from "./sentences";

const MAX_DB_ENTRIES = 100000;

enum INITIAL_ENTRIES {
  FEW = 5,
  MANY = 100
}

const PREPEND_IDS = false;

class PersistentServer {
  entries: Entry[];
  updateFrequency: number;
  lastSuccessfulFetch: number;
  lastId: number;
  lastEntryTimeStamp?: number;

  constructor() {
    this.entries = [];
    // 5 entries per second
    this.updateFrequency = 1000 / 10;
    this.lastSuccessfulFetch = Date.now();
    this.lastId = 1;
    this.reset();
  }

  reset() {
    this.entries.length = 0;
    this.lastSuccessfulFetch = Date.now();
    this.lastId = 1;
    this.lastEntryTimeStamp = undefined;
    this.addEntriesToDatabase(INITIAL_ENTRIES.MANY);

    return {
      success: true
    };
  }

  fetchWithDirectionId(limit: number, id: number, direction = 1) {
    this.updateDatabaseWithTimePassage();
    return fetchWithIdAndLimit(this.entries, id, limit, direction);
  }

  fetchWithDirectionTimestamp(limit: number, timeStamp: number, direction = 1) {
    this.updateDatabaseWithTimePassage();
    return fetchWithTimeStampAndLimit(
      this.entries,
      timeStamp,
      limit,
      direction
    );
  }

  fetchWithLimit(limit: number) {
    this.updateDatabaseWithTimePassage();
    return this.entries.slice(0, limit);
  }

  setUpdateFrequency(frequency: number) {
    this.updateFrequency = 1000 / frequency;
  }

  getComments(tweetId: number) {
    const tweet = this.entries.find((tweet) => tweet.id === tweetId);

    if (!tweet) {
      return {
        success: false,
        message: "No tweet found with the given id."
      } as const;
    }

    if (!tweet.comments) {
      tweet.comments = getComments();
      return tweet.comments;
    }

    return tweet.comments;
  }

  putComment(tweetId: number, comment: string) {
    const tweet = this.entries.find((tweet) => tweet.id === tweetId);

    if (!tweet) {
      return {
        success: false,
        message: "No tweet found with the given id."
      } as const;
    }

    // Avoid overloading the DB
    const trimmed = comment.substr(0, 1000);

    if (!tweet.comments) {
      tweet.comments = getComments();
    }

    tweet.comments.push(trimmed);

    return tweet.comments;
  }

  private updateDatabaseWithTimePassage() {
    const now = Date.now();
    const timeWaited = now - this.lastSuccessfulFetch;
    const approxEntriesAdded = Math.floor(timeWaited / this.updateFrequency);

    if (approxEntriesAdded > 0) {
      this.lastSuccessfulFetch = now;
      this.addEntriesToDatabase(approxEntriesAdded);
    }
  }

  private addEntriesToDatabase(entries: number) {
    if (!this.lastEntryTimeStamp) {
      this.lastEntryTimeStamp = Date.now() - 1000 * this.updateFrequency;
    }

    const currentTime = Date.now();
    const diffFromLastEntry = currentTime - this.lastEntryTimeStamp;

    const steps = Math.ceil(diffFromLastEntry / entries);

    for (let i = 0; i < entries; i++) {
      if (this.entries.length > MAX_DB_ENTRIES) {
        return;
      }

      const entryTime = Math.min(
        currentTime,
        this.lastEntryTimeStamp + steps * Math.random()
      );

      this.lastEntryTimeStamp = entryTime;

      this.putDatabaseRow(Math.floor(entryTime));
    }
  }

  private putDatabaseRow(timeStamp: number) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];

    this.entries.unshift({
      image: `https://i.pravatar.cc/300?u=${this.lastId}`,
      id: this.lastId,
      text: PREPEND_IDS ? `${this.lastId}. ${sentence}` : sentence,
      username: `Person ${Math.round(1 + Math.random() * 100)}`,
      timeStamp
    });

    this.lastId++;
  }
}

export type Entry = {
  image: string;
  id: number;
  text: string;
  username: string;
  timeStamp: number;
  comments?: string[];
};

// @ts-ignore
function fetchWithBeforeAndAfter(
  entries: Entry[],
  beforeId: number,
  afterId: number
) {
  return entries.filter((entry) => {
    return entry.id < beforeId && entry.id > afterId;
  });
}

function getComments() {
  const commentsToPopulate = Math.max(2, Math.ceil(Math.random() * 20));
  const comments = [];

  for (let i = 0; i <= commentsToPopulate; i++) {
    comments.push(sentences[Math.floor(Math.random() * sentences.length)]);
  }

  return comments;
}

function fetchWithIdAndLimit(
  entries: Entry[],
  id: number,
  limit: number,
  direction: number
) {
  return sliceEntries(
    entries.filter((entry) => {
      if (direction === 1) {
        return entry.id > id;
      } else {
        return entry.id < id;
      }
    }),
    limit,
    direction
  );
}

function fetchWithTimeStampAndLimit(
  entries: Entry[],
  timeStamp: number,
  limit: number,
  direction: number
) {
  return sliceEntries(
    entries.filter((entry) => {
      if (direction === 1) {
        return entry.timeStamp > timeStamp;
      } else {
        return entry.timeStamp < timeStamp;
      }
    }),
    limit,
    direction
  );
}

function sliceEntries(entries: Entry[], limit: number, direction: number) {
  if (direction === 1) {
    return entries.slice(Math.max(0, entries.length - limit), entries.length);
  }

  return entries.slice(0, limit);
}

export default PersistentServer;

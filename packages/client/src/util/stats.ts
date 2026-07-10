import axios from "axios";
import type { TagWithCount } from "./types";
import RandSeed from 'rand-seed';

export interface Stats {
  tagsWithCount: TagWithCount[],
  tagCount: number,
  resourceCount: number,
  unreadResourceCount: number,

  displayedTags(): TagWithCount[]
}

export async function getTagCount(uid : string) {
  let count = 0;

  await axios.get(`/api/${uid}/usertags`)
    .then(response => { count = response.data.length })
    .catch(error => {
      console.log(error);
    });

  return count;
}

export async function getResourceCount(uid : string) {
  let count = 0;

  await axios.get(`/api/${uid}/resources`)
    .then(response => { count = response.data.length })
    .catch(error => {
      console.log(error);
    });

  return count;
}

export async function getTagsWithCount(uid : string) {
  let tagsWithCount : TagWithCount[] = [];

  await axios.get(`/api/${uid}/usertagscount`)
    .then(response => { tagsWithCount = response.data })
    .catch(error => {
      console.log(error);
    });

  return tagsWithCount;
}

function colorTag(tag : TagWithCount) {
  const rand = new RandSeed(tag.tag);

  const r = Math.round(rand.next() * 128 + 96);
  const g = Math.round(rand.next() * 128 + 96);
  const b = Math.round(rand.next() * 128 + 96);

  const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
  tag.color = color;
  return tag;
}

export function colorTags(tags : TagWithCount[]) {
  return tags.map(v => colorTag(v));
}

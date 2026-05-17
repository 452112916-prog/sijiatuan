import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const blogDir = path.resolve("src/content/blog");
const today = new Date().toISOString().slice(0, 10);

const author = {
  name: "多彩美途",
  job: "贵州私家团顾问",
  avatar: "/img/optimized/avatar-none.webp",
};

const topics = [
  {
    slug: "huangguoshu-private-tour-guide",
    title: "黄果树瀑布私家团怎么玩更省心？",
    category: "黄果树攻略",
    tags: ["黄果树", "私家团", "贵州旅行"],
    description: "从出发时间、景区动线、老人孩子节奏和住宿选择，整理黄果树瀑布私家团的实用建议。",
    sections: [
      ["为什么建议早出发", "黄果树瀑布旺季客流集中，私家团最重要的是把入园时间、景区换乘和午餐节奏提前排好。早一点从贵阳或安顺出发，可以避开团队高峰，也能把大瀑布、陡坡塘和天星桥的停留时间分配得更从容。"],
      ["亲子和长辈怎么安排", "带孩子或长辈出行，不建议把每个点都塞满。可以优先保证大瀑布核心景观，再根据体力决定天星桥走精华段还是完整段。私家车接送的好处，是不用在固定集合点等待，累了可以及时调整。"],
      ["住宿和返程建议", "如果只做一日游，建议晚上回贵阳或安顺；如果还要接荔波、小七孔或西江苗寨，可以把黄果树作为第一站，减少第二天长距离折返。"],
    ],
  },
  {
    slug: "libo-xiaoqikong-family-route",
    title: "荔波小七孔亲子游路线怎么安排？",
    category: "亲子旅行",
    tags: ["荔波小七孔", "亲子游", "贵州私家团"],
    description: "适合带孩子游荔波小七孔的路线建议，包含游览顺序、体力分配和住宿选择。",
    sections: [
      ["先看水色，再留体力", "小七孔的精华在水色、瀑布和森林步道。亲子游可以把卧龙潭、翠谷瀑布、小七孔古桥等轻松好看的点放在前半天，避免孩子下午体力下降后还要赶路。"],
      ["不要把大小七孔塞太满", "很多游客第一次来荔波会想一天走完大小七孔，但带孩子时更建议慢一点。与其赶景点，不如把拍照、玩水和休息时间留足，体验感会明显更好。"],
      ["私家团适合哪些家庭", "如果同行有老人、低龄儿童或行李较多，私家团可以根据当天体力及时调整，不必跟着固定团队节奏走。"],
    ],
  },
  {
    slug: "xijiang-miao-village-night-view",
    title: "西江千户苗寨夜景怎么拍更好看？",
    category: "摄影旅行",
    tags: ["西江千户苗寨", "夜景", "摄影"],
    description: "整理西江千户苗寨夜景拍摄机位、入住建议和错峰游览思路。",
    sections: [
      ["住宿位置很关键", "西江千户苗寨的夜景体验和住宿位置关系很大。想看全景可以选择视野较好的半山客栈，想轻松逛街则住在主街附近更方便。私家团通常会根据行李、老人孩子和拍摄需求来建议区域。"],
      ["拍夜景别只等天黑", "最适合拍照的时间往往是蓝调时刻，也就是天色还没完全黑、寨子灯光刚亮的时候。这时天空还有层次，吊脚楼灯光也更柔和。"],
      ["第二天早晨值得留一会儿", "很多人看完夜景就走，其实清晨的苗寨更安静，适合拍人像、街巷和炊烟。时间允许的话，可以把返程放到早餐后。"],
    ],
  },
  {
    slug: "guizhou-private-tour-avoid-pitfalls",
    title: "第一次来贵州私家团，哪些坑要提前避开？",
    category: "出行避坑",
    tags: ["贵州私家团", "出行建议", "避坑"],
    description: "面向第一次来贵州的外地游客，整理路线、车程、住宿和景区节奏上的避坑建议。",
    sections: [
      ["不要只看地图距离", "贵州山地多，很多目的地看起来距离不远，实际车程会受高速、山路和景区换乘影响。规划私家团时要看真实车程，而不是只看直线距离。"],
      ["酒店不要频繁更换", "如果每天都换城市、换酒店，行李和路程会消耗很多体力。家庭和长辈出游更适合少换酒店，把重点景区串得顺一点。"],
      ["预算要看包含内容", "私家团报价要看是否包含车辆、司机、导游、门票、酒店和接送站。只比较一个总价，很容易忽略服务差异。"],
    ],
  },
  {
    slug: "fanjingshan-weather-and-route",
    title: "梵净山行程怎么安排更稳妥？",
    category: "梵净山攻略",
    tags: ["梵净山", "贵州旅行", "行程安排"],
    description: "梵净山受天气影响较大，整理门票、天气、住宿和路线安排上的实用建议。",
    sections: [
      ["天气比计划更重要", "梵净山景观受天气影响明显，云雾、降雨和大风都会影响体验。行程里最好预留一定弹性，不要把梵净山安排在必须当天完成的紧张节点上。"],
      ["提前确认入园方式", "旺季门票和索道票紧张，建议提前确认预约情况。私家团可以把出发时间、取票和索道排队预留得更充分。"],
      ["和铜仁方向顺路安排", "如果还想去镇远、西江或贵阳，梵净山的位置需要认真串线，避免来回折返。"],
    ],
  },
];

function slugifyDateTopic(topic, offset) {
  return `${today}-${topic.slug}${offset ? `-${offset}` : ""}`;
}

function pickTopic(existingFiles) {
  const index = Math.floor(Date.now() / 86400000) % topics.length;

  for (let i = 0; i < topics.length; i += 1) {
    const topic = topics[(index + i) % topics.length];
    const base = slugifyDateTopic(topic, 0);
    if (!existingFiles.has(`${base}.mdx`)) return { topic, slug: base };
  }

  const topic = topics[index];
  let offset = 1;
  while (existingFiles.has(`${slugifyDateTopic(topic, offset)}.mdx`)) {
    offset += 1;
  }
  return { topic, slug: slugifyDateTopic(topic, offset) };
}

function renderArticle(topic) {
  const body = topic.sections
    .map(([heading, text]) => `## ${heading}\n\n${text}\n\n${expandParagraph(topic.title, heading)}`)
    .join("\n\n");

  return `---
title: "${topic.title}"
cover: "/img/generated/xijiang-miao-village.webp"
date: "${today}"
category: "${topic.category}"
tags:
${topic.tags.map((tag) => `  - ${tag}`).join("\n")}
readTime: 5
description: "${topic.description}"
author:
  name: "${author.name}"
  job: "${author.job}"
  avatar: "${author.avatar}"
---

${topic.description}

${body}

## 写在最后

贵州适合慢慢玩，也适合根据人数、体力和兴趣重新定制路线。多彩美途会结合抵离城市、同行成员、酒店偏好和预算，帮游客把车程、景区顺序和休息时间安排得更顺。第一次来贵州，不必把每个热门景点都塞进同一次旅行，选对节奏往往比多打卡几个点更重要。
`;
}

function expandParagraph(title, heading) {
  return `围绕“${title}”这个主题，${heading}不只是一个单独环节，还会影响当天后续的车程、用餐和休息。外地游客来贵州，最容易低估山地交通和景区换乘时间。提前把这些细节确认清楚，行程会轻松很多，也更适合老人、孩子或第一次来贵州的朋友。`;
}

mkdirSync(blogDir, { recursive: true });

const existingFiles = new Set(
  readdirSync(blogDir).filter((file) => file.toLowerCase().endsWith(".mdx")),
);
const { topic, slug } = pickTopic(existingFiles);
const filePath = path.join(blogDir, `${slug}.mdx`);

if (existsSync(filePath)) {
  console.log(`Skipped, article already exists: ${filePath}`);
  process.exit(0);
}

writeFileSync(filePath, renderArticle(topic), "utf8");
console.log(`Created ${filePath}`);

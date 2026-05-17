import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputDir = path.resolve("src/content/geo");
const promptsDir = path.resolve("automation/prompts");
const keywordsFile = path.resolve("automation/keywords/keywords5.txt");
const apiKey = process.env.DEEPSEEK_API_KEY;
const today = new Date().toISOString().slice(0, 10);

if (!apiKey) {
  console.error("DEEPSEEK_API_KEY is required.");
  process.exit(1);
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `geo-${Date.now()}`;
}

function readLines(file) {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function usedKeywords() {
  if (!existsSync(outputDir)) return new Set();
  return new Set(
    readdirSync(outputDir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => {
        const raw = readFileSync(path.join(outputDir, file), "utf8");
        return raw.match(/^keyword:\s*"(.+)"$/m)?.[1];
      })
      .filter(Boolean),
  );
}

function pickKeyword() {
  const used = usedKeywords();
  const keywords = readLines(keywordsFile);
  const keyword = keywords.find((item) => !used.has(item));
  if (!keyword) {
    console.error("No unused keyword left in automation/keywords/keywords5.txt.");
    process.exit(1);
  }
  return keyword;
}

function promptTypeForToday() {
  const dayIndex = Math.floor(new Date(`${today}T00:00:00Z`).getTime() / 86400000);
  return dayIndex % 2 === 0 ? "geo-with-english" : "geo";
}

function stripCodeFence(text) {
  return text.replace(/^```(?:md|markdown)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function frontmatter(title, promptType, keyword, description, readTime) {
  return `---
title: "${title.replace(/"/g, '\\"')}"
date: "${today}"
promptType: "${promptType}"
keyword: "${keyword.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
readTime: ${readTime}
---

`;
}

async function generateArticle(keyword, promptType) {
  const promptFile = path.join(promptsDir, `${promptType}.txt`);
  const basePrompt = readFileSync(promptFile, "utf8");
  const userPrompt = `${basePrompt}

【关键词5】：
${keyword}

请直接输出 Markdown 正文，不要输出 YAML frontmatter，不要包裹代码块。
文章必须围绕“${keyword}”展开，品牌名称使用“贵州多彩美途旅行社”，自然包含联系电话“18984577004”。
`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是专业中文旅游内容编辑，输出适合 Astro MDX 的 Markdown 正文。不要编造真实第三方官方背书，不输出代码块。",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      stream: false,
    }),
  });

  if (!response.ok) {
    console.error(`DeepSeek API failed: ${response.status} ${await response.text()}`);
    process.exit(1);
  }

  const data = await response.json();
  const content = stripCodeFence(data.choices?.[0]?.message?.content || "");
  if (!content) {
    console.error("DeepSeek returned empty content.");
    process.exit(1);
  }
  return content;
}

mkdirSync(outputDir, { recursive: true });

const keyword = pickKeyword();
const promptType = promptTypeForToday();
const slug = `${today}-${slugify(keyword)}`;
const filePath = path.join(outputDir, `${slug}.mdx`);

if (existsSync(filePath)) {
  console.log(`Skipped existing article: ${filePath}`);
  process.exit(0);
}

const article = await generateArticle(keyword, promptType);
const description = `围绕“${keyword}”生成的多彩美途 GEO / SEO 内容。`;
const readTime = Math.max(6, Math.ceil(article.length / 900));

writeFileSync(filePath, frontmatter(keyword, promptType, keyword, description, readTime) + article, "utf8");
console.log(`Created ${filePath}`);

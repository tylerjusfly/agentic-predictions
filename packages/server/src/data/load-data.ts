const path = require("path");
const fs = require("fs");

export function generateTextsFromData() {
  const filePath = path.join(__dirname, "2020-2021.json");

  const jsonStr = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(jsonStr);

  const texts = [];

  const season = data.season;
  for (const score of data.scores) {
    const text = `${season} | ${score.date} | ${score.homeTeam} ${score.homeScore} - ${score.awayScore} ${score.awayTeam} | Source: ${score.source}`;
    texts.push(text);
  }
  return texts;
}


import { runUpdateResultsJob } from "@/jobs/updateResultsJob";
import { NextApiRequest, NextApiResponse } from "next";
import cron from "node-cron";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const RUN_DAILY_AT_10AM = "0 10 * * *";

  cron.schedule(RUN_DAILY_AT_10AM, runUpdateResultsJob);

  res.status(200).send("Scheduled job has been set up.");
}

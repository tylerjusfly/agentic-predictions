import { siPremierleague, siFalcon } from "simple-icons";

export function PremierLeagueIcon({
  width = 28,
  height = 28,
  className = "",
}) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ff3f00" width={width} height={height} className={className}>
      <title>{siPremierleague.title}</title>
      <path d={siPremierleague.path} />
    </svg>
  );
}
export function FalconIcon({
  width = 28,
  height = 28,
  className = "mr-2",
}) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className}>
      <title>{siFalcon.title}</title>
      <path d={siFalcon.path} />
    </svg>
  );
}
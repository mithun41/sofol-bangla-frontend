// src/constants/starTitles.js
export const STAR_TITLES = {
  0: "Member",
  1: "Member",
  2: "Member",
  3: "Member",
  4: "Leader",
  5: "Sales Officer",
  6: "Sr. Sales Officer",
  7: "Incharge",
  8: "Manager",
};

export const getStarTitle = (level) => STAR_TITLES[level] ?? "Member";
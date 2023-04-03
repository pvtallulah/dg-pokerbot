export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const avatarNames = [
  "Jorden Laws",
  "Francis White",
  "Miya Phan",
  "Darius Argueta",
  "Helena Haley",
  "Darryl Earle",
  "Shanya Ireland",
  "Lonnie Torres",
  "Sara Brooks",
  "Aubree Murillo",
];

export const randomizeAvatarName = () => {
  return avatarNames[Math.floor(Math.random() * avatarNames.length)];
};

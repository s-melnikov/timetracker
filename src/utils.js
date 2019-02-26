import { DAYS, STORAGE } from "./constants";

export const toTimeString = time => dateToFormatString(time, "H:i");

export const toDateString = time => dateToFormatString(time, "m.d");

export const dateToFormatString = (time, format = "Y.m.d H:i:s") => {
  let $ = new Date(time);
  if (isNaN($)) return $;
  let Y = `${$.getFullYear()}`;
  let m = `${$.getMonth() + 1}`;
  let d = `${$.getDate()}`;
  let H = `${$.getHours()}`;
  let i = `${$.getMinutes()}`;
  let s = `${$.getSeconds()}`;
  let D = `${$.getDay()}`;
  return format
    .replace("Y", Y)
    .replace("m", m[1] ? m : `0${m}`)
    .replace("d", d[1] ? d : `0${d}`)
    .replace("H", H[1] ? H : `0${H}`)
    .replace("i", i[1] ? i : `0${i}`)
    .replace("s", s[1] ? s : `0${s}`)
    .replace("D", DAYS[D]);
};

export const timeSpetnToString = time => {
  let t = Math.floor(time / 1000);
  let m = (t = Math.floor(t / 60)) % 60;
  let h = (t = Math.floor(t / 60));
  if (m < 10) m = "0" + m;
  return `${h}h ${m}m`;
};

export const ls = (key, val) => {
  if (val === null) {
    return localStorage.removeItem(key);
  }
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE));
  } catch (e) {};
  if (!data) data = {};
  if (val) {
    data[key] = val;
    return localStorage.setItem(STORAGE, JSON.stringify(data));
  }
  return data && data[key];
}

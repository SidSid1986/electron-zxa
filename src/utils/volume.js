/*
 * @Author: Sid Li
 * @Date: 2025-12-05 17:29:56
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-05 17:29:59
 * @FilePath: \ai\src\utils\volume.js
 * @Description: 
 */
const loudness = window.require("loudness");

// 设置音量为特定值
function setVol(a = 45) {
  loudness.setVolume(a);
  dismuted();
}
// 获取当前音量
function getVol() {
  return loudness.getVolume();
}
// 设置和取消静音
async function setmuted(a = true) {
  if (a) {
    // console.log(a, "取消静音");
    //   取消静音
    await loudness.setMuted(false);
    return false;
  } else {
    // console.log(a, "设置静音");
    //   设置静音
    await loudness.setMuted(true);
    return true;
  }
}

module.exports = {
  setVol,
  getVol,
  setmuted,
};

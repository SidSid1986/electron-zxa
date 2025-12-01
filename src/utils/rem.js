// src/utils/rem.js
export function setupRemAdaptation() {
  const designWidth = 1920; // 设计稿宽度
  const designHeight = 1080; // 设计稿高度（1920×1080 是常见 PC 比例）
  const designRootFontSize = 192; // 设计稿对应的根字体大小

  function setRootFontSize() {
    // 获取当前屏幕的可视宽度和高度（排除滚动条、导航栏）
    const currentWidth = document.documentElement.clientWidth || window.innerWidth;
    const currentHeight = document.documentElement.clientHeight || window.innerHeight;

    // 关键：按「高度比例」计算根字体（优先保证纵向视觉大小）
    // 高度比例 = 当前高度 / 设计稿高度
    const heightRatio = currentHeight / designHeight;
    // 宽度比例 = 当前宽度 / 设计稿宽度
    const widthRatio = currentWidth / designWidth;

    // 取「高度比例」和「宽度比例」的最小值（避免元素超出屏幕）
    const minRatio = Math.min(heightRatio, widthRatio);
    // 计算根字体大小（按最小比例缩放，确保不超出屏幕）
    let fontSize = minRatio * designRootFontSize;

    // 限制根字体的最小/最大值（关键：确保 1200 设备字体不太小）
    const minFontSize = 140; // 最小根字体（1200设备上会触发这个值）
    const maxFontSize = 192; // 最大根字体（1920设备上的原生大小）
    fontSize = Math.max(Math.min(fontSize, maxFontSize), minFontSize);

    // 设置根字体
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  // 初始化执行
  setRootFontSize();
  // 监听窗口缩放（横向/纵向拖拽都触发）
  window.addEventListener("resize", setRootFontSize);

  return { setRootFontSize };
}
// 옵션 색상 상수
export const OPTION_COLORS = [
  "#6366F1", // indigo - 첫 번째 옵션
  "#71717A", // zinc - 두 번째 옵션
  "#818CF8", // indigo light - 세 번째 이후 옵션
  "#A78BFA", // violet
  "#F472B6", // pink
  "#34D399", // emerald
];

// 옵션 인덱스에 따른 색상 반환
export function getOptionColor(index: number): string {
  if (index < OPTION_COLORS.length) {
    return OPTION_COLORS[index];
  }
  // 색상 배열을 순환
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

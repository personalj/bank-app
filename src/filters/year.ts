export const yearFilter = (value: number) => {
  if (value == 1 ) {
    return 'год';
  }
  if (value <= 4) {
    return 'года';
  }
  return 'лет';
}
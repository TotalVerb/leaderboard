export function fadeColor(color: string, opacity=0.4) {
  let [red, green, blue] = [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ]
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

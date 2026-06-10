import chalk from "chalk";

export const log = {
  server: (m: string) => console.log(chalk.bgGreen.black(" SERVER ") + " " + m),
  conn: (m: string) => console.log(chalk.cyan("○ conn ") + chalk.dim(m)),
  room: (m: string) => console.log(chalk.magenta("▣ room ") + m),
  user: (m: string) => console.log(chalk.blue("◍ user ") + m),
  wait: (m: string) => console.log(chalk.yellow("⧗ wait ") + m),
  warn: (m: string) => console.log(chalk.yellow.bold("! warn ") + m),
  error: (m: string, e?: unknown) =>
    console.error(chalk.red.bold("✕ error ") + m, e ?? ""),
};

/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "ToDo";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  assetPrefix: isGithubActions ? `/${repoName}/` : undefined,
  basePath: isGithubActions ? `/${repoName}` : undefined
};

export default nextConfig;


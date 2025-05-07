import { Repository, FilterOptions } from '../../types/github';

/**
 * 过滤GitHub仓库
 * @param repositories 仓库列表
 * @param options 过滤选项
 * @returns 过滤后的仓库列表
 */
export function filterRepositories(repositories: Repository[], options: FilterOptions): Repository[] {
  let filteredRepos = [...repositories];

  // 按主题过滤
  if (options.topics && options.topics.length > 0) {
    filteredRepos = filteredRepos.filter((repo) => {
      const repoText = `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase();

      return options.topics!.some((topic) => repoText.includes(topic.toLowerCase()));
    });
  }

  // 限制结果数量
  return filteredRepos.slice(0, options.limit);
}

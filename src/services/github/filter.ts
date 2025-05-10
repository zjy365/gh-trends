import { Repository, FilterOptions } from '../../types/github'

/**
 * Filter GitHub repositories
 * @param repositories repositories list
 * @param options filter options
 * @returns filtered repositories list
 */
export function filterRepositories(
  repositories: Repository[],
  options: FilterOptions
): Repository[] {
  let filteredRepos = [...repositories]

  if (options.topics && options.topics.length > 0) {
    filteredRepos = filteredRepos.filter((repo) => {
      if (repo.topics && repo.topics.length > 0) {
        return options.topics!.some((topic) =>
          repo.topics!.some((repoTopic) => repoTopic.toLowerCase() === topic.toLowerCase())
        )
      }

      return false
    })
  }

  return filteredRepos.slice(0, options.limit)
}

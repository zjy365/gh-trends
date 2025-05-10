import { test, describe, beforeEach, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import axios from 'axios'
import * as cheerio from 'cheerio'

import { getTrendingRepos } from '../src/services/github/scraper'
import { Repository, TrendOptions } from '../src/types/github'
import * as cache from '../src/utils/cache'

// Mock axios
const mockAxiosGet = mock.method(axios, 'get', async () => {
  return {
    data: getMockHtml()
  }
})

// Mock cache module
const mockCacheGet = mock.method(cache, 'cacheGet', () => null) // Default return null, indicating cache miss
const mockCacheSet = mock.method(cache, 'cacheSet', () => {})

describe('GitHub Trending Scraper', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mock.reset()
  })

  afterEach(() => {
    // Ensure all mocks are restored
    mock.restoreAll()
  })

  test('getTrendingRepos should return parsed repository list', async () => {
    // Arrange: Set up a mock HTML response
    mock.method(axios, 'get', async () => {
      return {
        data: getMockHtml()
      }
    })

    // Act
    const options: TrendOptions = { language: 'javascript', since: 'daily' }
    const repositories = await getTrendingRepos(options)

    // Assert
    assert.ok(Array.isArray(repositories), 'Return value should be an array')
    assert.ok(repositories.length > 0, 'Should return at least one repository')
    assert.equal(repositories[0].name, 'mock-repo', 'Should return correct repository name')
    assert.equal(repositories[0].author, 'mock-author', 'Should return correct author')
    assert.equal(repositories[0].language, 'JavaScript', 'Should return correct language')
  })

  test('getTrendingRepos should use cached data if available', async () => {
    // Arrange: Mock cache hit
    const mockCachedData: Repository[] = [
      {
        name: 'cached-repo',
        author: 'cached-author',
        url: 'https://github.com/cached-author/cached-repo',
        description: 'This is a cached repo',
        language: 'TypeScript',
        stars: 1000,
        forks: 100,
        starsInPeriod: 50,
        rank: 1
      }
    ]

    mock.method(cache, 'cacheGet', () => mockCachedData)

    // Act
    const options: TrendOptions = { language: 'typescript', since: 'daily' }
    const repositories = await getTrendingRepos(options)

    // Assert
    assert.deepStrictEqual(repositories, mockCachedData, 'Should return cached data')

    // Verify axios.get was not called
    assert.equal(
      mockAxiosGet.mock.callCount(),
      0,
      'Should not call axios.get when cache is available'
    )
  })

  test('getTrendingRepos should handle errors correctly', async () => {
    // Arrange: Mock axios to throw an error
    mock.method(axios, 'get', async () => {
      throw new Error('Network error')
    })

    // Act & Assert
    const options: TrendOptions = { language: 'python', since: 'weekly' }

    await assert.rejects(
      async () => await getTrendingRepos(options),
      (error) => {
        assert.ok(error instanceof Error)
        assert.ok(
          error.message.includes('获取趋势仓库失败'),
          'Error message should contain correct prefix'
        )
        assert.ok(
          error.message.includes('Network error'),
          'Error message should contain original error'
        )
        return true
      },
      'Should throw an error containing the original error message'
    )
  })

  test('getTrendingRepos should build the URL correctly', async () => {
    // Arrange: Create a new mock to check call parameters
    const urlCheckMock = mock.method(axios, 'get', async (url) => {
      return { data: getMockHtml() }
    })

    // Act
    const options1: TrendOptions = { language: 'go', since: 'monthly' }
    await getTrendingRepos(options1)

    // Assert
    assert.equal(urlCheckMock.mock.callCount(), 1, 'Should call axios.get once')
    assert.equal(
      urlCheckMock.mock.calls[0].arguments[0],
      'https://github.com/trending/go?since=monthly',
      'Should build the correct URL'
    )

    // Reset mock
    mock.reset()

    // Create a new mock for the second test
    const urlCheckMock2 = mock.method(axios, 'get', async (url) => {
      return { data: getMockHtml() }
    })

    // Test with no language parameter
    const options2: TrendOptions = { since: 'weekly' }
    await getTrendingRepos(options2)

    // Assert
    assert.equal(urlCheckMock2.mock.callCount(), 1, 'Should call axios.get once')
    assert.equal(
      urlCheckMock2.mock.calls[0].arguments[0],
      'https://github.com/trending?since=weekly',
      'Should build the correct URL without language parameter'
    )
  })

  test('getTrendingRepos should set cache on success', async () => {
    // Act
    const options: TrendOptions = { language: 'rust', since: 'daily' }
    await getTrendingRepos(options)

    // Assert
    assert.equal(mockCacheSet.mock.callCount(), 1, 'Should call cacheSet once')
    assert.equal(
      mockCacheSet.mock.calls[0].arguments[0],
      'trending:rust:daily',
      'Cache key should be correct'
    )
    assert.ok(
      Array.isArray(mockCacheSet.mock.calls[0].arguments[1]),
      'Cached data should be an array'
    )
    assert.equal(mockCacheSet.mock.calls[0].arguments[2], 3600, 'Cache time should be 3600 seconds')
  })
})

// Helper function: Generate mock HTML response
function getMockHtml(): string {
  return `
    <html>
      <body>
        <main>
          <div class="Box">
            <article class="Box-row">
              <h2 class="h3">
                <a href="/mock-author/mock-repo">mock-author/mock-repo</a>
              </h2>
              <p>This is a mock repository description</p>
              <div class="f6 color-fg-muted mt-2">
                <span class="d-inline-block ml-0 mr-3">
                  <span class="repo-language-color" style="background-color:#f1e05a"></span>
                  <span itemprop="programmingLanguage">JavaScript</span>
                </span>
                <a class="Link--muted d-inline-block mr-3" href="/mock-author/mock-repo/stargazers">
                  <svg>...</svg>
                  1.2k
                </a>
                <a class="Link--muted d-inline-block mr-3" href="/mock-author/mock-repo/forks">
                  <svg>...</svg>
                  300
                </a>
                <span class="d-inline-block float-sm-right">
                  100 stars today
                </span>
              </div>
            </article>
          </div>
        </main>
      </body>
    </html>
  `
}

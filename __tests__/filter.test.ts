import { test, describe } from 'node:test'
import assert from 'node:assert'

import { filterRepositories } from '../src/services/github/filter'
import { Repository, FilterOptions } from '../src/types/github'

describe('GitHub Repository Filter', () => {
  // Mock repository data
  const mockRepositories: Repository[] = [
    {
      name: 'react',
      author: 'facebook',
      rank: 1,
      url: 'https://github.com/facebook/react',
      description: 'A JavaScript library for building user interfaces',
      language: 'JavaScript',
      stars: 200000,
      forks: 40000,
      starsInPeriod: 200,
      topics: ['javascript', 'frontend', 'ui']
    },
    {
      name: 'vue',
      author: 'vuejs',
      rank: 2,
      url: 'https://github.com/vuejs/vue',
      description: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework',
      language: 'JavaScript',
      stars: 190000,
      forks: 30000,
      starsInPeriod: 180,
      topics: ['javascript', 'frontend', 'ui']
    },
    {
      name: 'tensorflow',
      author: 'tensorflow',
      rank: 3,
      url: 'https://github.com/tensorflow/tensorflow',
      description: 'An open source machine learning framework',
      language: 'C++',
      stars: 160000,
      forks: 85000,
      starsInPeriod: 150,
      topics: ['machine learning', 'ai', 'deep learning']
    },
    {
      name: 'pytorch',
      author: 'pytorch',
      rank: 4,
      url: 'https://github.com/pytorch/pytorch',
      description: 'Tensors and Dynamic neural networks in Python',
      language: 'C++',
      stars: 55000,
      forks: 14000,
      starsInPeriod: 100,
      topics: ['machine learning', 'ai', 'deep learning']
    },
    {
      name: 'rust',
      author: 'rust-lang',
      rank: 5,
      url: 'https://github.com/rust-lang/rust',
      description: 'A language empowering everyone to build reliable and efficient software',
      language: 'Rust',
      stars: 70000,
      forks: 9000,
      starsInPeriod: 80,
      topics: ['programming-language', 'systems']
    }
  ]

  test('should limit results according to limit option', () => {
    const options: FilterOptions = { limit: 3 }
    const filtered = filterRepositories(mockRepositories, options)

    assert.equal(filtered.length, 3, 'Should return 3 repositories')
    assert.equal(filtered[0].name, 'react', 'First one should be react')
    assert.equal(filtered[2].name, 'tensorflow', 'Third one should be tensorflow')
  })

  test('should filter correctly by topics', () => {
    const options: FilterOptions = {
      limit: 10,
      topics: ['machine learning']
    }
    const filtered = filterRepositories(mockRepositories, options)

    assert.equal(filtered.length, 2, 'Should return 2 repositories')
    assert.equal(filtered[0].name, 'tensorflow', 'Should include tensorflow')
    assert.equal(filtered[1].name, 'pytorch', 'Should include pytorch')
  })

  test('topic filtering should be case insensitive', () => {
    const options: FilterOptions = {
      limit: 10,
      topics: ['JAVASCRIPT']
    }
    const filtered = filterRepositories(mockRepositories, options)

    assert.equal(filtered.length, 2, 'Should return 2 repositories')
    assert.equal(filtered[0].name, 'react', 'Should include react')
    assert.equal(filtered[1].name, 'vue', 'Should include vue')
  })

  test('should apply both limit and topics filters', () => {
    const options: FilterOptions = {
      limit: 1,
      topics: ['machine learning']
    }
    const filtered = filterRepositories(mockRepositories, options)

    assert.equal(filtered.length, 1, 'Should return 1 repository')
    assert.equal(filtered[0].name, 'tensorflow', 'Should only include tensorflow')
  })

  test('empty repository list should return empty results', () => {
    const options: FilterOptions = { limit: 5 }
    const filtered = filterRepositories([], options)

    assert.equal(filtered.length, 0, 'Should return an empty array')
  })

  test('should return empty results when no topics match', () => {
    const options: FilterOptions = {
      limit: 10,
      topics: ['nonexistent-topic']
    }
    const filtered = filterRepositories(mockRepositories, options)

    assert.equal(filtered.length, 0, 'Should return an empty array')
  })
})
